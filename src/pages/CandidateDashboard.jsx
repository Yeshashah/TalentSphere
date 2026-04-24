import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Bookmark, MessageSquare, User, Edit, ArrowRight,
  LayoutDashboard, Search, ClipboardList, CheckSquare
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

const SIDEBAR_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'browse', label: 'Browse Jobs', icon: Search, href: '/Jobs' },
  { key: 'saved', label: 'Saved Jobs', icon: Bookmark, href: '/Jobs' },
  { key: 'applied', label: 'Applied Jobs', icon: ClipboardList, href: '/Jobs' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/Messages' },
  { key: 'profile', label: 'Profile', icon: User, href: '/EditCandidateProfile' },
];

const STATUS_STEPS = ['applied', 'shortlisted', 'interview', 'hired'];
const statusColors = {
  applied: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-yellow-50 text-yellow-700',
  screening: 'bg-yellow-50 text-yellow-700',
  interview: 'bg-purple-50 text-purple-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  hired: 'bg-emerald-50 text-emerald-700',
};

function calcProfileCompleteness(profile) {
  if (!profile) return 0;
  const fields = ['full_name', 'phone', 'location', 'job_title', 'years_of_experience', 'bio', 'resume_url', 'skills', 'education_degree'];
  const filled = fields.filter(f => {
    const v = profile[f];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  });
  return Math.round((filled.length / fields.length) * 100);
}

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-candidate-profile', user?.email],
    queryFn: async () => { const p = await base44.entities.CandidateProfile.filter({ user_email: user.email }); return p[0] || null; },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', user?.email],
    queryFn: () => base44.entities.Application.filter({ candidate_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['my-saved-jobs', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'job' }),
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-unread', user?.email],
    queryFn: () => base44.entities.Message.filter({ receiver_email: user.email, read: false }),
    enabled: !!user?.email,
  });

  if (isLoading) return <LoadingSpinner />;

  const completion = calcProfileCompleteness(profile);

  const stats = [
    { icon: FileText, label: 'Total Applications', value: applications.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Bookmark, label: 'Saved Jobs', value: savedJobs.length, color: 'bg-amber-50 text-amber-600' },
    { icon: MessageSquare, label: 'Messages', value: messages.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: User, label: 'Profile Completion', value: `${completion}%`, color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-white border-r flex flex-col">
        {/* Avatar */}
        <div className="p-5 border-b flex flex-col items-center text-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow mb-2" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center mb-2">
              <User className="w-7 h-7 text-indigo-500" />
            </div>
          )}
          <p className="font-bold text-slate-900 text-sm">{profile?.full_name || user?.full_name || 'Your Name'}</p>
          <p className="text-xs text-slate-500 mt-0.5">{profile?.job_title || 'No title set'}</p>
          {profile?.open_to_work && (
            <Badge className="mt-2 bg-green-50 text-green-700 border-green-200 text-xs">Open to Work</Badge>
          )}
          {/* Completion bar */}
          <div className="w-full mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Profile</span><span>{completion}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_LINKS.map(item => {
            if (item.href) {
              return (
                <Link key={item.key} to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {item.key === 'messages' && messages.length > 0 && (
                    <Badge className="ml-auto text-xs bg-indigo-500">{messages.length}</Badge>
                  )}
                </Link>
              );
            }
            return (
              <button key={item.key} onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'there'}!</h1>
              <p className="text-sm text-slate-500 mt-0.5">Here's your job search overview</p>
            </div>
            <div className="flex gap-2">
              <Link to="/Jobs">
                <Button variant="outline" size="sm" className="gap-2"><Search className="w-4 h-4" /> Find Jobs</Button>
              </Link>
              <Link to="/EditCandidateProfile">
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Edit className="w-4 h-4" /> Edit Profile</Button>
              </Link>
            </div>
          </div>

          {/* Profile completion warning */}
          {!profile && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Complete your profile</p>
                <p className="text-xs text-amber-600 mt-0.5">A complete profile helps companies find you.</p>
              </div>
              <Link to="/EditCandidateProfile">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600">Complete Now</Button>
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <Card key={s.label} className="p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
              <Link to="/Jobs"><Button variant="ghost" size="sm" className="gap-1 text-indigo-600">Browse Jobs <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            {applications.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No applications yet.</p>
                <Link to="/Jobs"><Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700">Start Applying</Button></Link>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                {applications.slice(0, 6).map((app, i) => (
                  <Link key={app.id} to={`/Jobs?tab=applied&jobId=${app.job_id}`} className={`block hover:bg-slate-50 transition-colors ${i < Math.min(applications.length, 6) - 1 ? 'border-b' : ''}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{app.job_title}</p>
                        <p className="text-xs text-slate-400">{app.company_name}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </Card>
            )}
          </div>

          {/* Saved Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">Saved Jobs</h2>
              <Link to="/Jobs"><Button variant="ghost" size="sm" className="gap-1 text-indigo-600">View All <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            {savedJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No saved jobs yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                {savedJobs.slice(0, 5).map((item, i) => (
                  <Link key={item.id} to={`/Jobs?tab=saved&jobId=${item.item_id}`}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${i < Math.min(savedJobs.length, 5) - 1 ? 'border-b' : ''}`}>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{item.item_title}</p>
                      <p className="text-xs text-slate-400">{item.item_subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}