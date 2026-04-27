import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Users, MessageSquare, Plus, ArrowRight, Edit,
  Building2, LayoutDashboard, Settings, CreditCard, Bookmark, Clock
} from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';

const SIDEBAR_LINKS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'postjob', label: 'Post Job', icon: Plus, href: '/PostJob' },
  { key: 'managejobs', label: 'Manage Jobs', icon: Briefcase, href: '/ManageJobs' },
  { key: 'candidates', label: 'Candidates', icon: Users, href: '/Candidates' },
  { key: 'saved', label: 'Saved Candidates', icon: Bookmark, href: '/SavedCandidates' },
  { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/Messages' },
  { key: 'profile', label: 'Company Profile', icon: Settings, href: '/EditCompanyProfile' },
  { key: 'subscription', label: 'Subscription', icon: CreditCard, href: '/Pricing' },
];

const approvalColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const activeJobs = jobs.filter(j => j.approval_status === 'approved' && j.status === 'open');
  const pendingJobs = jobs.filter(j => j.approval_status === 'pending' || !j.approval_status);
  const totalOpenings = jobs.length;

  const stats = [
    { icon: Briefcase, label: 'Total Job Openings', value: totalOpenings, color: 'bg-indigo-50 text-indigo-600' },
    { icon: FileText, label: 'Applications Received', value: applications.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Saved Candidates', value: savedCandidates.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: Briefcase, label: 'Active Jobs', value: activeJobs.length, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Company card */}
        <div className="p-5 border-b border-white/10 flex flex-col items-center text-center">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow mb-2" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-2">
              <Building2 className="w-7 h-7 text-indigo-400" />
            </div>
          )}
          <p className="font-bold text-white text-sm">{company?.company_name || 'Your Company'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{company?.industry || 'No industry set'}</p>
          {company?.subscription_plan === 'pro' && (
            <Badge variant="default" className="mt-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">Pro Plan</Badge>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map(item => {
            const isLink = !!item.href;
            const Component = isLink ? Link : 'button';
            const props = isLink ? { to: item.href } : { onClick: () => setActiveTab(item.key) };

            return (
              <Component
                key={item.key}
                {...props}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === item.key ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Component>
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
              <h1 className="text-2xl font-bold text-white">{company?.company_name || 'Company Dashboard'}</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage your jobs and candidates</p>
            </div>
            <div className="flex gap-2">
              <Link to="/Candidates">
                <Button variant="outline" size="sm" className="gap-2"><Users className="w-4 h-4" /> Find Talent</Button>
              </Link>
              <Link to="/PostJob">
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Post Job</Button>
              </Link>
            </div>
          </div>

          {/* Profile setup warning */}
          {!company && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Set up your company profile</p>
                <p className="text-xs text-amber-600 mt-0.5">Help candidates learn about your company.</p>
              </div>
              <Link to="/EditCompanyProfile">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600">Complete Profile</Button>
              </Link>
            </div>
          )}

          {/* Pending approval notice */}
          {pendingJobs.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{pendingJobs.length} job{pendingJobs.length > 1 ? 's' : ''} awaiting admin approval</p>
                  <p className="text-xs text-yellow-600 mt-0.5">Jobs will be visible to candidates only after approval.</p>
                </div>
              </div>
              <Link to="/ManageJobs">
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">View Jobs</Button>
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <Card key={s.label} className="p-4 bg-white/5 border-white/10 backdrop-blur-md">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color} bg-opacity-10`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Recent Applications</h2>
              <Link to="/ManageJobs"><Button variant="ghost" size="sm" className="gap-1 text-indigo-400 hover:text-indigo-300">Manage All <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
            {applications.length === 0 ? (
              <Card className="p-8 text-center bg-white/5 border-white/10 backdrop-blur-md">
                <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No applications yet. Post a job to get started!</p>
                <Link to="/PostJob"><Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-500">Post a Job</Button></Link>
              </Card>
            ) : (
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                {applications.slice(0, 6).map((app, i) => (
                  <div key={app.id} className={`flex items-center justify-between px-4 py-3 ${i < Math.min(applications.length, 6) - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <p className="font-medium text-white text-sm">{app.candidate_name}</p>
                      <p className="text-xs text-slate-500">Applied to {app.job_title}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Your Jobs */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white">Your Jobs</h2>
              <Link to="/PostJob"><Button variant="ghost" size="sm" className="gap-1 text-indigo-400 hover:text-indigo-300">Post New <Plus className="w-4 h-4" /></Button></Link>
            </div>
            {jobs.length === 0 ? (
              <Card className="p-8 text-center bg-white/5 border-white/10 backdrop-blur-md">
                <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No jobs posted yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                {jobs.slice(0, 5).map((job, i) => (
                  <div key={job.id} className={`flex items-center justify-between px-4 py-3 ${i < Math.min(jobs.length, 5) - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <p className="font-medium text-white text-sm">{job.title}</p>
                      <p className="text-xs text-slate-500">{applications.filter(a => a.job_id === job.id).length} applications</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${approvalColors[job.approval_status || 'pending']}`}>
                      {job.approval_status || 'pending'}
                    </span>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Saved Candidates */}
          {savedCandidates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">Saved Candidates</h2>
                <Link to="/SavedCandidates"><Button variant="ghost" size="sm" className="gap-1 text-indigo-400 hover:text-indigo-300">View All <ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
              <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-md">
                {savedCandidates.slice(0, 4).map((item, i) => (
                  <Link key={item.id} to={`/CandidateDetail?id=${item.item_id}`}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${i < Math.min(savedCandidates.length, 4) - 1 ? 'border-b border-white/5' : ''}`}>
                    <div>
                      <p className="font-medium text-white text-sm">{item.item_title}</p>
                      <p className="text-xs text-slate-500">{item.item_subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}