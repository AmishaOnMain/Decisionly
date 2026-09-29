import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Scale,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Lightbulb,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { AIAnalysisResponse, Alternative } from '@shared/types/index.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';

interface AnalysisViewProps {
  analysis: AIAnalysisResponse;
  alternatives: Alternative[];
  modelName?: string | null;
  createdAt?: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analysis,
  alternatives,
  modelName,
  createdAt,
}) => {
  const getAltName = (id: string) => {
    const found = alternatives.find((a) => a.id === id);
    return found ? found.name : id;
  };

  const getLikelihoodBadge = (likelihood: string) => {
    switch (likelihood) {
      case 'high':
        return <Badge variant="danger" size="sm">High Likelihood</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium Likelihood</Badge>;
      case 'low':
        return <Badge variant="brand" size="sm">Low Likelihood</Badge>;
      default:
        return <Badge variant="slate" size="sm">Unknown Likelihood</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 via-indigo-500/10 to-cyan-500/10 border border-brand-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Decision Intelligence Synthesis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded exclusively in your approved context and deterministic calculations.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-400 space-y-0.5">
          {modelName && <div>Engine: <span className="font-mono font-medium text-slate-700 dark:text-slate-200">{modelName}</span></div>}
          {createdAt && <div>Generated: {new Date(createdAt).toLocaleDateString()}</div>}
        </div>
      </div>

      {/* 1. Executive Summary */}
      <Card className="p-5 border-slate-200 dark:border-white/10 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
          <Compass className="w-4 h-4" /> Executive Summary
        </h4>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {analysis.summary}
        </p>
      </Card>

      {/* 2. Alternative Deep Dive Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-brand-500" /> Alternative Comparative Insights
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.alternativeInsights.map((insight) => (
            <Card key={insight.alternativeId} className="p-5 border-slate-200 dark:border-white/10 space-y-4">
              <div className="border-b border-slate-100 dark:border-white/5 pb-2">
                <h5 className="text-base font-bold text-slate-900 dark:text-white">
                  {getAltName(insight.alternativeId)}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {insight.scoreContext}
                </p>
              </div>

              {/* Advantages */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Key Advantages
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {insight.advantages.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>

              {/* Drawbacks */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Notable Drawbacks
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                  {insight.drawbacks.map((drw, i) => (
                    <li key={i}>{drw}</li>
                  ))}
                </ul>
              </div>

              {/* Goal Alignment */}
              {insight.goalAlignment.length > 0 && (
                <div className="space-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Goal Alignment:
                  </span>
                  <div className="pl-3 italic">
                    {insight.goalAlignment.join(' • ')}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Trade-offs and Grounded Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trade-offs */}
        <Card className="p-5 border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-brand-500" /> Core Trade-offs
          </h4>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {analysis.tradeOffs.map((to, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-500 font-bold">•</span>
                <span>{to}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Risks */}
        <Card className="p-5 border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Grounded Risk Factors
          </h4>
          <div className="space-y-3">
            {analysis.risks.map((risk, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    {risk.description}
                  </span>
                  {getLikelihoodBadge(risk.likelihood)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Applies to:</span>{' '}
                  {risk.appliesTo.map(getAltName).join(', ')} • <span className="font-medium">Basis:</span> {risk.basis}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Uncertainties, Missing Information, and Assumptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Uncertainties */}
        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Uncertainties
          </h5>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-3 list-disc">
            {analysis.uncertainties.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </Card>

        {/* Missing Info */}
        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <FileQuestion className="w-3.5 h-3.5" /> Missing Information
          </h5>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-3 list-disc">
            {analysis.missingInformation.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </Card>

        {/* Assumptions */}
        <Card className="p-4 border-slate-200 dark:border-white/10 space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> Key Assumptions
          </h5>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-3 list-disc">
            {analysis.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 5. Follow-up Questions */}
      {analysis.followUpQuestions.length > 0 && (
        <Card className="p-5 border-slate-200 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-500" /> Critical Follow-Up Inquiries
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {analysis.followUpQuestions.map((q, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="font-bold text-brand-500 mr-1.5">Q{i + 1}.</span>
                {q}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mandatory Advisory Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
        <span>⚠️ {analysis.overallNote}</span>
        <span className="text-[11px] opacity-80 hidden md:inline">Decisionly AI Decision Support</span>
      </div>
    </div>
  );
};
