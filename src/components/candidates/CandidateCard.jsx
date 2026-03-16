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
                {candidate.full_name}
              </h3>
              {candidate.open_to_work && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Open to work</Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{candidate.job_title}</p>

            <div className="flex flex-wrap items-center gap-3 mt-2">
              {candidate.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {candidate.location}
                </span>
              )}
              {candidate.years_of_experience != null && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="w-3 h-3" /> {candidate.years_of_experience} yrs exp
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
        </div>
      </Card>
    </Link>
  );
}