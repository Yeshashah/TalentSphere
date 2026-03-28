import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, MessageSquare, Plus, ArrowRight, Edit, Building2 } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

export default function CompanyDashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: company, isLoading } = useQuery({
    queryKey: ['my-company-profile', user?.email],
    queryFn: async () => { const c = await base44.entities.CompanyProfile.filter({ user_email: user.email }); return c[0] || null; },
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

  const activeJobs = jobs.filter(j => j.status === 'open');

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: activeJobs.length, color: 'bg-indigo-50 text-indigo-600', link: '/ManageJobs' },
    { icon: FileText, label: 'Applications', value: applications.length, color: 'bg-blue-50 text-blue-600', link: '/ManageJobs' },
    { icon: Users, label: 'Saved Candidates', value: savedCandidates.length, color: 'bg-emerald-50 text-emerald-600', link: '/SavedCandidates' },
    { icon: MessageSquare, label: 'Unread Messages', value: messages.length, color: 'bg-amber-50 text-amber-600', link: '/Messages' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-900 pb-1 border-b-2 border-yellow-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/Candidates">
              <Button variant="outline" size="sm" className="gap-2"><Users className="w-4 h-4" /> Find Talent</Button>
            </Link>
            <Link to="/PostJob">
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Post Job</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left sidebar */}
        <div className="w-72 flex-shrink-0 border-r bg-white overflow-y-auto p-5">
          {/* Company card */}
          <div className="flex flex-col items-center text-center mb-6">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow mb-3" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
            )}
            <p className="font-bold text-slate-900">{company?.company_name || 'Your Company'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{company?.industry || 'No industry set'}</p>
            {company?.subscription_plan === 'pro' && (
              <Badge className="mt-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Pro Plan</Badge>
            )}
          </div>

          {!company && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-medium text-amber-800 mb-1">Set up your company profile</p>
              <p className="text-xs text-amber-600 mb-2">Help candidates learn about your company.</p>
              <Link to="/EditCompanyProfile">
                <Button size="sm" className="w-full text-xs">Complete Profile</Button>
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2">
            {stats.map(s => (
              <Link key={s.label} to={s.link}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 leading-none">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-1">
            <Link to="/EditCompanyProfile">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-600"><Edit className="w-4 h-4" /> Edit Profile</Button>
            </Link>
            <Link to="/Messages">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-600">
                <MessageSquare className="w-4 h-4" /> Messages
                {messages.length > 0 && <Badge className="ml-auto text-xs">{messages.length}</Badge>}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Recent Applications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
              <Link to="/ManageJobs"><Button variant="ghost" size="sm" className="gap-1 text-indigo-600">Manage All <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            {applications.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No applications yet. Post a job to get started!</p>
                <Link to="/PostJob"><Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700">Post a Job</Button></Link>
              </div>
            ) : (
              <div className="bg-white border rounded-xl overflow-hidden">
                {applications.slice(0, 6).map((app, i) => (
                  <div key={app.id} className={`flex items-center justify-between px-4 py-3 ${i < applications.slice(0, 6).length - 1 ? 'border-b' : ''}`}>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{app.candidate_name}</p>
                      <p className="text-xs text-slate-400">Applied to {app.job_title}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Jobs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900">Your Jobs</h2>
              <Link to="/PostJob"><Button variant="ghost" size="sm" className="gap-1 text-indigo-600">Post New <Plus className="w-4 h-4" /></Button></Link>
            </div>
            {jobs.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No jobs posted yet.</p>
              </div>
            ) : (
              <div className="bg-white border rounded-xl overflow-hidden">
                {jobs.slice(0, 5).map((job, i) => (
                  <Link key={job.id} to={`/JobDetail?id=${job.id}`} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${i < jobs.slice(0, 5).length - 1 ? 'border-b' : ''}`}>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                      <p className="text-xs text-slate-400">{job.applications_count || 0} applications</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Saved Candidates */}
          {savedCandidates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">Saved Candidates</h2>
                <Link to="/SavedCandidates"><Button variant="ghost" size="sm" className="gap-1 text-indigo-600">View All <ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
              <div className="bg-white border rounded-xl overflow-hidden">
                {savedCandidates.slice(0, 4).map((item, i) => (
                  <Link key={item.id} to={`/CandidateDetail?id=${item.item_id}`} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${i < savedCandidates.slice(0, 4).length - 1 ? 'border-b' : ''}`}>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{item.item_title}</p>
                      <p className="text-xs text-slate-400">{item.item_subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}