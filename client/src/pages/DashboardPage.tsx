import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    async function loadDecisions() {
      try {
        setLoading(true);
        const res = await api.get<{ items: Decision[] }>('/api/decisions?limit=10');
        setDecisions(res.items || []);
      } catch (err) {
        console.error('Failed to load decisions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDecisions();
  }, []);

  const handleStartThinking = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputThought.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const firstSentence = trimmed.split(/[.?!]/)[0] || trimmed;
      const title = firstSentence.length > 55 ? firstSentence.slice(0, 52) + '...' : firstSentence;

      const createRes = await api.post<{ decision: Decision }>('/api/decisions', {
        title: title || 'Something on my mind',
        description: trimmed,
        category: 'Personal',
      });

      const newDecision = createRes.decision;

      await api.post(`/api/decisions/${newDecision.id}/alternatives`, {
        alternatives: [
          {
            name: 'Lean towards Option A',
            description: 'Move forward with this direction',
            values: {},
          },
          {
            name: 'Lean towards Option B',
            description: 'Take the alternative route',
            values: {},
          },
        ],
      });

      navigate(`/app/decisions/${newDecision.id}`);
    } catch (err: any) {
      alert(err?.message || 'Could not start thinking through this right now.');
      setIsSubmitting(false);
    }
  };

  const inProgressCount = decisions.filter(
    (d) => !d.status || d.status === 'draft' || d.status === 'in_progress'
  ).length || (decisions.length > 0 ? decisions.length : 2);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Header Section (matches Picture 2) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#265347] dark:text-[#5EAD9C]">
            GOOD TO SEE YOU
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-stone-900 dark:text-stone-100">
            Make room for the real question.
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-xl">
            A calm place to put the things you are carrying, before they become things you are avoiding.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/decisions/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>New decision</span>
        </button>
      </div>

      {/* Quick Dictate & Start Input */}
      <form onSubmit={handleStartThinking} className="space-y-3">
        <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 p-4 sm:p-5 shadow-sm transition-all focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20">
          <textarea
            rows={2}
            value={inputThought}
            onChange={(e) => setInputThought(e.target.value)}
            placeholder="Tell me what's going on... (or tap the mic to speak)"
            className="w-full text-sm sm:text-base bg-transparent border-0 outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-none leading-relaxed"
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-white/5 mt-2">
            <div className="flex items-center gap-2">
              <VoiceDictationButton
                onTranscript={(transcript) => {
                  setInputThought((prev) => (prev ? prev + ' ' + transcript : transcript));
                }}
              />
              <span className="text-[11px] text-stone-400 italic hidden sm:inline">
                Tap mic to dictate with AssemblyAI
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inputThought.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 disabled:opacity-40 transition-all cursor-pointer"
            >
              <span>{isSubmitting ? 'Starting...' : 'Help me think about it'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* 2-Column Dashboard Grid (matches Picture 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Decisions (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-stone-900 dark:text-stone-100">
              Recent decisions
            </h2>
            <button
              onClick={() => navigate('/app/history')}
              className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View history</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Loading decisions...
            </div>
          ) : decisions.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-stone-400">
                No decisions yet. Click <span className="font-semibold text-amber-500">+ New decision</span> above to frame your first question.
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
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
                        {decision.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-400 dark:text-stone-500">
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

        {/* Right Column (4 cols): In Motion & Active Goals */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: In Motion */}
          <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 p-6 shadow-sm relative overflow-hidden">
            {/* Decorative background curve */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full border border-stone-200/60 dark:border-white/5 pointer-events-none" />

            <p className="text-xs text-stone-400 font-medium">In motion</p>
            <p className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
              {inProgressCount}
            </p>
            <p className="text-xs text-stone-400 mt-1">decisions still open</p>
          </div>

          {/* Card 2: Active Goals */}
          <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100">
                Active goals
              </h3>
              <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Choose with enough honesty that the next step feels like yours.
            </p>

            {/* Progress Bar */}
            <div className="pt-2 space-y-1.5">
              <div className="h-1.5 w-full bg-stone-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#5EAD9C] rounded-full w-[82%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>Personal clarity</span>
                <span>82%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
