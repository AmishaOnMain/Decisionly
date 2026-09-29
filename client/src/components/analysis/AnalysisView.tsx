import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileQuestion,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Scale,
  Compass,
  Check,
} from 'lucide-react';
import { AIAnalysisResponse, Alternative } from '@shared/types/index.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';

interface AnalysisViewProps {
  analysis: AIAnalysisResponse;
  alternatives: Alternative[];
  modelName?: string | null;
  createdAt?: string;
  chosenAlternativeId?: string | null;
  onAdoptRecommendation?: (alternativeId: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  alternatives,
  modelName,
  createdAt,
  chosenAlternativeId,
  onAdoptRecommendation,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const getAltName = (id: string) => {
    const found = alternatives.find((a) => a.id === id);
    return found ? found.name : id;
  };

  // Derive final verdict if not explicitly in response
  const verdict = analysis.finalVerdict || {
    recommendedAlternativeId: analysis.alternativeInsights[0]?.alternativeId || alternatives[0]?.id || '',
    verdictTitle: `Recommended Choice: ${getAltName(analysis.alternativeInsights[0]?.alternativeId || alternatives[0]?.id || '')}`,
    confidence: 'high' as const,
    bottomLineReasoning: analysis.summary || 'Based on your weighted criteria and priorities, this option delivers the greatest overall utility.',
    keyTradeOff: analysis.tradeOffs[0] || 'Balancing immediate execution speed against long-term flexibility.',
    nextAction: `Proceed with ${getAltName(analysis.alternativeInsights[0]?.alternativeId || alternatives[0]?.id || '')} as your primary choice.`,
  };

  const winningAlternative = alternatives.find((a) => a.id === verdict.recommendedAlternativeId) || alternatives[0];
  const isAlreadyChosen = chosenAlternativeId === verdict.recommendedAlternativeId;

  return (
    <div className="space-y-6">
      {/* 1. HERO FINAL VERDICT CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/15 via-brand-500/10 to-indigo-500/15 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-xl shadow-emerald-500/5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Final Decision Verdict
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {verdict.confidence === 'high' ? '🎯 High Confidence' : '⚖️ Balanced Match'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {winningAlternative?.name || verdict.verdictTitle}
              </h2>
            </div>
          </div>

          {onAdoptRecommendation && (
            <Button
              variant={isAlreadyChosen ? 'secondary' : 'primary'}
              onClick={() => onAdoptRecommendation(verdict.recommendedAlternativeId)}
              disabled={isAlreadyChosen}
              icon={isAlreadyChosen ? <Check className="w-4 h-4 text-emerald-500" /> : <ArrowRight className="w-4 h-4" />}
              className="shrink-0"
            >
              {isAlreadyChosen ? 'Adopted as Decision' : 'Choose This Decision'}
            </Button>
          )}
        </div>

        {/* Core Rationale in Plain English (No Confusion!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="md:col-span-2 space-y-3">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Why This Is Your Best Choice
              </span>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                {verdict.bottomLineReasoning}
              </p>
            </div>

            {/* Key Trade-off callout */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Key Trade-off to Accept
              </span>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {verdict.keyTradeOff}
              </p>
            </div>
          </div>

          {/* Action Step */}
          <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Recommended Action
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {verdict.nextAction}
              </p>
            </div>
            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
              Powered by Groq AI + Deterministic MAUT
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY */}
      <Card className="p-5 border-slate-200 dark:border-white/10 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-brand-500" /> Executive Summary
        </h4>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {analysis.summary}
        </p>
      </Card>

      {/* 3. SIMPLIFIED COMPARISON CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-500" /> Options Comparison
          </h4>
          <span className="text-xs text-slate-400">
            {alternatives.length} alternatives evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.alternativeInsights.map((insight) => {
            const isWinner = insight.alternativeId === verdict.recommendedAlternativeId;
            return (
              <Card
                key={insight.alternativeId}
                className={`p-5 space-y-4 transition-all ${
                  isWinner
                    ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/5'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-base font-bold text-slate-900 dark:text-white">
                        {getAltName(insight.alternativeId)}
                      </h5>
                      {isWinner && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                          Top Choice
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {insight.scoreContext}
                    </p>
                  </div>
                </div>

                {/* Advantages */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> What makes this strong
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                    {insight.advantages.slice(0, 3).map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>

                {/* Drawbacks */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Potential drawback
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                    {insight.drawbacks.slice(0, 2).map((drw, i) => (
                      <li key={i}>{drw}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. TOGGLE FOR DEEP TECHNICAL DETAILS (Keeps view clean & non-confusing!) */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>
              {showTechnicalDetails ? 'Hide Detailed Diagnostics & Risk Breakdown' : 'Show Detailed Diagnostics & Risk Breakdown (Optional)'}
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-200 dark:border-white/10 space-y-6">
            {/* Risks */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Grounded Risk Factors
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.risks.map((risk, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-white">
                        {risk.description}
                      </span>
                      <Badge variant={risk.likelihood === 'high' ? 'danger' : 'warning'} size="sm">
                        {risk.likelihood}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Applies to: {risk.appliesTo.map(getAltName).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumptions & Uncertainties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Key Assumptions
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {analysis.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <FileQuestion className="w-3.5 h-3.5" /> Missing Information
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {analysis.missingInformation.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Inquiries */}
            {analysis.followUpQuestions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Questions to Consider
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analysis.followUpQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <span className="font-bold text-brand-500 mr-1.5">Q{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advisory Note */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>💡 {analysis.overallNote}</span>
        {modelName && <span className="text-[11px] font-mono opacity-70">{modelName}</span>}
      </div>
    </div>
  );
};
