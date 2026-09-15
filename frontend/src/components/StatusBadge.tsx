import React from 'react';
import { Clock, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { JobStatus } from '../types/job';

// Component props for StatusBadge
interface StatusBadgeProps {
  status: JobStatus;
}

// Color-coded badge with icons representing current job status
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    // Pending status badge (amber with clock icon)
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 uppercase tracking-wider">
          <Clock size={12} className="text-amber-600" />
          pending
        </span>
      );

    // Running status badge (sky blue with spinning rotate icon)
    case 'running':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 uppercase tracking-wider">
          <RotateCw size={12} className="animate-spin text-sky-600" />
          running
        </span>
      );

    // Completed status badge (emerald with checkmark icon)
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
          <CheckCircle2 size={12} className="text-emerald-600" />
          completed
        </span>
      );

    // Failed status badge (rose with alert icon)
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wider">
          <AlertCircle size={12} className="text-rose-600" />
          failed
        </span>
      );

    default:
      return null;
  }
};
