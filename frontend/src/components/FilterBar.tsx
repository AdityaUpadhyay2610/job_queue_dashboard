import React from 'react';
import { Filter, Search, RotateCw } from 'lucide-react';

// Component props for FilterBar
interface FilterBarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

// Filter and search toolbar component
export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
}) => {
  // Available filter tabs
  const tabs = [
    { key: 'all', label: 'All Jobs' },
    { key: 'pending', label: 'Pending' },
    { key: 'running', label: 'Running' },
    { key: 'completed', label: 'Completed' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Filter status tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="text-indigo-600 pl-2 pr-1 flex items-center">
          <Filter size={16} />
        </div>
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Real-time search box and manual refresh button */}
      <div className="flex items-center gap-2 max-w-md w-full md:w-auto">
        <div className="relative flex-1 md:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, type, ID..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh jobs"
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-50"
        >
          <RotateCw
            size={14}
            className={loading ? 'animate-spin text-indigo-600' : ''}
          />
        </button>
      </div>
    </div>
  );
};
