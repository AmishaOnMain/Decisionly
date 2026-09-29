import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { Decision } from '@shared/types/index.js';
import { TARGET_CATEGORIES, TargetCategory } from '@shared/constants/categories.js';
import { api } from '../lib/api.js';
import { Card } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      let query = `/api/decisions?includeArchived=${showArchived}`;
      if (selectedCategory !== 'all') query += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedStatus !== 'all') query += `&status=${encodeURIComponent(selectedStatus)}`;
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
  }, [search, selectedCategory, selectedStatus, showArchived]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Decision History
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Revisit past analyses, review outcomes, and track how your life choices evolved over time.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/app/decisions/new')}
          icon={<Sparkles className="w-4 h-4" />}
        >
          New Decision
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 border-slate-200 dark:border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white outline-none"
          >
            <option value="all">All Domains ({TARGET_CATEGORIES.length})</option>
            {TARGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="analyzed">Analyzed</option>
            </select>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                showArchived
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-50 dark:bg-[#090d16] border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </Card>

      {/* Decisions List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading decision history...
        </div>
      ) : decisions.length === 0 ? (
        <Card className="p-8 text-center space-y-3 border-dashed">
          <FolderOpen className="w-8 h-8 mx-auto text-slate-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No matching decisions found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search filters or start a new decision analysis.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card
              key={decision.id}
              onClick={() => navigate(`/app/decisions/${decision.id}`)}
              className="p-5 border-slate-200 dark:border-white/10 hover:border-brand-500/40 cursor-pointer transition-all glow-card"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge category={decision.category}>{decision.category}</Badge>
                    <Badge
                      variant={
                        decision.status === 'analyzed'
                          ? 'brand'
                          : decision.status === 'ready'
                          ? 'success'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {decision.status}
                    </Badge>
                    {decision.chosen_alternative_id && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Outcome Logged
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {decision.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {decision.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0 self-end sm:self-center">
                  <div className="text-right space-y-0.5 text-[11px]">
                    {decision.deadline && (
                      <div className="flex items-center gap-1 justify-end text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {decision.deadline}</span>
                      </div>
                    )}
                    <div>Updated {new Date(decision.updated_at).toLocaleDateString()}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
