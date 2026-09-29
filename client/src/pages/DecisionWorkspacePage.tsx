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
  Send,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Target,
  Mic,
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
  const [showInsights, setShowInsights] = useState(false);

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
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Loading your thoughts...</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">Gathering context and running analysis</p>
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center mx-auto">
          <HelpCircle className="w-5 h-5 text-stone-400" />
        </div>
        <p className="text-sm text-stone-500">Thought not found.</p>
        <Link to="/app" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
          <ArrowLeft className="w-3 h-3" />
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

  const verdict = latestAnalysis?.ai_analysis?.finalVerdict;
  const insights = latestAnalysis?.ai_analysis?.alternativeInsights || [];
  const risks = latestAnalysis?.ai_analysis?.risks || [];
  const followUpQuestions = latestAnalysis?.ai_analysis?.followUpQuestions || [];

  const recommendedAlt = alternatives.find(
    (a) => a.id === verdict?.recommendedAlternativeId
  );

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4 space-y-8 animate-fade-up">
      {/* 1. Top Quiet Header */}
      <div className="flex items-center justify-between gap-3 text-xs text-stone-400 border-b border-stone-200/80 dark:border-white/5 pb-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 hover:text-stone-700 dark:hover:text-stone-200 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to thoughts</span>
        </Link>

        <div className="flex items-center gap-3">
          {isSettled ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3" /> Settled
            </span>
          ) : latestAnalysis ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" /> Analyzed
            </span>
          ) : (
            <span className="text-[11px] font-medium text-stone-400">
              Thinking it through
            </span>
          )}
          <button
            onClick={handleDelete}
            title="Delete this thought"
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. What's on your mind (The Dilemma) */}
      <div className="space-y-2 animate-fade-up animation-delay-100">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#265347] dark:text-[#5EAD9C]">
          WHAT YOU'RE FIGURING OUT
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight text-stone-900 dark:text-stone-100 leading-snug">
          {decision.title}
        </h1>
        {decision.description && decision.description !== decision.title && (
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-normal leading-relaxed pt-1 italic border-l-2 border-amber-400/40 pl-3">
            "{decision.description}"
          </p>
        )}
      </div>

      {/* 3. Conversational Thought Stream */}
      {analyzing ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 text-center space-y-4 shadow-sm animate-fade-in">
          <div className="relative mx-auto w-10 h-10">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Thinking it through with you...</p>
            <p className="text-xs text-stone-400 italic">Reading your context and weighing what matters</p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up animation-delay-200">

          {/* Section A: What I'm hearing */}
          <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 pb-4 space-y-3">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> What I'm hearing
              </span>
              <p className="text-sm sm:text-base text-stone-800 dark:text-stone-100 font-medium leading-relaxed">
                {conversational.whatImHearing}
              </p>
            </div>
            {/* Subtle amber accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-amber-400/60 via-amber-300/30 to-transparent" />
          </div>

          {/* Section B: Thinking together */}
          <div className="space-y-2 pl-1 sm:pl-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Let's think about it
            </span>
            <p className="text-sm sm:text-base text-stone-700 dark:text-stone-200 leading-relaxed font-normal">
              {conversational.thinkingTogether}
            </p>
          </div>

          {/* Section C: Questions to ponder */}
          {conversational.questionsToPonder.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm p-5 space-y-3">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Questions to ask yourself
              </span>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                {conversational.questionsToPonder.map((q, i) => (
                  <li key={i} className="flex items-start gap-2.5 group">
                    <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section D: Priority Pills */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#265347] dark:text-[#5EAD9C]" />
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-stone-900 border-amber-500 font-semibold shadow-md shadow-amber-500/20 scale-105'
                        : 'bg-stone-100/80 dark:bg-white/[0.04] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-white/5 hover:border-amber-400/50 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section E: Your Thoughts (Interactive note box) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              Your thoughts
            </span>
            <div className="rounded-2xl border border-stone-200/80 dark:border-white/5 bg-white dark:bg-[#152226] shadow-sm focus-within:border-amber-500/80 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all p-4 space-y-2">
              <textarea
                rows={3}
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                placeholder="Write your answer or whatever came to mind..."
                className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <VoiceDictationButton
                    size="sm"
                    onTranscript={(transcript) => {
                      setUserReflection((prev) => (prev ? prev + ' ' + transcript : transcript));
                    }}
                  />
                  <span className="text-[11px] text-stone-400 italic hidden sm:inline">
                    Tap mic to speak your reflection
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => triggerAnalysis(userReflection)}
                  disabled={!userReflection.trim() || analyzing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Think together with this</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section F: Honest Suggestion / Verdict */}
          <div className="verdict-card p-6 space-y-4 animate-fade-up animation-delay-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#265347] dark:text-[#5EAD9C] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MY HONEST SUGGESTION
                </span>
                {verdict && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    Confidence: <span className="font-semibold text-stone-600 dark:text-stone-300 capitalize">{verdict.confidence}</span>
                  </p>
                )}
              </div>
              {isSettled && (
                <span className="shrink-0 text-[10px] font-semibold text-[#12644F] bg-[#DDF5EC] dark:bg-[#183932] dark:text-[#4FD1A5] px-2.5 py-1 rounded-full">
                  ✓ Settled as choice
                </span>
              )}
            </div>

            {recommendedAlt && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  Leaning toward: <span className="text-amber-600 dark:text-amber-400">{recommendedAlt.name}</span>
                </p>
              </div>
            )}

            <p className="text-sm sm:text-base text-stone-800 dark:text-stone-100 font-serif font-normal leading-relaxed">
              {conversational.honestVerdict}
            </p>

            {verdict?.keyTradeOff && (
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed italic border-l-2 border-stone-200 dark:border-white/10 pl-3">
                Trade-off: {verdict.keyTradeOff}
              </p>
            )}

            {verdict?.nextAction && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#265347]/5 dark:bg-[#5EAD9C]/5 border border-[#265347]/15 dark:border-[#5EAD9C]/15">
                <TrendingUp className="w-3.5 h-3.5 text-[#265347] dark:text-[#5EAD9C] shrink-0" />
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-semibold">Next step:</span> {verdict.nextAction}
                </p>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSettleDecision}
                disabled={isSettled}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSettled ? 'Decision Recorded' : 'Settle on this direction'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerAnalysis()}
                className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Refresh perspective
              </button>
            </div>
          </div>

          {/* Section G: Deeper Insights (Expandable) */}
          {(insights.length > 0 || risks.length > 0 || followUpQuestions.length > 0) && (
            <div className="border border-stone-200/80 dark:border-white/5 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowInsights(!showInsights)}
                className="w-full flex items-center justify-between px-5 py-4 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-[#265347] dark:text-[#5EAD9C]" />
                  Deeper insights & risks
                </span>
                {showInsights ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showInsights && (
                <div className="px-5 pb-5 space-y-5 animate-fade-in border-t border-stone-200/80 dark:border-white/5 pt-4">
                  {/* Alternative-by-alternative insights */}
                  {insights.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Per-option breakdown
                      </h3>
                      {insights.map((insight: any) => {
                        const alt = alternatives.find((a) => a.id === insight.alternativeId);
                        return (
                          <div key={insight.alternativeId} className="rounded-xl bg-stone-50 dark:bg-white/[0.02] p-4 space-y-2 border border-stone-100 dark:border-white/5">
                            <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
                              {alt?.name || insight.alternativeId}
                            </p>
                            {insight.advantages?.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Advantages</p>
                                <ul className="space-y-0.5">
                                  {insight.advantages.map((adv: string, i: number) => (
                                    <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                                      <span className="text-emerald-500 mt-0.5">+</span> {adv}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {insight.drawbacks?.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wide">Drawbacks</p>
                                <ul className="space-y-0.5">
                                  {insight.drawbacks.map((drw: string, i: number) => (
                                    <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                                      <span className="text-rose-400 mt-0.5">−</span> {drw}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Risks */}
                  {risks.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Risks to be aware of
                      </h3>
                      <div className="space-y-2">
                        {risks.map((risk: any, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              risk.likelihood === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                              risk.likelihood === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-stone-100 text-stone-500 dark:bg-white/5 dark:text-stone-400'
                            }`}>
                              {risk.likelihood || '?'}
                            </span>
                            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{risk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up questions */}
                  {followUpQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                        Worth thinking about next
                      </h3>
                      <ul className="space-y-1.5">
                        {followUpQuestions.slice(0, 4).map((q: string, i: number) => (
                          <li key={i} className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Optional Technical Comparison Table */}
      <div className="pt-2 border-t border-stone-100 dark:border-white/5">
        <button
          type="button"
          onClick={() => setShowAdvancedMatrix(!showAdvancedMatrix)}
          className="flex items-center justify-between w-full text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors py-2 group"
        >
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 group-hover:text-[#265347] dark:group-hover:text-[#5EAD9C] transition-colors" />
            View comparison table & raw options (optional)
          </span>
          {showAdvancedMatrix ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvancedMatrix && scores && (
          <div className="pt-4 space-y-4 animate-fade-in">
            <MatrixTable alternatives={alternatives} criteria={criteria} scores={scores} />
          </div>
        )}
      </div>
    </div>
  );
};
