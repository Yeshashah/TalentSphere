import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Building2, DollarSign, Clock, Briefcase, Send, Bookmark, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import SkillBadge from '../components/shared/SkillBadge';

const typeLabels = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship' };
const modeLabels = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };
const levelLabels = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead', director: 'Director' };

export default function JobDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => { const jobs = await base44.entities.Job.filter({ id }); return jobs[0]; },
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: candidateProfile } = useQuery({
    queryKey: ['my-candidate-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CandidateProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Application.create({
        job_id: job.id,
        job_title: job.title,
        company_name: job.company_name,
        company_email: job.company_email,
        candidate_email: user.email,
        candidate_name: candidateProfile?.full_name || user.full_name,
        resume_url: candidateProfile?.resume_url || '',
        cover_letter: coverLetter,
        status: 'applied',
      });
    },
    onSuccess: () => {
      toast({ title: 'Application submitted!', description: 'Good luck!' });
      setShowApply(false);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SavedItem.create({
        user_email: user.email,
        item_type: 'job',
        item_id: job.id,
        item_title: job.title,
        item_subtitle: job.company_name,
      });
      toast({ title: 'Job saved!' });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <div className="p-8 text-center text-slate-500">Job not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="p-8">
          <div className="flex items-start gap-4 mb-6">
            {job.company_logo ? (
              <img src={job.company_logo} alt="" className="w-16 h-16 rounded-xl object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-indigo-400" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <p className="text-slate-500 mt-1">{job.company_name}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(job.city || job.state || job.country) && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-4 h-4" />
                    {[job.city, job.state, job.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {!job.city && !job.state && !job.country && job.location && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-4 h-4" /> {job.location}</span>
                )}
                {job.employment_type && <Badge variant="secondary">{typeLabels[job.employment_type]}</Badge>}
                {job.work_mode && <Badge variant="outline">{modeLabels[job.work_mode]}</Badge>}
                {job.job_level && <Badge variant="outline">{levelLabels[job.job_level]}</Badge>}
                {job.remote_eligible != null && <Badge variant="outline">{job.remote_eligible ? 'Remote Eligible' : 'Not Remote'}</Badge>}
                {job.num_openings > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <Briefcase className="w-4 h-4" /> {job.num_openings} {job.num_openings === 1 ? 'Opening' : 'Openings'}
                  </span>
                )}
                {(job.salary_min || job.salary_max) && (
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                    <DollarSign className="w-4 h-4" />
                    {job.salary_min && job.salary_max ? `$${(job.salary_min/1000).toFixed(0)}k - $${(job.salary_max/1000).toFixed(0)}k` : job.salary_min ? `From $${(job.salary_min/1000).toFixed(0)}k` : `Up to $${(job.salary_max/1000).toFixed(0)}k`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            {user?.role === 'candidate' && (
              <Button onClick={() => setShowApply(true)} className="gap-2">
                <Send className="w-4 h-4" /> Apply Now
              </Button>
            )}
            {user && (
              <Button variant="outline" onClick={() => saveMutation.mutate()} className="gap-2">
                <Bookmark className="w-4 h-4" /> Save
              </Button>
            )}
          </div>

          {job.skills_required?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map(s => <SkillBadge key={s} skill={s} />)}
              </div>
            </div>
          )}

          {job.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          )}
          {job.responsibilities && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Responsibilities</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}
          {job.requirements && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Requirements</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
          {job.certifications_required && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Certifications Required</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.certifications_required}</p>
            </div>
          )}
          {job.benefits && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Benefits</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
            </div>
          )}

          <div className="text-xs text-slate-400 mt-6">
            Posted {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
            {job.application_deadline && ` · Deadline: ${job.application_deadline}`}
          </div>
        </Card>
      </div>

      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Your resume from your profile will be attached automatically.</p>
            <Textarea
              placeholder="Write a cover letter (optional)..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
            <Button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}