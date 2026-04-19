import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  job_posted: '📋',
  job_approved: '✅',
  job_rejected: '❌',
  application_submitted: '📩',
  message_received: '💬',
};

export default function NotificationBell({ userEmail }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 30),
    enabled: !!userEmail,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userEmail] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userEmail] }),
  });

  const handleClick = (n) => {
    if (!n.read) markReadMutation.mutate(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="font-semibold text-slate-900 text-sm">Notifications</p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{typeIcons[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm font-medium truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        </div>
                        {n.body && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>}
                        {n.created_date && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}