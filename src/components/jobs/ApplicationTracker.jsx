import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

const STATUS_CONFIG = {
  applied:               { label: 'Applied',               color: 'bg-blue-100 text-blue-700' },
  'under review':        { label: 'Under Review',          color: 'bg-yellow-100 text-yellow-700' },
  'interview scheduled': { label: 'Interview Scheduled',   color: 'bg-indigo-100 text-indigo-700' },
  'interview complete':  { label: 'Interview Complete',    color: 'bg-purple-100 text-purple-700' },
  'under evaluation':    { label: 'Under Evaluation',     color: 'bg-orange-100 text-orange-700' },
  'offer extended':      { label: 'Offer Extended',        color: 'bg-green-100 text-green-700' },
  hired:                 { label: 'Hired',                 color: 'bg-emerald-100 text-emerald-700' },
  rejected:              { label: 'Rejected',              color: 'bg-red-100 text-red-700' },
  withdrawn:             { label: 'Withdrawn',             color: 'bg-slate-100 text-slate-600' },
};

const STEPS = ['applied', 'under review', 'interview scheduled', 'interview complete', 'under evaluation', 'offer extended'];

export default function ApplicationTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['my-applications-track', user?.email],
    queryFn: () => base44.entities.Application.filter({ candidate_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const withdrawMutation = useMutation({
    mutationFn: (appId) => base44.entities.Application.update(appId, { status: 'withdrawn' }),
    onSuccess: () => {
      toast({ title: 'Application withdrawn', duration: 2000 });
      queryClient.invalidateQueries({ queryKey: ['my-applications-track'] });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (applications.length === 0) {
    return <EmptyState icon={Briefcase} title="No applications yet" description="Apply to jobs to track your progress here" />;
  }

  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <h2 className="text-lg font-bold text-slate-900">Track Applications</h2>

      {applications.map(app => {
        const status = app.status || 'applied';
        const isRejected = status === 'rejected';
        const isWithdrawn = status === 'withdrawn';
        const isHired = status === 'hired';
        const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
        const currentStep = STEPS.indexOf(status);
        const isTerminal = isRejected || isWithdrawn || isHired;

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
            {!isTerminal ? (
              <div className="flex items-center">
                {STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center" style={{ flex: 1 }}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                          {done ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-1 text-center leading-tight ${done ? 'text-indigo-600 font-medium' : 'text-slate-400'}`} style={{ fontSize: '10px' }}>
                          {STATUS_CONFIG[step].label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={`h-0.5 mb-4 ${idx < currentStep ? 'bg-indigo-500' : 'bg-slate-200'}`} style={{ flex: 0.5 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className={`p-3 rounded-lg text-sm ${
                isRejected
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : isHired
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-slate-50 border border-slate-200 text-slate-600'
              }`}>
                {isRejected ? 'This application was not moved forward.' : isHired ? '🎉 Congratulations! You have been hired.' : 'You have withdrawn this application.'}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                Applied {formatDistanceToNow(new Date(app.created_date), { addSuffix: true })}
              </div>
              {!isTerminal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                  onClick={() => withdrawMutation.mutate(app.id)}
                  disabled={withdrawMutation.isPending}
                >
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}