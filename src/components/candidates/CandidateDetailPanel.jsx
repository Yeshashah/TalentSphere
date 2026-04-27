import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, GraduationCap, DollarSign, Clock, User, ExternalLink, Bookmark, BookmarkCheck, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import SkillBadge from '../shared/SkillBadge';

const availLabels = { immediate: 'Immediate', '2_weeks': '2 weeks', '1_month': '1 month', '2_months': '2 months', '3_months_plus': '3+ months' };
const empLabels = { full_time: 'Full-time', contract: 'Contract', remote: 'Remote', freelance: 'Freelance' };

export default function CandidateDetailPanel({ candidate }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: savedItem, refetch: refetchSaved } = useQuery({
    queryKey: ['saved-candidate', candidate.id, user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const saved = await base44.entities.SavedItem.filter({ user_email: user.email, item_type: 'candidate', item_id: candidate.id });
      return saved[0] || null;
    },
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedItem) {
        await base44.entities.SavedItem.delete(savedItem.id);
        toast({ title: 'Candidate removed from saved', duration: 2000 });
      } else {
        await base44.entities.SavedItem.create({
          user_email: user.email, item_type: 'candidate', item_id: candidate.id,
          item_title: candidate.full_name, item_subtitle: candidate.job_title,
        });
        toast({ title: 'Candidate saved!', duration: 2000 });
      }
    },
    onSuccess: () => {
      refetchSaved();
      queryClient.invalidateQueries({ queryKey: ['saved-candidates', user?.email] });
    },
  });

  const isSaved = !!savedItem;

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {candidate.avatar_url ? (
          <img src={candidate.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-xl" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-indigo-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white leading-tight">{candidate.full_name}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{candidate.job_title}</p>
          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500">
            {candidate.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>}
            {candidate.years_of_experience != null && <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" />{candidate.years_of_experience} yrs exp</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      {user?.role === 'company' && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
          <Button onClick={() => navigate(`/Messages?to=${candidate.user_email}`)} className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white border-none">
            <MessageSquare className="w-4 h-4" /> Contact
          </Button>
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={`border-white/10 text-white hover:bg-white/10 ${isSaved ? 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10' : ''}`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 mr-1.5" /> : <Bookmark className="w-4 h-4 mr-1.5" />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          {isSaved && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/SavedCandidates')}>
              View Saved
            </Button>
          )}
        </div>
      )}

      {/* Meta tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {candidate.availability && <Badge variant="outline" className="border-white/10 text-slate-300">{availLabels[candidate.availability] || candidate.availability}</Badge>}
        {candidate.open_to_work && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Open to Work</Badge>}
        {candidate.employment_type_preference?.map(t => (
          <Badge key={t} variant="secondary">{empLabels[t] || t}</Badge>
        ))}
        {candidate.expected_salary && (
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 ml-1">
            <DollarSign className="w-3.5 h-3.5" />${(candidate.expected_salary / 1000).toFixed(0)}k expected
          </span>
        )}
      </div>

      {/* Bio */}
      {candidate.bio && (
        <div className="mb-5">
          <h4 className="font-semibold text-white mb-1.5 text-sm">About</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{candidate.bio}</p>
        </div>
      )}

      {/* Skills */}
      {candidate.skills?.length > 0 && (
        <div className="mb-5">
          <h4 className="font-semibold text-white mb-2 text-sm">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map(s => <SkillBadge key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {candidate.tech_stack?.length > 0 && (
        <div className="mb-5">
          <h4 className="font-semibold text-white mb-2 text-sm">Tech Stack</h4>
          <div className="flex flex-wrap gap-1.5">
            {candidate.tech_stack.map(s => <SkillBadge key={s} skill={s} />)}
          </div>
        </div>
      )}

      {/* Education */}
      {candidate.education_degree && (
        <div className="mb-5">
          <h4 className="font-semibold text-white mb-2 text-sm">Education</h4>
          <div className="flex items-start gap-3">
            <GraduationCap className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">{candidate.education_degree}</p>
              <p className="text-xs text-slate-500">{candidate.education_university}{candidate.graduation_year ? ` · ${candidate.graduation_year}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
        {candidate.linkedin && (
          <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-white hover:bg-white/10"><ExternalLink className="w-3 h-3" /> LinkedIn</Button>
          </a>
        )}
        {candidate.portfolio && (
          <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-white hover:bg-white/10"><ExternalLink className="w-3 h-3" /> Portfolio</Button>
          </a>
        )}
        {candidate.resume_url && (
          <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 border-white/10 text-white hover:bg-white/10"><ExternalLink className="w-3 h-3" /> Resume</Button>
          </a>
        )}
      </div>
    </div>
  );
}