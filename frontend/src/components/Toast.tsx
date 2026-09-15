import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

// Toast notification message interface
export interface ToastMessage {
  type: 'error' | 'success' | 'warning';
  message: string;
}

// Component props for Toast
interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

// Floating notification toast for displaying errors, conflict alerts, and successes
export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-md">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${
          isError
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
      >
        {/* Status icon */}
        <div className="mt-0.5">
          {isError ? (
            <AlertTriangle size={18} className="text-rose-600" />
          ) : (
            <CheckCircle size={18} className="text-emerald-600" />
          )}
        </div>

        {/* Message body */}
        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
