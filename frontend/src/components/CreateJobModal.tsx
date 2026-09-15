import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CreateJobInput } from '../types/job';

// Component props for CreateJobModal
interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  isSubmitting: boolean;
}

// Modal popup allowing users to enqueue new jobs with title and type
export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');

  if (!isOpen) return null;

  // Preset job types for quick selection
  const presetTypes = [
    'Email Notification',
    'Data Export',
    'Report Generation',
    'Image Processing',
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !type.trim()) {
      return;
    }
    await onSubmit({ title: title.trim(), type: type.trim() });
    setTitle('');
    setType('');
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal title and close button */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Enqueue New Job</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job title input */}
          <div>
            <label
              htmlFor="modal-title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Job Title
            </label>
            <input
              id="modal-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Export Q3 Financial Data"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>

          {/* Job type input and quick preset pills */}
          <div>
            <label
              htmlFor="modal-type"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Job Type
            </label>
            <input
              id="modal-type"
              type="text"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Data Export"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              {presetTypes.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setType(preset)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Form action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-full shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                'Enqueuing...'
              ) : (
                <>
                  <Plus size={14} /> Enqueue Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
