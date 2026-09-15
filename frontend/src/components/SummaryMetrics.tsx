import React from 'react';
import { Layers, Clock, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Job } from '../types/job';

// Component props for SummaryMetrics
interface SummaryMetricsProps {
  jobs: Job[];
}

// Summary metrics bar displaying counts for Total, Pending, Running, Completed, and Failed jobs
export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ jobs }) => {
  // Compute metric counts dynamically from all jobs
  const total = jobs.length;
  const pending = jobs.filter((j) => j.status === 'pending').length;
  const running = jobs.filter((j) => j.status === 'running').length;
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const failed = jobs.filter((j) => j.status === 'failed').length;

  // Metric card configurations
  const metrics = [
    {
      title: 'TOTAL JOBS',
      count: total,
      icon: <Layers size={16} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      hasHighlight: true,
    },
    {
      title: 'PENDING QUEUE',
      count: pending,
      icon: <Clock size={16} className="text-amber-600" />,
      iconBg: 'bg-amber-50',
      hasHighlight: false,
    },
    {
      title: 'IN PROGRESS',
      count: running,
      icon: <RotateCw size={16} className="text-sky-600" />,
      iconBg: 'bg-sky-50',
      hasHighlight: false,
    },
    {
      title: 'COMPLETED',
      count: completed,
      icon: <CheckCircle2 size={16} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      hasHighlight: false,
    },
    {
      title: 'FAILED / ERRORED',
      count: failed,
      icon: <AlertCircle size={16} className="text-rose-600" />,
      iconBg: 'bg-rose-50',
      hasHighlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          {/* Bottom accent glow for Total Jobs */}
          {m.hasHighlight && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          )}

          {/* Card header with title and icon */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              {m.title}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${m.iconBg}`}
            >
              {m.icon}
            </div>
          </div>

          {/* Count value and unit */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {m.count}
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              JOBS
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
