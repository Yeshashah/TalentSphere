import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';
import EmptyState from '../components/shared/EmptyState';

export default function ManageJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['my-jobs', user?.email],
    queryFn: () => base44.entities.Job.filter({ company_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['company-applications', user?.email],
    queryFn: () => base44.entities.Application.filter({ company_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const [selectedJob, setSelectedJob] = useState(null);

  const jobApplications = selectedJob
    ? applications.filter(a => a.job_id === selectedJob)
    : applications;

  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Application.update(id, { status });
    },
    onSuccess: () => {
      toast({ title: 'Status updated' });
      queryClient.invalidateQueries({ queryKey: ['company-applications'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Manage Jobs</h1>
          <Link to="/PostJob"><Button className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white border-none"><Plus className="w-4 h-4" /> Post Job</Button></Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post your first job to start receiving applications" action="Post a Job" onAction={() => window.location.href = '/PostJob'} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Jobs list */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Your Jobs</h2>
              {jobs.map(job => (
                <Card
                  key={job.id}
                  onClick={() => setSelectedJob(job.id === selectedJob ? null : job.id)}
                  className={`p-4 cursor-pointer transition-all bg-white/5 border-white/10 backdrop-blur-md ${selectedJob === job.id ? 'ring-2 ring-indigo-500 border-indigo-500/50 bg-white/10' : 'hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{job.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{applications.filter(a => a.job_id === job.id).length} applications</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        job.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        job.approval_status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{job.approval_status || 'pending'}</span>
                      <Link to={`/PostJob?id=${job.id}`} onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"><Edit className="w-3.5 h-3.5" /></Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Applications */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Applications {selectedJob ? `for ${jobs.find(j => j.id === selectedJob)?.title}` : '(all jobs)'}
              </h2>
              {jobApplications.length === 0 ? (
                <Card className="p-8 text-center bg-white/5 border-white/10 backdrop-blur-md">
                  <p className="text-sm text-slate-400">No applications yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {jobApplications.map(app => (
                    <Card key={app.id} className="p-4 bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm">{app.candidate_name}</p>
                            <StatusBadge status={app.status} />
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Applied to {app.job_title}</p>
                          {app.cover_letter && (
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">{app.cover_letter}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={app.status}
                            onValueChange={v => updateAppMutation.mutate({ id: app.id, status: v })}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="offer">Offer</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                          {app.resume_url && (
                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"><Eye className="w-3.5 h-3.5" /></Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}