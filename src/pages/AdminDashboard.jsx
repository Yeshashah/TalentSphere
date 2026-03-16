import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Briefcase, Building2, FileText, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date'),
    enabled: user?.role === 'admin',
  });

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

  const { data: jobs = [], isLoading: lj } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => base44.entities.Application.list('-created_date'),
    enabled: user?.role === 'admin',
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.Job.delete(id),
    onSuccess: () => {
      toast({ title: 'Job deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-slate-500">Access denied. Admin only.</div>;
  }

  const stats = [
    { icon: Users, label: 'Candidates', value: candidates.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Building2, label: 'Companies', value: companies.length, color: 'bg-indigo-50 text-indigo-600' },
    { icon: Briefcase, label: 'Jobs Posted', value: jobs.length, color: 'bg-emerald-50 text-emerald-600' },
    { icon: FileText, label: 'Applications', value: applications.length, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

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

        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-4">
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{u.full_name || u.email}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 text-slate-700">{u.role || 'candidate'}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card className="p-4">
              <div className="space-y-2">
                {candidates.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.full_name}</p>
                      <p className="text-xs text-slate-500">{c.job_title} · {c.location}</p>
                    </div>
                    <span className="text-xs text-slate-500">{c.visibility}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="p-4">
              <div className="space-y-2">
                {companies.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{c.company_name}</p>
                      <p className="text-xs text-slate-500">{c.industry} · {c.company_size}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-50 text-indigo-700">{c.subscription_plan}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="p-4">
              <div className="space-y-2">
                {jobs.map(j => (
                  <div key={j.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{j.title}</p>
                      <p className="text-xs text-slate-500">{j.company_name} · {j.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={j.status} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteJobMutation.mutate(j.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="p-4">
              <div className="space-y-2">
                {applications.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{a.candidate_name}</p>
                      <p className="text-xs text-slate-500">Applied to {a.job_title} at {a.company_name}</p>
                    </div>
                    <StatusBadge status={a.status} />
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