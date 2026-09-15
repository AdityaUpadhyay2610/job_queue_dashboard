import React from 'react';
import { Inbox, Sparkles, Play, Check, X, Trash2 } from 'lucide-react';
import { Job, JobStatus } from '../types/job';
import { StatusBadge } from './StatusBadge';

// Component props for JobTable
interface JobTableProps {
  jobs: Job[];
  searchQuery: string;
  onOpenCreateModal: () => void;
  onUpdateStatus: (id: number, status: JobStatus) => Promise<void>;
  onDeleteJob: (id: number) => Promise<void>;
  isActionInProgress: boolean;
}

// Main content panel displaying the empty state or responsive grid of job cards
export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  searchQuery,
  onOpenCreateModal,
  onUpdateStatus,
  onDeleteJob,
  isActionInProgress,
}) => {
  // Render empty state placeholder if no jobs match current filters
  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl p-12 min-h-[400px] flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
          <Inbox size={30} />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
          No Jobs Found
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          {searchQuery
            ? `No jobs match your search "${searchQuery}". Try a different keyword.`
            : 'There are no jobs matching the active filter. Enqueue a job or adjust your filter.'}
        </p>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-full shadow-md shadow-indigo-600/25 transition-all"
        >
          <Sparkles size={14} /> Create First Job
        </button>
      </div>
    );
  }

  // Render responsive grid of active job cards
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => {
          // Format creation timestamp
          const formattedDate = new Date(job.createdAt).toLocaleString(
            undefined,
            {
              dateStyle: 'medium',
              timeStyle: 'short',
            },
          );

          return (
            <div
              key={job.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200"
            >
              {/* Card top: ID and Status badge */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{job.id}
                  </span>
                  <StatusBadge status={job.status} />
                </div>

                {/* Job title */}
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">
                  {job.title}
                </h4>

                {/* Job type and date */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 flex-wrap">
                  <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                    {job.type}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px]">{formattedDate}</span>
                </div>
              </div>

              {/* Card actions governed by state machine rules */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Pending jobs can only transition to running */}
                  {job.status === 'pending' && (
                    <button
                      disabled={isActionInProgress}
                      onClick={() => onUpdateStatus(job.id, 'running')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Play size={11} fill="currentColor" /> Start
                    </button>
                  )}

                  {/* Running jobs can transition to completed or failed */}
                  {job.status === 'running' && (
                    <>
                      <button
                        disabled={isActionInProgress}
                        onClick={() => onUpdateStatus(job.id, 'completed')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        <Check size={12} /> Complete
                      </button>
                      <button
                        disabled={isActionInProgress}
                        onClick={() => onUpdateStatus(job.id, 'failed')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                      >
                        <X size={12} /> Fail
                      </button>
                    </>
                  )}

                  {/* Terminal states cannot transition */}
                  {(job.status === 'completed' || job.status === 'failed') && (
                    <span className="text-[11px] font-semibold text-slate-400 italic">
                      Terminal State ({job.status})
                    </span>
                  )}
                </div>

                {/* Delete job button */}
                <button
                  disabled={isActionInProgress}
                  onClick={() => onDeleteJob(job.id)}
                  title="Delete Job"
                  className="w-7 h-7 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
