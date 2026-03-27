import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, User, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';

const availabilityLabels = {
  immediate: 'Immediate', '2_weeks': '2 weeks', '1_month': '1 month',
  '2_months': '2 months', '3_months_plus': '3+ months'
};

export default function CandidateCard({ candidate, onSaveChange }) {
  const [isSaved, setIsSaved] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: savedItem } = useQuery({
    queryKey: ['saved-candidate', user?.email, candidate.id],
    queryFn: async () => {
      if (!user?.email) return null;
      const saved = await base44.entities.SavedItem.filter({
        user_email: user.email,
        item_type: 'candidate',
        item_id: candidate.id,
      });
      return saved[0] || null;
    },
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (savedItem) {
        await base44.entities.SavedItem.delete(savedItem.id);
        setIsSaved(false);
      } else {
        await base44.entities.SavedItem.create({
          user_email: user.email,
          item_type: 'candidate',
          item_id: candidate.id,
          item_title: candidate.full_name,
          item_subtitle: candidate.job_title,
        });
        setIsSaved(true);
      }
      onSaveChange?.();
    },
  });

  useEffect(() => {
    setIsSaved(!!savedItem);
  }, [savedItem]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <Link to={`/CandidateDetail?id=${candidate.id}`}>
      <Card className="p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start gap-4">
          {candidate.avatar_url ? (
            <img src={candidate.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {candidate.full_name || candidate.name}
              </h3>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{candidate.job_title || candidate.headline}</p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {candidate.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {candidate.location || candidate.region}
                </span>
              )}
              {candidate.years_of_experience != null && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="w-3 h-3" /> {candidate.years_of_experience || candidate.years_of_experience_raw} yrs exp
                </span>
              )}
              {candidate.availability && (
                <Badge variant="outline" className="text-xs">
                  {availabilityLabels[candidate.availability] || candidate.availability}
                </Badge>
              )}
            </div>

            {candidate.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.skills.slice(0, 5).map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 border-0">{s}</Badge>
                ))}
                {candidate.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">+{candidate.skills.length - 5}</Badge>
                )}
              </div>
            )}
          </div>
          {user?.role === 'company' && (
            <Button
              onClick={handleSaveClick}
              size="sm"
              className={`gap-1 ml-2 ${isSaved ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : ''}`}
              variant={isSaved ? undefined : 'outline'}
            >
              <Bookmark className="w-4 h-4" />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>
      </Card>
    </Link>
  );
}