import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { Decision } from '@shared/types/index.js';
import { api } from '../lib/api.js';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadHistory = async () => {
    try {
      setLoading(true);
      let query = `/api/decisions?limit=50`;
      if (selectedCategory !== 'all') query += `&category=${encodeURIComponent(selectedCategory)}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get<{ items: Decision[]; total: number }>(query);
      setDecisions(res.items || []);
    } catch (err) {
      console.error('Failed to load decision history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#265347] dark:text-[#5EAD9C]">
            PAST INQUIRIES
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 dark:text-stone-100">
            Decision History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            All the questions you've explored, framed, and reflected on.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/decisions/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>New decision</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#152226] text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#152226] text-xs text-stone-700 dark:text-stone-300 outline-none focus:border-amber-500 transition-all cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Domains</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Financial">Financial</option>
            <option value="Relocation">Relocation</option>
            <option value="Health">Health</option>
            <option value="Travel">Travel</option>
          </select>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 p-6 sm:p-7 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Loading decisions...
          </div>
        ) : decisions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FolderOpen className="w-8 h-8 mx-auto text-stone-400" />
            <p className="text-xs text-stone-400">
              No decisions found matching your filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-white/5">
            {decisions.map((decision) => {
              const isComplete = decision.status === 'decided';
              const formattedDate = new Date(decision.updated_at || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={decision.id}
                  onClick={() => navigate(`/app/decisions/${decision.id}`)}
                  className="group py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
                      {decision.title}
                    </h3>
                    {decision.description && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                        {decision.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-400 dark:text-stone-500">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isComplete
                            ? 'bg-[#DDF5EC] text-[#12644F] dark:bg-[#183932] dark:text-[#4FD1A5]'
                            : 'bg-[#FFF3D6] text-[#8C6010] dark:bg-[#382E19] dark:text-[#E8B75B]'
                        }`}
                      >
                        {isComplete ? 'complete' : 'in progress'}
                      </span>
                      <span>{decision.category || 'General'}</span>
                      <span>Updated {formattedDate}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
