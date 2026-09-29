import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Clock, MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Decision } from '@shared/types/index.js';
import { VoiceDictationButton } from '../components/ui/VoiceDictationButton.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputThought, setInputThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-aware warm greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    async function loadRecentDecisions() {
      try {
        setLoading(true);
        const res = await api.get<{ items: Decision[] }>('/api/decisions?limit=8');
        setDecisions(res.items || []);
      } catch (err) {
        console.error('Failed to load recent thoughts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecentDecisions();
  }, []);

  const handleStartThinking = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputThought.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      // Derive a gentle title from the first sentence or first few words
      const firstSentence = trimmed.split(/[.?!]/)[0] || trimmed;
      const title = firstSentence.length > 50
        ? firstSentence.slice(0, 48) + '...'
        : firstSentence;

      // 1. Create decision
      const createRes = await api.post<{ decision: Decision }>('/api/decisions', {
        title: title || 'Something on my mind',
        description: trimmed,
        category: 'Custom',
      });

      const newDecision = createRes.decision;

      // 2. Seed basic starting options so thinking can begin immediately
      await api.post(`/api/decisions/${newDecision.id}/alternatives`, {
        alternatives: [
          {
            name: 'Lean towards taking it',
            description: 'Go ahead with this choice and adapt along the way',
            values: {},
          },
          {
            name: 'Hold back or find an alternative',
            description: 'Protect your peace of mind and look for closer/different options',
            values: {},
          },
        ],
      });

      // 3. Immediately open the conversational decision thinking space
      navigate(`/app/decisions/${newDecision.id}`);
    } catch (err: any) {
      alert(err?.message || 'Could not start thinking through this right now.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-14 px-4 space-y-12">
      {/* 1. Calm, Human Greeting */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {getGreeting()}, {displayName}.
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal">
          What are you trying to figure out today?
        </p>
      </div>

      {/* 2. ONE LARGE, SIMPLE INPUT */}
      <form onSubmit={handleStartThinking} className="space-y-4">
        <div className="relative rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-sm focus-within:border-slate-400 dark:focus-within:border-white/30 focus-within:shadow-md transition-all">
          <textarea
            rows={5}
            value={inputThought}
            onChange={(e) => setInputThought(e.target.value)}
            placeholder="Tell me what's going on…"
            className="w-full p-4 sm:p-5 text-sm sm:text-base bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none leading-relaxed"
            disabled={isSubmitting}
            autoFocus
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:px-4 sm:pb-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-2xl">
            <div className="flex items-center gap-2">
              <VoiceDictationButton
                onTranscript={(transcript) => {
                  setInputThought((prev) => (prev ? prev + ' ' + transcript : transcript));
                }}
              />
              <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                Tap mic to dictate or write your choice above
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inputThought.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all disabled:opacity-40 disabled:pointer-events-none self-end"
            >
              {isSubmitting ? (
                <span>Thinking with you...</span>
              ) : (
                <>
                  <span>Help me think about it</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 3. LIGHTWEIGHT RECENT THOUGHTS */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Things you've been figuring out
          </h2>
          {decisions.length > 0 && (
            <span className="text-[11px] text-slate-400">
              {decisions.length} {decisions.length === 1 ? 'thought' : 'thoughts'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-6 text-xs text-slate-400 text-center">
            Loading your notes...
          </div>
        ) : decisions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-500">
            Nothing logged yet. Write whatever choice is on your mind above to start thinking it through.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#111827] overflow-hidden">
            {decisions.map((decision) => (
              <div
                key={decision.id}
                onClick={() => navigate(`/app/decisions/${decision.id}`)}
                className="group p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                    {decision.title}
                  </h3>
                  {decision.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-lg">
                      {decision.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400 shrink-0">
                  <span className="text-[11px] hidden sm:inline">
                    {new Date(decision.updated_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
