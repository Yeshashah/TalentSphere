import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';

const STATUS_CONFIG = {
  applied:   { label: 'Applied',    color: 'bg-blue-100 text-blue-700' },
  screening: { label: 'Screening',  color: 'bg-yellow-100 text-yellow-700' },
  interview: { label: 'Interview',  color: 'bg-purple-100 text-purple-700' },
  offer:     { label: 'Offer',      color: 'bg-green-100 text-green-700' },
  hired:     { label: 'Hired',      color: 'bg-emerald-100 text-emerald-700' },
  rejected:  { label: 'Rejected',   color: 'bg-red-100 text-red-700' },
};

const STEPS = ['applied', 'screening', 'interview', 'offer', 'hired'];

export default function ApplicationTracker() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications-track', user?.email],
    queryFn: () => base44.entities.Application.filter({ candidate_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  if (isLoading) return <LoadingSpinner />;
  if (applications.length === 0) {
    return <EmptyState icon={Briefcase} title="No applications yet" description="Apply to jobs to track your progress here" />;
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <h2 className="text-lg font-bold text-slate-900">Track Applications</h2>

      {applications.map(app => {
        const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
        const isRejected = app.status === 'rejected';
        const currentStep = isRejected ? -1 : STEPS.indexOf(app.status);

        return (
          <div key={app.id} className="border rounded-xl p-5 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{app.job_title}</p>
                  <p className="text-sm text-slate-500">{app.company_name}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>

            {/* Progress bar */}
            {!isRejected ? (
              <div className="flex items-center gap-1">
                {STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  return (
                    <React.Fragment key={step}>
                      <div className={`flex flex-col items-center`} style={{ flex: 1 }}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          done ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {done ? '✓' : idx + 1}
                        </div>
                        <span className={`text-xs mt-1 capitalize ${done ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                          {STATUS_CONFIG[step].label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mb-4 ${idx < currentStep ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                This application was not moved forward.
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              Applied {formatDistanceToNow(new Date(app.created_date), { addSuffix: true })}
            </div>
          </div>
        );
      })}
    </div>
  );
}