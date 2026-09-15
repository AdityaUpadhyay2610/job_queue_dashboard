import React, { useState, useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Job, JobStatus, CreateJobInput } from './types/job';
import { api } from './services/api';
import { SummaryMetrics } from './components/SummaryMetrics';
import { FilterBar } from './components/FilterBar';
import { JobTable } from './components/JobTable';
import { CreateJobModal } from './components/CreateJobModal';
import { Toast, ToastMessage } from './components/Toast';

// Main dashboard container component managing state, live polling, and user actions
export function App() {
  // State for current view's jobs and global unfiltered jobs for metrics
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobsForStats, setAllJobsForStats] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [pollingActive, setPollingActive] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Helper to trigger toast alerts
  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type });
  };

  // Fetch jobs from backend (silent = true prevents full page loading spinner during polling)
  const loadJobs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Fetch all jobs for accurate global stats
      const statsData = await api.getJobs();
      setAllJobsForStats(statsData);

      // Fetch filtered jobs for the current view
      const filteredData = await api.getJobs(selectedFilter);
      setJobs(filteredData);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      if (!silent) {
        showToast(err.message || 'Failed to load jobs from server');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load jobs on initial render and whenever the filter changes
  useEffect(() => {
    loadJobs(false);
  }, [selectedFilter]);

  // Live polling effect running every 3 seconds
  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(() => {
      loadJobs(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedFilter, pollingActive]);

  // Handler to enqueue a new job
  const handleCreateJob = async (input: CreateJobInput) => {
    try {
      setIsSubmitting(true);
      await api.createJob(input);
      setIsModalOpen(false);
      showToast(`Job "${input.title}" enqueued successfully`, 'success');
      await loadJobs(false);
    } catch (err: any) {
      console.error('Error enqueuing job:', err);
      showToast(err.message || 'Failed to enqueue job', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler to update status with state machine and concurrency checks
  const handleUpdateStatus = async (id: number, newStatus: JobStatus) => {
    try {
      setIsActionInProgress(true);
      await api.updateJobStatus(id, newStatus);
      showToast(`Job #${id} transitioned to ${newStatus}`, 'success');
      await loadJobs(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast(err.message || 'Failed to update job status', 'error');
      await loadJobs(false);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handler to delete a job
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete Job #${id}?`)) {
      return;
    }

    try {
      setIsActionInProgress(true);
      await api.deleteJob(id);
      showToast(`Job #${id} deleted`, 'success');
      await loadJobs(false);
    } catch (err: any) {
      console.error('Error deleting job:', err);
      showToast(err.message || 'Failed to delete job', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Client-side search filtering across title, type, and ID
  const visibleJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.type.toLowerCase().includes(q) ||
      job.id.toString().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-700">
      <div className="max-w-[1300px] w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Header with branding and action controls */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Mini Job Queue
                </h1>
                <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  OCC STATE MACHINE
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Distributed State Machine & Concurrency Control Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live 3s polling indicator and toggle */}
            <button
              onClick={() => setPollingActive(!pollingActive)}
              title={pollingActive ? 'Click to pause live polling' : 'Click to resume live polling'}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  pollingActive
                    ? 'bg-emerald-500 pulse-animation'
                    : 'bg-slate-400'
                }`}
              />
              <span>Live 3s Polling</span>
            </button>

            {/* Enqueue new job trigger button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus size={15} /> Enqueue Job
            </button>
          </div>
        </header>

        {/* 5 metric summary cards */}
        <SummaryMetrics jobs={allJobsForStats} />

        {/* Filter and search toolbar */}
        <FilterBar
          currentFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadJobs(false)}
          loading={loading}
        />

        {/* Jobs list grid or empty state */}
        <JobTable
          jobs={visibleJobs}
          searchQuery={searchQuery}
          onOpenCreateModal={() => setIsModalOpen(true)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteJob={handleDeleteJob}
          isActionInProgress={isActionInProgress}
        />
      </div>

      {/* Footer bar */}
      <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-4 px-6 mt-10">
        <div className="max-w-[1300px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Production-grade NestJS & React Mini Job Queue Dashboard</span>
          <span className="font-mono text-[11px] text-indigo-600">
            NestJS • TypeORM SQLite • React • State Machine
          </span>
        </div>
      </footer>

      {/* Create job modal dialog */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateJob}
        isSubmitting={isSubmitting}
      />

      {/* Toast notification component */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
