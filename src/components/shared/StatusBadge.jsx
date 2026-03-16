import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  applied: { label: 'Applied', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  screening: { label: 'Screening', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  interview: { label: 'Interview', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  offer: { label: 'Offer', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
  hired: { label: 'Hired', className: 'bg-green-50 text-green-700 border-green-200' },
  open: { label: 'Open', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Closed', className: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}