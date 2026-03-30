import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, Building2, FileText, Trash2, TrendingUp, CreditCard, UserCheck } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, subMonths } from 'date-fns';

function getMonthKey(dateStr) {
  return format(new Date(dateStr), 'MMM yy');
}

function buildMonthlyData(items, months = 6) {
  const counts = {};
  for (let i = months - 1; i >= 0; i--) {
    const key = format(subMonths(new Date(), i), 'MMM yy');
    counts[key] = 0;
  }
  items.forEach(item => {
    const key = getMonthKey(item.created_date);
    if (key in counts) counts[key]++;
  });
  return Object.entries(counts).map(([month, count]) => ({ month, count }));
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: candidates = [], isLoading: lc } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: () => base44.entities.CandidateProfile.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: companies = [], isLoading: lco } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => base44.entities.CompanyProfile.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => base44.entities.Application.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id) => base44.entities.CandidateProfile.delete(id),
    onSuccess: () => { toast({ title: 'Candidate deleted' }); queryClient.invalidateQueries({ queryKey: ['admin-candidates'] }); },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: (id) => base44.entities.CompanyProfile.delete(id),
    onSuccess: () => { toast({ title: 'Company deleted' }); queryClient.invalidateQueries({ queryKey: ['admin-companies'] }); },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => { toast({ title: 'Job deleted' }); queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }); },
  });

  const jobsMonthly = useMemo(() => buildMonthlyData(jobs), [jobs]);
  const applicationsMonthly = useMemo(() => buildMonthlyData(applications), [applications]);

  const hiredRateMonthly = useMemo(() => {
    const monthly = {};
    for (let i = 5; i >= 0; i--) {
      const key = format(subMonths(new Date(), i), 'MMM yy');
      monthly[key] = { total: 0, hired: 0 };
    }
    applications.forEach(app => {
      const key = getMonthKey(app.created_date);
      if (key in monthly) {
        monthly[key].total++;
        if (app.status === 'hired' || app.job_status === 'hired') monthly[key].hired++;
      }
    });
    return Object.entries(monthly).map(([month, v]) => ({
      month,
      rate: v.total > 0 ? Math.round((v.hired / v.total) * 100) : 0,
    }));
  }, [applications]);

  const subscriptionCompanies = useMemo(() =>
    companies.map(c => ({
      name: c.company_name,
      plan: c.subscription_plan || 'free',
      email: c.user_email,
      industry: c.company_type || c.linkedin_industries?.[0] || '—',
    })),
    [companies]
  );

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Access denied. Super Admin only.</div>;
  }

  const stats = [
    { icon: Users, label: 'Candidates', value: candidates.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Building2, label: 'Companies', value: companies.length, color: 'bg-indigo-50 text-indigo-600' },
    { icon: Briefcase, label: 'Jobs Posted', value: jobs.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FileText, label: 'Applications', value: applications.length, color: 'bg-amber-50 text-amber-600' },
    { icon: UserCheck, label: 'Hired', value: applications.filter(a => a.status === 'hired' || a.job_status === 'hired').length, color: 'bg-green-50 text-green-600' },
    { icon: CreditCard, label: 'Pro Subscribers', value: companies.filter(c => c.subscription_plan === 'pro').length, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Platform overview and management</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Monthly Job Openings</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={jobsMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Jobs" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Monthly Applications</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={applicationsMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Hired Rate % / Month</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={hiredRateMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Hired %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* CRUD Tabs */}
        <Tabs defaultValue="candidates">
          <TabsList className="mb-6">
            <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
            <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscription Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <Card className="p-4">
              {lc ? <LoadingSpinner /> : (
                <div className="space-y-2">
                  {candidates.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No candidates yet</p>}
                  {candidates.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{c.candidate_name || c.full_name || '—'}</p>
                        <p className="text-xs text-slate-500">{c.candidate_job_title || c.job_title || 'No title'} · {c.user_email}</p>
                        {(c.candidate_skills || c.skills)?.length > 0 && (
                          <p className="text-xs text-slate-400 mt-0.5">Skills: {(c.candidate_skills || c.skills).slice(0, 3).join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={c.open_to_work ? 'default' : 'secondary'} className="text-xs">
                          {c.open_to_work ? 'Open to Work' : 'Not Looking'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => deleteCandidateMutation.mutate(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="p-4">
              {lco ? <LoadingSpinner /> : (
                <div className="space-y-2">
                  {companies.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No companies yet</p>}
                  {companies.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {c.linkedin_logo_url ? (
                          <img src={c.linkedin_logo_url} alt="" className="w-9 h-9 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{c.company_name}</p>
                          <p className="text-xs text-slate-500">{c.hq_country || '—'} · {c.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={c.subscription_plan === 'pro' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600'}>
                          {c.subscription_plan || 'free'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => deleteCompanyMutation.mutate(c.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="p-4">
              <div className="space-y-2">
                {jobs.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No jobs yet</p>}
                {jobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{j.title}</p>
                      <p className="text-xs text-slate-500">{j.company_name} · {j.location || 'Remote'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={j.status} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => deleteJobMutation.mutate(j.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">Subscription Plans by Company</p>
              </div>
              <div className="divide-y">
                {subscriptionCompanies.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8">No companies yet</p>
                )}
                {subscriptionCompanies.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.industry}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={c.plan === 'pro'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'}>
                        {c.plan === 'pro' ? '⭐ Pro' : 'Free'}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">{c.plan === 'pro' ? '$49/mo' : '$0/mo'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}