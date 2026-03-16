import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, GraduationCap, DollarSign, Clock, User, ExternalLink, Bookmark, MessageSquare, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import SkillBadge from '../components/shared/SkillBadge';

const availLabels = { immediate: 'Immediate', '2_weeks': '2 weeks', '1_month': '1 month', '2_months': '2 months', '3_months_plus': '3+ months' };
const empLabels = { full_time: 'Full-time', contract: 'Contract', remote: 'Remote', freelance: 'Freelance' };

export default function CandidateDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => { const c = await base44.entities.CandidateProfile.filter({ id }); return c[0]; },
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SavedItem.create({
        user_email: user.email,
        item_type: 'candidate',
        item_id: candidate.id,
        item_title: candidate.full_name,
        item_subtitle: candidate.job_title,
      });
      toast({ title: 'Candidate saved!' });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!candidate) return <div className="p-8 text-center text-slate-500">Candidate not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="p-8">
          <div className="flex items-start gap-5 mb-6">
            {candidate.avatar_url ? (
              <img src={candidate.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                <User className="w-10 h-10 text-indigo-500" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{candidate.full_name}</h1>
                {candidate.open_to_work && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Open to work</Badge>}
              </div>
              <p className="text-lg text-slate-500 mt-1">{candidate.job_title}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {candidate.location && <span className="inline-flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-4 h-4" /> {candidate.location}</span>}
                {candidate.years_of_experience != null && <span className="inline-flex items-center gap-1 text-sm text-slate-500"><Briefcase className="w-4 h-4" /> {candidate.years_of_experience} years exp</span>}
                {candidate.expected_salary && <span className="inline-flex items-center gap-1 text-sm text-slate-500"><DollarSign className="w-4 h-4" /> ${(candidate.expected_salary/1000).toFixed(0)}k expected</span>}
              </div>
            </div>
          </div>

          {user?.role === 'company' && (
            <div className="flex gap-3 mb-8">
              <Button onClick={() => navigate(`/Messages?to=${candidate.user_email}`)} className="gap-2">
                <MessageSquare className="w-4 h-4" /> Contact
              </Button>
              <Button variant="outline" onClick={() => saveMutation.mutate()} className="gap-2">
                <Bookmark className="w-4 h-4" /> Save
              </Button>
            </div>
          )}

          {candidate.bio && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">About</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{candidate.bio}</p>
            </div>
          )}

          {candidate.skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">{candidate.skills.map(s => <SkillBadge key={s} skill={s} />)}</div>
            </div>
          )}

          {candidate.tech_stack?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">{candidate.tech_stack.map(s => <SkillBadge key={s} skill={s} />)}</div>
            </div>
          )}

          {candidate.employment_type_preference?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Employment Preferences</h3>
              <div className="flex flex-wrap gap-2">{candidate.employment_type_preference.map(t => <Badge key={t} variant="outline">{empLabels[t] || t}</Badge>)}</div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {candidate.education_degree && (
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{candidate.education_degree}</p>
                  <p className="text-xs text-slate-500">{candidate.education_university} {candidate.graduation_year && `· ${candidate.graduation_year}`}</p>
                </div>
              </div>
            )}
            {candidate.availability && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Availability</p>
                  <p className="text-xs text-slate-500">{availLabels[candidate.availability]}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {candidate.linkedin && (
              <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="w-3 h-3" /> LinkedIn</Button>
              </a>
            )}
            {candidate.portfolio && (
              <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="w-3 h-3" /> Portfolio</Button>
              </a>
            )}
            {candidate.resume_url && (
              <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2"><ExternalLink className="w-3 h-3" /> Resume</Button>
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}