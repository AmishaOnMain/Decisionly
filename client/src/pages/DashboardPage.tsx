import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FolderLock,
  History,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Decision, PersonalContextEntry } from '@shared/types/index.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [contextEntries, setContextEntries] = useState<PersonalContextEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [decRes, ctxRes] = await Promise.all([
          api.get<{ items: Decision[]; total: number }>('/api/decisions?limit=6'),
          api.get<{ items: PersonalContextEntry[] }>('/api/personal-context'),
        ]);
        setDecisions(decRes.items || []);
        setContextEntries(ctxRes.items || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const analyzedCount = decisions.filter((d) => d.status === 'analyzed').length;
  const outcomeCount = decisions.filter((d) => d.chosen_alternative_id).length;
  const activeGoals = contextEntries.filter((c) => c.entry_type === 'goal' && !c.archived_at);
  const reviewDueCount = contextEntries.filter(
    (c) => c.review_at && new Date(c.review_at) <= new Date() && !c.archived_at
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome & Primary CTA Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 via-indigo-900/30 to-slate-900/60 dark:from-brand-950/80 dark:via-indigo-950/60 dark:to-[#111827] border border-brand-500/20 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Decision Intelligence Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.display_name || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            You have {decisions.length} decision records and {contextEntries.length} verified personal context factors ready to evaluate.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/app/decisions/new')}
          icon={<PlusCircle className="w-5 h-5" />}
          className="shadow-glow-brand shrink-0"
        >
          New Decision
        </Button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Decisions
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {decisions.length}
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Analyzed
          </span>
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {analyzedCount}
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Outcomes Logged
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {outcomeCount}
          </div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Personal Space
          </span>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
            <span>{contextEntries.length}</span>
            {reviewDueCount > 0 && (
              <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                {reviewDueCount} review due
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Decisions & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Decisions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Decisions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your current dilemmas, comparisons, and outcome histories.
              </p>
            </div>
            <Link
              to="/app/history"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading decisions...</div>
          ) : decisions.length === 0 ? (
            <Card className="p-8 text-center space-y-3 border-dashed border-slate-300 dark:border-white/10">
              <FileText className="w-8 h-8 mx-auto text-slate-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  No decisions created yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Start your first decision comparison to structure alternatives, criteria, and personal context.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app/decisions/new')}
                icon={<PlusCircle className="w-4 h-4" />}
              >
                Create First Decision
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {decisions.slice(0, 5).map((decision) => (
                <Card
                  key={decision.id}
                  onClick={() => navigate(`/app/decisions/${decision.id}`)}
                  className="p-4 border-slate-200 dark:border-white/10 hover:border-brand-500/40 cursor-pointer transition-all glow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge category={decision.category} size="sm">
                          {decision.category}
                        </Badge>
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
                            <CheckCircle2 className="w-3 h-3" /> Outcome Recorded
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {decision.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {decision.description}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 shrink-0 space-y-1">
                      {decision.deadline && (
                        <div className="flex items-center gap-1 justify-end text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3 h-3" />
                          <span>Due {decision.deadline}</span>
                        </div>
                      )}
                      <div>Updated {new Date(decision.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Goals & Personal Space Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Space
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your standing goals and boundaries.
              </p>
            </div>
            <Link
              to="/app/personal-space"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Manage
            </Link>
          </div>

          <Card className="p-4 border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Active Goals ({activeGoals.length})</span>
              <Link
                to="/app/personal-space/new"
                className="text-brand-600 dark:text-brand-400 hover:underline text-[11px]"
              >
                + Add Goal
              </Link>
            </div>

            {activeGoals.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No active goals added yet. Add goals in Personal Space so Decisionly can align your decisions with what matters to you.
              </p>
            ) : (
              <div className="space-y-2">
                {activeGoals.slice(0, 4).map((goal) => (
                  <div
                    key={goal.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {goal.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{goal.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Privacy Guarantee Card */}
          <Card className="p-4 border-slate-200 dark:border-white/10 bg-brand-500/5 dark:bg-brand-950/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Privacy & AI Ethics Pledge
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Your decisions and personal context belong solely to you. We calculate scores deterministically and transmit only user-approved context to Groq for grounded language synthesis.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
