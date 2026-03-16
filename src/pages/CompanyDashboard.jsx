import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, MessageSquare, Plus, ArrowRight, Edit } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

export default function CompanyDashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: company, isLoading } = useQuery({
    queryKey: ['my-company-profile', user?.email],
    queryFn: async () => {
      const c = await base44.entities.CompanyProfile.filter({ user_email: user.email });
      return c[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['my-jobs', user?.email],
    queryFn: () => base44.entities.Job.filter({ company_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['company-applications', user?.email],
    queryFn: () => base44.entities.Application.filter({ company_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: savedCandidates = [] } = useQuery({
    queryKey: ['saved-candidates', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'candidate' }),
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-unread', user?.email],
    queryFn: () => base44.entities.Message.filter({ receiver_email: user.email, read: false }),
    enabled: !!user?.email,
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: jobs.filter(j => j.status === 'open').length, color: 'bg-indigo-50 text-indigo-600' },
    { icon: FileText, label: 'Applications', value: applications.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Saved Candidates', value: savedCandidates.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: MessageSquare, label: 'Unread Messages', value: messages.length, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{company?.company_name || 'Company'} Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your hiring pipeline</p>
          </div>
          <div className="flex gap-2">
            <Link to="/EditCompanyProfile"><Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Edit Profile</Button></Link>
            <Link to="/PostJob"><Button className="gap-2"><Plus className="w-4 h-4" /> Post Job</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Applications</h2>
              <Link to="/ManageJobs"><Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{app.candidate_name}</p>
                      <p className="text-xs text-slate-500">Applied to {app.job_title}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Jobs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Your Jobs</h2>
              <Link to="/PostJob"><Button variant="ghost" size="sm" className="gap-1">Post New <Plus className="w-4 h-4" /></Button></Link>
            </div>
            {jobs.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No jobs posted yet</p>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map(job => (
                  <Link key={job.id} to={`/JobDetail?id=${job.id}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.applications_count || 0} applications</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}