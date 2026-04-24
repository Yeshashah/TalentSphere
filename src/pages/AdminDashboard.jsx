import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users, Briefcase, Building2, FileText, CheckCircle, XCircle, ArrowLeft,
  LayoutDashboard, ClipboardList, CreditCard, BarChart2, Search, Clock, ChevronRight, TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const SIDEBAR = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'approvals', label: 'Job Approvals', icon: ClipboardList },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'candidates', label: 'Candidates', icon: Users },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { key: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const approvalColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: candidates = [], isLoading: lc } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: () => base44.entities.CandidateProfile.list('-created_date'),
    enabled: !!user,
  });

  const { data: companies = [], isLoading: lco } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => base44.entities.CompanyProfile.list('-created_date'),
    enabled: !!user,
  });

  const { data: jobs = [], isLoading: lj } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => base44.entities.Application.list('-created_date'),
    enabled: !!user,
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approval_status, admin_note, job: jobOverride }) => {
      const job = jobOverride || jobs.find(j => j.id === id);
      await base44.entities.Job.update(id, { approval_status, admin_note });
      // Notify the company
      if (job?.company_email) {
        base44.functions.invoke('createNotification', {
          user_email: job.company_email,
          type: approval_status === 'approved' ? 'job_approved' : 'job_rejected',
          title: approval_status === 'approved' ? `Job Approved: ${job.title}` : `Job Rejected: ${job.title}`,
          body: approval_status === 'approved'
            ? 'Your job posting is now live and visible to candidates.'
            : admin_note ? `Reason: ${admin_note}` : 'Your job posting was not approved.',
          link: '/ManageJobs',
        }).catch(() => {});
      }
    },
    onSuccess: (_, vars) => {
      toast({ title: vars.approval_status === 'approved' ? 'Job approved!' : 'Job rejected.' });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  const pendingJobs = jobs.filter(j => j.approval_status === 'pending');
  const approvedJobs = jobs.filter(j => j.approval_status === 'approved');
  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);
  const selectedJobCompany = useMemo(() => companies.find(c => c.company_name === selectedJob?.company_name || c.user_email === selectedJob?.company_email), [companies, selectedJob]);

  const hiringRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'hired').length / applications.length) * 100)
    : 0;

  const dashboardStats = [
    { icon: Building2, label: 'Total Companies', value: companies.length, color: 'bg-indigo-50 text-indigo-600' },
    { icon: Users, label: 'Total Candidates', value: candidates.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Clock, label: 'Pending Approvals', value: pendingJobs.length, color: 'bg-yellow-50 text-yellow-600' },
    { icon: FileText, label: 'Monthly Applications', value: applications.length, color: 'bg-emerald-50 text-emerald-600' },
  ];

  // Monthly analytics
  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months[key] = { month: key, jobs: 0, applications: 0, hired: 0 };
    }
    jobs.forEach(j => {
      if (!j.created_date) return;
      const d = new Date(j.created_date);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (months[key]) months[key].jobs++;
    });
    applications.forEach(a => {
      if (!a.created_date) return;
      const d = new Date(a.created_date);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (months[key]) {
        months[key].applications++;
        if (a.status === 'hired') months[key].hired++;
      }
    });
    return Object.values(months);
  }, [jobs, applications]);

  const subscriptionData = [
    { name: 'Free', value: companies.filter(c => !c.subscription_plan || c.subscription_plan === 'free').length },
    { name: 'Pro', value: companies.filter(c => c.subscription_plan === 'pro').length },
  ];
  const COLORS = ['#94a3b8', '#6366f1'];

  const filteredJobs = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    !search || c.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCandidates = candidates.filter(c =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.job_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 bg-white border-r flex flex-col">
        <div className="p-5 border-b">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Super Admin</p>
          <p className="font-bold text-slate-900 text-sm">{user?.full_name || user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR.map(item => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSearch(''); setSelectedJobId(null); setAdminNote(''); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.key === 'approvals' && pendingJobs.length > 0 && (
                <span className="ml-auto text-xs bg-yellow-400 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {pendingJobs.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl mx-auto">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {dashboardStats.map(s => (
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
                {/* Pending approvals preview */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-900">Pending Approvals</h2>
                    <Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => setActiveTab('approvals')}>
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  {pendingJobs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">All caught up!</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingJobs.slice(0, 4).map(j => (
                        <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                          <div 
                            className="cursor-pointer hover:underline" 
                            onClick={() => { setActiveTab('approvals'); setSelectedJobId(j.id); }}
                          >
                            <p className="text-sm font-medium text-slate-900">{j.title}</p>
                            <p className="text-xs text-slate-500">{j.company_name}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                              onClick={() => approveMutation.mutate({ id: j.id, approval_status: 'approved', job: j })}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                              onClick={() => approveMutation.mutate({ id: j.id, approval_status: 'rejected', job: j })}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Analytics card */}
                <Card className="p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">Analytics Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Active Jobs (approved)</span>
                      <span className="font-bold text-slate-900">{approvedJobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Applications</span>
                      <span className="font-bold text-slate-900">{applications.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Hiring Rate</span>
                      <span className="font-bold text-emerald-600">{hiringRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Rejected Jobs</span>
                      <span className="font-bold text-red-500">{jobs.filter(j => j.approval_status === 'rejected').length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Job Approvals */}
          {activeTab === 'approvals' && !selectedJobId && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Job Approvals</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9 w-60" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>

              {/* Tabs: pending / all */}
              <div className="flex gap-4 mb-4">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button key={f} onClick={() => setSearch('')}
                    className="text-sm font-medium text-indigo-600 capitalize border-b-2 border-indigo-400 pb-0.5">
                  </button>
                ))}
              </div>

              {lj ? <LoadingSpinner /> : (
                <div className="space-y-3">
                  {filteredJobs.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No jobs found.</p>}
                  {filteredJobs.map(job => (
                    <Card key={job.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 cursor-pointer group"
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <div className="flex items-center gap-2 flex-wrap group-hover:underline">
                            <p className="font-semibold text-slate-900">{job.title}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${approvalColors[job.approval_status || 'pending']}`}>
                              {job.approval_status || 'pending'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{job.company_name} · {job.location || job.work_mode}</p>
                          {job.created_date && (
                            <p className="text-xs text-slate-400 mt-1">Posted {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}</p>
                          )}
                          {job.admin_note && (
                            <p className="text-xs text-red-500 mt-1">Note: {job.admin_note}</p>
                          )}
                        </div>
                        {(job.approval_status === 'pending' || job.approval_status === undefined) && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5"
                              onClick={() => approveMutation.mutate({ id: job.id, approval_status: 'approved' })}
                              disabled={approveMutation.isPending}>
                              <CheckCircle className="w-4 h-4" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5"
                              onClick={() => approveMutation.mutate({ id: job.id, approval_status: 'rejected' })}
                              disabled={approveMutation.isPending}>
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          </div>
                        )}
                        {job.approval_status === 'approved' && (
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5 flex-shrink-0"
                            onClick={() => approveMutation.mutate({ id: job.id, approval_status: 'rejected' })}
                            disabled={approveMutation.isPending}>
                            <XCircle className="w-4 h-4" /> Revoke
                          </Button>
                        )}
                        {job.approval_status === 'rejected' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 flex-shrink-0"
                            onClick={() => approveMutation.mutate({ id: job.id, approval_status: 'approved' })}
                            disabled={approveMutation.isPending}>
                            <CheckCircle className="w-4 h-4" /> Re-approve
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'approvals' && selectedJob && (
            <div className="max-w-4xl mx-auto py-2">
              <button
                onClick={() => { setSelectedJobId(null); setAdminNote(''); }}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Approvals
              </button>
              
              <Card className="p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.title}</h1>
                    
                    {selectedJobCompany ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 mb-4 flex items-center gap-4">
                        {selectedJobCompany.logo_url ? (
                          <img src={selectedJobCompany.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover border bg-white" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-lg text-slate-900 font-bold">{selectedJobCompany.company_name}</p>
                          <p className="text-sm text-slate-500">
                            {[
                              selectedJobCompany.industry, 
                              selectedJobCompany.company_size ? `${selectedJobCompany.company_size} employees` : null, 
                              selectedJobCompany.hq_country || selectedJobCompany.headquarters
                            ].filter(Boolean).join(' · ') || 'No company details available'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-slate-600 font-medium mb-3">{selectedJob.company_name} <span className="text-sm text-slate-400">(Company details not available)</span></p>
                    )}

                    <div className="flex gap-2 mt-2 text-sm text-slate-500 items-center">
                       <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${approvalColors[selectedJob.approval_status || 'pending']}`}>
                         {selectedJob.approval_status || 'pending'}
                       </span>
                       {selectedJob.location && (
                         <>
                           <span>•</span>
                           <span>{selectedJob.location}</span>
                         </>
                       )}
                       {selectedJob.type && (
                         <>
                           <span>•</span>
                           <span>{selectedJob.type}</span>
                         </>
                       )}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Description</h3>
                  <div className="text-slate-600 whitespace-pre-wrap">
                    {selectedJob.description || "No description provided."}
                  </div>
                </div>

                {selectedJob.requirements && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
                    <div className="text-slate-600 whitespace-pre-wrap">
                      {selectedJob.requirements}
                    </div>
                  </div>
                )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map(skill => (
                        <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6 mt-8 border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4">Approval Action</h3>
                  
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Admin Remarks <span className="font-normal text-slate-400">(Optional, typically used to explain rejections)</span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm"
                      rows="3"
                      placeholder="Provide a reason or feedback..."
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 gap-2 flex-1 h-12 text-base rounded-xl"
                      onClick={() => {
                        approveMutation.mutate({ id: selectedJob.id, approval_status: 'approved', admin_note: adminNote, job: selectedJob });
                        setSelectedJobId(null);
                        setAdminNote('');
                      }}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-5 h-5" /> Approve Job
                    </Button>
                    <Button
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-2 flex-1 h-12 text-base rounded-xl"
                      onClick={() => {
                        approveMutation.mutate({ id: selectedJob.id, approval_status: 'rejected', admin_note: adminNote, job: selectedJob });
                        setSelectedJobId(null);
                        setAdminNote('');
                      }}
                      disabled={approveMutation.isPending}
                    >
                      <XCircle className="w-5 h-5" /> Reject Job
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Companies */}
          {activeTab === 'companies' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Companies ({companies.length})</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9 w-60" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              {lco ? <LoadingSpinner /> : (
                <div className="space-y-3">
                  {filteredCompanies.map(c => (
                    <Card key={c.id} className="p-4 flex items-center gap-4">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-400" /></div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{c.company_name}</p>
                        <p className="text-xs text-slate-500">{c.industry} · {c.company_size} employees · {c.headquarters}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.subscription_plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {c.subscription_plan || 'free'}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Candidates */}
          {activeTab === 'candidates' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Candidates ({candidates.length})</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input className="pl-9 w-60" placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              {lc ? <LoadingSpinner /> : (
                <div className="space-y-3">
                  {filteredCandidates.map(c => (
                    <Card key={c.id} className="p-4 flex items-center gap-4">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{c.full_name}</p>
                        <p className="text-xs text-slate-500">{c.job_title} · {c.location} · {c.years_of_experience ? `${c.years_of_experience} yrs exp` : ''}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.open_to_work ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.open_to_work ? 'Open to Work' : 'Not looking'}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Subscriptions */}
          {activeTab === 'subscriptions' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Subscriptions</h1>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Card className="p-5">
                  <p className="text-3xl font-bold text-slate-900">{companies.filter(c => c.subscription_plan === 'pro').length}</p>
                  <p className="text-sm text-slate-500 mt-1">Pro Plan Companies</p>
                </Card>
                <Card className="p-5">
                  <p className="text-3xl font-bold text-slate-900">{companies.filter(c => !c.subscription_plan || c.subscription_plan === 'free').length}</p>
                  <p className="text-sm text-slate-500 mt-1">Free Plan Companies</p>
                </Card>
              </div>
              <div className="space-y-3">
                {companies.map(c => (
                  <Card key={c.id} className="p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{c.company_name}</p>
                      <p className="text-xs text-slate-500">{c.recruiter_email}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${c.subscription_plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {c.subscription_plan || 'free'}
                    </span>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Active Companies', value: companies.length, color: 'bg-indigo-50 text-indigo-600', icon: Building2 },
                  { label: 'Total Candidates', value: candidates.length, color: 'bg-blue-50 text-blue-600', icon: Users },
                  { label: 'Total Applications', value: applications.length, color: 'bg-emerald-50 text-emerald-600', icon: FileText },
                  { label: 'Hiring Rate', value: `${hiringRate}%`, color: 'bg-green-50 text-green-600', icon: TrendingUp },
                ].map(s => (
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

              {/* Monthly Jobs & Applications chart */}
              <Card className="p-5 mb-6">
                <h2 className="font-semibold text-slate-900 mb-4">Monthly Job Openings & Applications</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="jobs" name="Job Openings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="applications" name="Applications" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly hiring trend */}
                <Card className="p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">Monthly Hiring Trend</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="hired" name="Hired" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Subscription breakdown */}
                <Card className="p-5">
                  <h2 className="font-semibold text-slate-900 mb-4">Subscription Statistics</h2>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={160}>
                      <PieChart>
                        <Pie data={subscriptionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                          {subscriptionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {subscriptionData.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-sm text-slate-600">{s.name}</span>
                          <span className="font-bold text-slate-900 ml-auto">{s.value}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-500">Total Active</p>
                        <p className="font-bold text-lg text-slate-900">{companies.length}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}