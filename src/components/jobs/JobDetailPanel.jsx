import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Building2, DollarSign, Clock, Bookmark, BookmarkCheck, ExternalLink, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import SkillBadge from '../shared/SkillBadge';

const typeLabels = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship' };
const modeLabels = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };

export default function JobDetailPanel({ job }) {
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: savedItem, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-job', job.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const saved = await base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'job', item_id: job.id });
      return saved[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: existingApp } = useQuery({
    queryKey: ['my-app', job.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const apps = await base44.entities.Application.filter({ job_id: job.id, candidate_email: user.email });
      return apps[0] || null;
    },
    enabled: !!user?.email,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Application.create({
        job_id: job.id, job_title: job.title, company_name: job.company_name,
        company_email: job.company_email, candidate_email: user.email,
        candidate_name: candidateProfile?.full_name || user.full_name,
        resume_url: candidateProfile?.resume_url || '', cover_letter: coverLetter, status: 'applied',
      });
      // Notify company of new application
      if (job.company_email) {
        base44.functions.invoke('createNotification', {
          user_email: job.company_email,
          type: 'application_submitted',
          title: `New application for ${job.title}`,
          body: `${candidateProfile?.full_name || user.full_name} applied to your job posting.`,
          link: '/ManageJobs',
        }).catch(() => {});
      }
      // Notify candidate
      base44.functions.invoke('createNotification', {
        user_email: user.email,
        type: 'application_submitted',
        title: `Application submitted to ${job.company_name}`,
        body: `You applied for "${job.title}". Good luck!`,
        link: '/Jobs',
      }).catch(() => {});
    },
    onSuccess: () => {
      toast({ title: 'Application submitted!', description: 'Good luck!', duration: 2000 });
      setShowApply(false);
      queryClient.invalidateQueries({ queryKey: ['my-app', job.id, user?.email] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedItem) {
        await base44.entities.SavedItem.delete(savedItem.id);
        toast({ title: 'Job removed from saved', duration: 2000 });
      } else {
        await base44.entities.SavedItem.create({ user_email: user.email, item_type: 'job', item_id: job.id, item_title: job.title, item_subtitle: job.company_name });
        toast({ title: 'Job saved!', duration: 2000 });
      }
    },
    onSuccess: () => {
      refetchSaved();
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });

  const isSaved = !!savedItem;
  const hasApplied = !!existingApp;

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {job.company_logo ? (
          <img src={job.company_logo} alt="" className="w-14 h-14 rounded-xl object-cover border" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-7 h-7 text-indigo-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{job.company_name}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-4">
        {user && (
          hasApplied ? (
            <Button disabled className="gap-2 bg-green-600 text-white">
              ✓ Applied
            </Button>
          ) : (
            <Button onClick={() => setShowApply(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              Apply <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => saveMutation.mutate()}
            disabled={!user || saveMutation.isPending}
            className={isSaved ? 'text-indigo-600 border-indigo-300' : ''}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4 pb-4 border-b">
        {job.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>}
        {job.work_mode && <span className="inline-flex items-center gap-1"><Building2 className="w-4 h-4" /> {modeLabels[job.work_mode]}</span>}
        {job.employment_type && <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {typeLabels[job.employment_type]}</span>}
        {(job.salary_min || job.salary_max) && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {job.salary_min && job.salary_max ? `$${(job.salary_min/1000).toFixed(0)}k - $${(job.salary_max/1000).toFixed(0)}k` : job.salary_min ? `From $${(job.salary_min/1000).toFixed(0)}k` : `Up to $${(job.salary_max/1000).toFixed(0)}k`}
          </span>
        )}
        {job.applications_count > 0 && <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {job.applications_count} applicants</span>}
      </div>

      {/* Skills Required */}
      {job.skills_required?.length > 0 && (
        <div className="mb-5">
          <h4 className="font-semibold text-slate-800 mb-2">Must Have Skills Required:</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills_required.map(s => <SkillBadge key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <div className="mb-5">
          <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>
      )}

      {/* Responsibilities */}
      {job.responsibilities && (
        <div className="mb-5">
          <h4 className="font-semibold text-slate-800 mb-2">Responsibilities</h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
        </div>
      )}

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-5">
          <h4 className="font-semibold text-slate-800 mb-2">Requirements</h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="mb-5">
          <h4 className="font-semibold text-slate-800 mb-2">Benefits</h4>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Posted {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
        {job.application_deadline && ` · Deadline: ${job.application_deadline}`}
      </p>

      {/* Apply Dialog */}
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