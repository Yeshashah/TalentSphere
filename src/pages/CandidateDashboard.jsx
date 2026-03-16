import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, MessageSquare, User, Edit, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

export default function CandidateDashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-candidate-profile', user?.email],
    queryFn: async () => {
      const p = await base44.entities.CandidateProfile.filter({ user_email: user.email });
      return p[0] || null;
    },
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

  if (loadingProfile) return <LoadingSpinner />;

  const stats = [
    { icon: FileText, label: 'Applications', value: applications.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Bookmark, label: 'Saved Jobs', value: savedJobs.length, color: 'bg-amber-50 text-amber-600' },
    { icon: MessageSquare, label: 'Unread Messages', value: messages.length, color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}</h1>
            <p className="text-slate-500 mt-1">Here's your dashboard overview</p>
          </div>
          <Link to="/EditCandidateProfile">
            <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Edit Profile</Button>
          </Link>
        </div>

        {!profile && (
          <Card className="p-6 mb-6 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Complete your profile</p>
                <p className="text-sm text-amber-700">A complete profile helps companies find you.</p>
              </div>
              <Link to="/EditCandidateProfile"><Button size="sm">Complete Profile</Button></Link>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Applications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
            <Link to="/Jobs"><Button variant="ghost" size="sm" className="gap-1">Browse Jobs <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No applications yet. Start applying to jobs!</p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{app.job_title}</p>
                    <p className="text-xs text-slate-500">{app.company_name}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Saved Jobs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No saved jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {savedJobs.slice(0, 5).map(item => (
                <Link key={item.id} to={`/JobDetail?id=${item.item_id}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.item_title}</p>
                    <p className="text-xs text-slate-500">{item.item_subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}