import React, { useState, useEffect, useRef, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import EmptyState from '../components/shared/EmptyState';

function getConversationId(a, b) {
  return [a, b].sort().join('_');
}

export default function Messages() {
  const toParam = new URLSearchParams(window.location.search).get('to');
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [newRecipient, setNewRecipient] = useState(toParam || '');
  const [supabaseMessages, setSupabaseMessages] = useState(null);
  const [fetchingSupabase, setFetchingSupabase] = useState(false);
  const msgEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch from Supabase on page load
  useEffect(() => {
    const fetchSupabaseData = async () => {
      setFetchingSupabase(true);
      try {
        const response = await base44.functions.invoke('fetchMessages', {});
        const messages = response.data?.messages || [];
        // Transform Supabase messages to match expected format
        const transformedMessages = messages.map(msg => ({
          id: msg.id,
          sender_email: msg.sender_email,
          receiver_email: msg.receiver_email,
          sender_name: msg.sender_name || '',
          content: msg.content,
          read: msg.read || false,
          conversation_id: msg.conversation_id,
          created_date: msg.created_at,
        }));
        setSupabaseMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages from Supabase:', error);
        setSupabaseMessages([]);
      } finally {
        setFetchingSupabase(false);
      }
    };
    fetchSupabaseData();
  }, []);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  // Fetch all profiles to resolve names
  const { data: candidateProfiles = [] } = useQuery({
    queryKey: ['all-candidate-profiles'],
    queryFn: () => base44.entities.CandidateProfile.list(),
  });
  const { data: companyProfiles = [] } = useQuery({
    queryKey: ['all-company-profiles'],
    queryFn: () => base44.entities.CompanyProfile.list(),
  });

  const profileMap = useMemo(() => {
    const map = {};
    candidateProfiles.forEach(p => { map[p.user_email] = { name: p.full_name, subtitle: p.job_title }; });
    companyProfiles.forEach(p => { map[p.user_email] = { name: p.recruiter_name || p.company_name, subtitle: p.company_name }; });
    return map;
  }, [candidateProfiles, companyProfiles]);

  const { data: dbMessages = [], isLoading: isLoadingDb } = useQuery({
    queryKey: ['all-messages', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 200);
      const received = await base44.entities.Message.filter({ receiver_email: user.email }, '-created_date', 200);
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  // Use Supabase data if available, otherwise use Base44 messages
  const allMessages = supabaseMessages && supabaseMessages.length > 0 ? supabaseMessages : dbMessages;
  const isLoading = isLoadingDb || fetchingSupabase;

  // Group into conversations
  const conversations = React.useMemo(() => {
    const convMap = {};
    allMessages.forEach(m => {
      const otherId = m.sender_email === user?.email ? m.receiver_email : m.sender_email;
      const otherName = m.sender_email === user?.email ? '' : m.sender_name;
      const convId = m.conversation_id || getConversationId(m.sender_email, m.receiver_email);
      if (!convMap[convId]) convMap[convId] = { id: convId, other_email: otherId, other_name: otherName, messages: [], last_date: m.created_date, unread: 0 };
      convMap[convId].messages.push(m);
      if (!otherName && m.sender_name && m.sender_email !== user?.email) convMap[convId].other_name = m.sender_name;
      if (new Date(m.created_date) > new Date(convMap[convId].last_date)) convMap[convId].last_date = m.created_date;
      if (m.receiver_email === user?.email && !m.read) convMap[convId].unread++;
    });
    return Object.values(convMap).sort((a, b) => new Date(b.last_date) - new Date(a.last_date));
  }, [allMessages, user?.email]);

  // Auto-select conversation from URL param
  useEffect(() => {
    if (toParam && user?.email && !selectedConv) {
      const convId = getConversationId(user.email, toParam);
      setSelectedConv(convId);
    }
  }, [toParam, user, selectedConv]);

  const activeConv = conversations.find(c => c.id === selectedConv);

  // Mark messages as read
  useEffect(() => {
    if (activeConv) {
      activeConv.messages.forEach(m => {
        if (m.receiver_email === user?.email && !m.read) {
          base44.entities.Message.update(m.id, { read: true });
        }
      });
    }
  }, [activeConv, user?.email]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages?.length]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const recipientEmail = activeConv?.other_email || newRecipient;
      if (!recipientEmail || !newMsg.trim()) return;
      await base44.entities.Message.create({
        sender_email: user.email,
        receiver_email: recipientEmail,
        sender_name: user.full_name,
        content: newMsg.trim(),
        conversation_id: getConversationId(user.email, recipientEmail),
      });
    },
    onSuccess: () => {
      setNewMsg('');
      setNewRecipient('');
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6" style={{ minHeight: '60vh' }}>
          {/* Conversations list */}
          <Card className="p-4 overflow-y-auto max-h-[70vh]">
            {/* New conversation */}
            {!activeConv && toParam && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 mb-3">
                <p className="text-xs text-indigo-600 font-medium">New conversation with</p>
                <p className="text-sm text-slate-900 font-medium">{toParam}</p>
              </div>
            )}

            {conversations.length === 0 && !toParam ? (
              <p className="text-sm text-slate-500 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-1">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConv === conv.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            {profileMap[conv.other_email]?.name || conv.other_name || conv.other_email}
                          </p>
                          {profileMap[conv.other_email]?.subtitle && (
                            <p className="text-xs text-indigo-500 truncate">{profileMap[conv.other_email].subtitle}</p>
                          )}
                        <p className="text-xs text-slate-500 truncate">{conv.messages[conv.messages.length - 1]?.content}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">{conv.unread}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Chat */}
          <Card className="lg:col-span-2 flex flex-col max-h-[70vh]">
            {(activeConv || toParam) ? (
              <>
                <div className="p-4 border-b">
                  <p className="font-medium text-slate-900">
                    {profileMap[activeConv?.other_email]?.name || activeConv?.other_name || activeConv?.other_email || toParam}
                  </p>
                  {activeConv && profileMap[activeConv?.other_email]?.subtitle && (
                    <p className="text-xs text-indigo-500">{profileMap[activeConv.other_email].subtitle}</p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(activeConv?.messages || []).map(m => (
                    <div key={m.id} className={`flex ${m.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                        m.sender_email === user?.email
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-900 rounded-bl-md'
                      }`}>
                        <p>{m.content}</p>
                        <p className={`text-xs mt-1 ${m.sender_email === user?.email ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {formatDistanceToNow(new Date(m.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={msgEndRef} />
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      placeholder="Type a message..."
                      className="rounded-xl"
                      onKeyDown={e => e.key === 'Enter' && sendMutation.mutate()}
                    />
                    <Button onClick={() => sendMutation.mutate()} disabled={!newMsg.trim()} size="icon" className="rounded-xl">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the list or start a new one" />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}