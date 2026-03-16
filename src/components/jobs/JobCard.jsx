import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeLabels = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract',
  freelance: 'Freelance', internship: 'Internship'
};
const modeLabels = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };

export default function JobCard({ job }) {
  return (
    <Link to={`/JobDetail?id=${job.id}`}>
      <Card className="p-6 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start gap-4">
          {job.company_logo ? (
            <img src={job.company_logo} alt="" className="w-12 h-12 rounded-xl object-cover border" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{job.company_name}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {job.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
              {job.employment_type && (
                <Badge variant="secondary" className="text-xs">{typeLabels[job.employment_type] || job.employment_type}</Badge>
              )}
              {job.work_mode && (
                <Badge variant="outline" className="text-xs">{modeLabels[job.work_mode] || job.work_mode}</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3">
              {(job.salary_min || job.salary_max) && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <DollarSign className="w-3 h-3" />
                  {job.salary_min && job.salary_max
                    ? `$${(job.salary_min/1000).toFixed(0)}k - $${(job.salary_max/1000).toFixed(0)}k`
                    : job.salary_min ? `From $${(job.salary_min/1000).toFixed(0)}k` : `Up to $${(job.salary_max/1000).toFixed(0)}k`}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
              </span>
            </div>

            {job.skills_required?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills_required.slice(0, 4).map(s => (
                  <Badge key={s} variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 border-0">{s}</Badge>
                ))}
                {job.skills_required.length > 4 && (
                  <Badge variant="secondary" className="text-xs">+{job.skills_required.length - 4}</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}