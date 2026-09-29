import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Archive,
  Send,
} from 'lucide-react';
import {
  Decision,
  Alternative,
  Criterion,
  DeterministicResults,
  Analysis,
  DecisionContextSnapshot,
} from '@shared/types/index.js';
import { api } from '../lib/api.js';
import { MatrixTable } from '../components/decisions/MatrixTable.js';
import { VoiceDictationButton } from '../components/ui/VoiceDictationButton.js';

export const DecisionWorkspacePage: React.FC = () => {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<DeterministicResults | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);

  // Conversational state
  const [selectedPills, setSelectedPills] = useState<string[]>([]);
  const [userReflection, setUserReflection] = useState('');
  const [isSavingThought, setIsSavingThought] = useState(false);
  const [showAdvancedMatrix, setShowAdvancedMatrix] = useState(false);
  const [isSettled, setIsSettled] = useState(false);

  const loadDecision = async (autoTriggerAnalyze = false) => {
    if (!decisionId) return;
    try {
      setLoading(true);
      const res = await api.get<{
        decision: Decision;
        alternatives: Alternative[];
        criteria: Criterion[];
        scores: DeterministicResults;
        latestSnapshot: DecisionContextSnapshot | null;
        analyses: Analysis[];
      }>(`/api/decisions/${decisionId}`);

      setDecision(res.decision);
      setAlternatives(res.alternatives);
      setCriteria(res.criteria);
      setScores(res.scores);
      setIsSettled(Boolean(res.decision.chosen_alternative_id));

      if (res.analyses && res.analyses.length > 0) {
        setLatestAnalysis(res.analyses[0]);
      } else if (autoTriggerAnalyze || res.alternatives.length >= 2) {
        // Automatically start the conversational analysis so the user immediately gets a response
        await triggerAnalysis();
      }
    } catch (err) {
      console.error('Failed to load decision:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async (extraNote?: string) => {
    if (!decisionId) return;
    setAnalyzing(true);
    try {
      if (extraNote) {
        // Save the user's reflection note into decision specific context
        await api.post(`/api/decisions/${decisionId}/context-confirm`, {
          included_entry_ids: [],
          decision_specific_context: [extraNote],
        });
      }

      const res = await api.post<{
        analysis: Analysis;
        deterministicResults: DeterministicResults;
      }>(`/api/decisions/${decisionId}/analyze`);

      setLatestAnalysis(res.analysis);
      setScores(res.deterministicResults);
      setUserReflection('');
    } catch (err: any) {
      console.error('Conversation error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadDecision(true);
  }, [decisionId]);

  const handlePillClick = (pill: string) => {
    if (selectedPills.includes(pill)) {
      setSelectedPills(selectedPills.filter((p) => p !== pill));
    } else {
      setSelectedPills([...selectedPills, pill]);
    }
  };

  const handleSettleDecision = async () => {
    if (!decisionId) return;
    try {
      const topAltId =
        latestAnalysis?.ai_analysis?.finalVerdict?.recommendedAlternativeId ||
        alternatives[0]?.id ||
        null;

      await api.post(`/api/decisions/${decisionId}/outcome`, {
        chosen_alternative_id: topAltId,
        outcome_reflection: 'Decided after thinking through as a friend.',
      });

      setIsSettled(true);
      if (decision) {
        setDecision({ ...decision, chosen_alternative_id: topAltId });
      }
    } catch (err: any) {
      alert(err?.message || 'Could not record decision choice.');
    }
  };

  const handleDelete = async () => {
    if (!decision) return;
    if (confirm('Delete this thought?')) {
      await api.delete(`/api/decisions/${decision.id}`);
      navigate('/app');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-white animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Listening to your thoughts...</p>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
        <p className="text-sm text-slate-500">Thought not found.</p>
        <Link to="/app" className="text-xs font-semibold text-slate-900 dark:text-white underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const conversational = latestAnalysis?.ai_analysis?.conversational || {
    whatImHearing: decision.description
      ? `Okay, I get what's bothering you. You're weighing "${decision.title}" because: "${decision.description}".`
      : `Okay, I hear what you're working through. Let's look at what matters most to your everyday life.`,
    thinkingTogether: `If I were helping you think this through as a friend, I'd look at how this choice actually affects your daily energy, expenses, travel time, and long-term peace of mind.`,
    questionsToPonder: [
      'How much does everyday convenience and commute matter compared to potential upside?',
      'Is there something about this specific path that makes the friction truly worth it?',
    ],
    priorityPills: [
      'Growth & Opportunities',
      'Distance & Travel Time',
      'Expenses & Cost',
      'Daily Comfort',
      'Family',
      "I'm not sure yet",
    ],
    honestVerdict:
      latestAnalysis?.ai_analysis?.finalVerdict?.bottomLineReasoning ||
      `Honestly, take a step back and protect what matters most to your daily well-being. If the benefits don't heavily outweigh the friction, don't force it.`,
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 space-y-10">
      {/* 1. Top Quiet Header */}
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-100 dark:border-white/5 pb-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to thoughts</span>
        </Link>

        <div className="flex items-center gap-3">
          {isSettled ? (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" /> Settled
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              Thinking it through
            </span>
          )}
          <button
            onClick={handleDelete}
            title="Delete this thought"
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. What's on your mind (The Dilemma) */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          What you're figuring out
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
          {decision.title}
        </h1>
        {decision.description && decision.description !== decision.title && (
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed pt-1">
            "{decision.description}"
          </p>
        )}
      </div>

      {/* 3. Conversational Thought Stream (Like a smart friend who listened) */}
      {analyzing ? (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-center space-y-3">
          <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-slate-900 dark:border-t-white animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Reflecting on what you said...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section A: What I'm hearing */}
          <div className="space-y-2 p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> What I'm hearing
            </span>
            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              {conversational.whatImHearing}
            </p>
          </div>

          {/* Section B: Thinking together as a friend */}
          <div className="space-y-2 pl-1 sm:pl-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Let's think about it
            </span>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              {conversational.thinkingTogether}
            </p>
          </div>

          {/* Section C: Questions to ponder */}
          {conversational.questionsToPonder.length > 0 && (
            <div className="space-y-2.5 p-5 rounded-2xl bg-slate-50/40 dark:bg-white/[0.015] border border-slate-200/50 dark:border-white/5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Questions to ask yourself
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {conversational.questionsToPonder.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section D: Interactive Priority Pills (What matters most to you here?) */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              What matters most to you here?
            </span>
            <div className="flex flex-wrap gap-2">
              {conversational.priorityPills.map((pill) => {
                const isSelected = selectedPills.includes(pill);
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section E: Your Thoughts (Interactive note box) */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Your thoughts
            </span>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] focus-within:border-slate-400 dark:focus-within:border-white/30 transition-all p-3 space-y-2">
              <textarea
                rows={3}
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                placeholder="Write your answer or whatever came to mind..."
                className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <VoiceDictationButton
                    size="sm"
                    onTranscript={(transcript) => {
                      setUserReflection((prev) => (prev ? prev + ' ' + transcript : transcript));
                    }}
                  />
                  <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                    Tap mic to speak your reflection
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAnalysis(userReflection)}
                  disabled={!userReflection.trim() || analyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>Think together with this</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section F: Honest Suggestion / Verdict */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 dark:to-white/[0.02] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                My honest suggestion
              </span>
              {isSettled && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Settled as choice
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              {conversational.honestVerdict}
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSettleDecision}
                disabled={isSettled}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSettled ? 'Decision Recorded' : 'Settle on this direction'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerAnalysis()}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Refresh perspective
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Optional Technical Comparison Table (Completely tucked away) */}
      <div className="pt-6 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          onClick={() => setShowAdvancedMatrix(!showAdvancedMatrix)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
        >
          <span>View comparison table & raw options (optional)</span>
          {showAdvancedMatrix ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvancedMatrix && scores && (
          <div className="pt-4 space-y-4">
            <MatrixTable alternatives={alternatives} criteria={criteria} scores={scores} />
          </div>
        )}
      </div>
    </div>
  );
};
