import React, { useState } from 'react';
import { Sliders, RefreshCw, Save, Sparkles, ArrowRight, Check } from 'lucide-react';
import {
  Alternative,
  Criterion,
  DeterministicResults,
  DecisionScenario,
} from '@shared/types/index.js';
import { api } from '../../lib/api.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface WhatIfSimulatorProps {
  decisionId: string;
  baselineAlternatives: Alternative[];
  baselineCriteria: Criterion[];
  baselineScores: DeterministicResults;
  savedScenarios: DecisionScenario[];
  onScenarioSaved: (scenario: DecisionScenario) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  decisionId,
  baselineAlternatives,
  baselineCriteria,
  baselineScores,
  savedScenarios,
  onScenarioSaved,
}) => {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    baselineCriteria.forEach((c) => {
      initial[c.id] = c.weight;
    });
    return initial;
  });

  const [scenarioName, setScenarioName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [scenarioExplanation, setScenarioExplanation] = useState<any>(null);

  // Compute local scenario deterministic scores
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w > 0 ? w : 0), 0);

  const calculateScenario = () => {
    if (baselineAlternatives.length < 2 || baselineCriteria.length === 0 || totalWeight <= 0) {
      return baselineScores;
    }

    // Local client-side calculation identical to server engine
    const normWeights: Record<string, number> = {};
    baselineCriteria.forEach((c) => {
      normWeights[c.id] = (weights[c.id] || 0) / totalWeight;
    });

    // Min max ranges
    const ranges: Record<string, { min: number; max: number }> = {};
    baselineCriteria.forEach((c) => {
      let min = Infinity;
      let max = -Infinity;
      baselineAlternatives.forEach((alt) => {
        const val = alt.values?.[c.id];
        const num = typeof val === 'number' ? val : parseFloat(val as any);
        if (!isNaN(num)) {
          if (num < min) min = num;
          if (num > max) max = num;
        }
      });
      ranges[c.id] = { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max };
    });

    const altScores = baselineAlternatives.map((alt) => {
      let weightedSum = 0;
      let knownWeightSum = 0;
      baselineCriteria.forEach((c) => {
        const val = alt.values?.[c.id];
        const num = typeof val === 'number' ? val : parseFloat(val as any);
        if (!isNaN(num)) {
          const r = ranges[c.id];
          const nw = normWeights[c.id];
          let norm = 0.5;
          if (r.max === r.min) {
            norm = 1.0;
          } else if (c.direction === 'lower_better') {
            norm = (r.max - num) / (r.max - r.min);
          } else {
            norm = (num - r.min) / (r.max - r.min);
          }
          norm = Math.max(0, Math.min(1, norm));
          weightedSum += norm * nw;
          knownWeightSum += nw;
        }
      });
      const totalScore =
        knownWeightSum > 0 ? Math.round((weightedSum / knownWeightSum) * 1000) / 10 : 0;
      return {
        alternativeId: alt.id,
        alternativeName: alt.name,
        totalScore,
      };
    });

    altScores.sort((a, b) => b.totalScore - a.totalScore);
    return {
      alternativeScores: altScores,
    };
  };

  const currentScenarioResult = calculateScenario();

  const handleReset = () => {
    const initial: Record<string, number> = {};
    baselineCriteria.forEach((c) => {
      initial[c.id] = c.weight;
    });
    setWeights(initial);
    setScenarioExplanation(null);
  };

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please name your what-if scenario (e.g., "High Salary Priority" or "Low Commute Focus").');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post<{ scenario: DecisionScenario }>(
        `/api/decisions/${decisionId}/scenarios`,
        {
          name: scenarioName.trim(),
          scenario_inputs: {
            criteriaWeights: weights,
          },
          include_ai_explanation: true,
        }
      );
      onScenarioSaved(res.scenario);
      setScenarioExplanation(res.scenario.ai_explanation);
      setScenarioName('');
    } catch (err: any) {
      alert(err?.message || 'Failed to save scenario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* What-If Controls */}
      <Card className="p-5 border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-500" /> What-If Simulation Sandbox
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust criteria weights in real-time to test how sensitive your decision is to shifting priorities.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />}>
            Reset to Baseline
          </Button>
        </div>

        {/* Sliders */}
        <div className="space-y-3 pt-2">
          {baselineCriteria.map((c) => {
            const currentWeight = weights[c.id] || 0;
            const impactPct =
              totalWeight > 0 ? Math.round((currentWeight / totalWeight) * 100) : 0;

            return (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    {c.name}
                  </span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {impactPct}% Impact
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 w-12">Weight: {currentWeight}</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={currentWeight}
                    onChange={(e) =>
                      setWeights({ ...weights, [c.id]: parseFloat(e.target.value) || 1 })
                    }
                    className="flex-1 accent-brand-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Comparison: Baseline vs Scenario */}
      <Card className="p-5 border-slate-200 dark:border-white/10 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
          Baseline vs. Scenario Score Impact
        </h4>

        <div className="space-y-3">
          {baselineAlternatives.map((alt) => {
            const baselineObj = baselineScores.alternativeScores.find((b) => b.alternativeId === alt.id);
            const scenarioObj = currentScenarioResult.alternativeScores.find((s) => s.alternativeId === alt.id);

            const baseScore = baselineObj?.totalScore ?? 0;
            const scenScore = scenarioObj?.totalScore ?? 0;
            const diff = Math.round((scenScore - baseScore) * 10) / 10;

            return (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{alt.name}</h5>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>Baseline: {baseScore}/100</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-white">
                      Scenario: {scenScore}/100
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                      diff > 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : diff < 0
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Scenario Form */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full sm:w-auto">
            <Input
              placeholder="Give this scenario a name (e.g., Higher Financial Stability)"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSaveScenario}
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Scenario & Get AI Insights
          </Button>
        </div>
      </Card>

      {/* Scenario Explanation Card */}
      {scenarioExplanation && (
        <Card className="p-5 border-brand-500/30 bg-brand-50/20 dark:bg-brand-950/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Scenario Sensitivity Explanation
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-200">{scenarioExplanation.summary}</p>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
            {scenarioExplanation.changes?.map((ch: string, i: number) => (
              <li key={i}>{ch}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
