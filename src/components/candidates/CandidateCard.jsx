import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, User } from 'lucide-react';

const availabilityLabels = {
  immediate: 'Immediate', '2_weeks': '2 weeks', '1_month': '1 month',
  '2_months': '2 months', '3_months_plus': '3+ months'
};

export default function CandidateCard({ candidate }) {
  return (
    <Link to={`/CandidateDetail?id=${candidate.id}`}>
      <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start gap-4">
          {candidate.avatar_url ? (
            <img src={candidate.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-xl" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-500/40 border border-white/10 flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                {candidate.full_name || candidate.name}
              </h3>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{candidate.job_title || candidate.headline}</p>

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
                <Badge variant="outline" className="text-xs border-white/10 text-slate-400">
                  {availabilityLabels[candidate.availability] || candidate.availability}
                </Badge>
              )}
            </div>

            {candidate.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.skills.slice(0, 5).map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{s}</Badge>
                ))}
                {candidate.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs bg-white/5 text-slate-400 border border-white/10">+{candidate.skills.length - 5}</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}