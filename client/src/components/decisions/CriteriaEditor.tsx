import React from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Sliders, HelpCircle } from 'lucide-react';
import { Criterion, CriterionType, CriterionDirection } from '@shared/types/index.js';
import { Input } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';

interface CriteriaEditorProps {
  criteria: Criterion[];
  onChange: (updated: Criterion[]) => void;
}

export const CriteriaEditor: React.FC<CriteriaEditorProps> = ({ criteria, onChange }) => {
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0);

  const addCriterion = () => {
    const nextNumber = criteria.length + 1;
    const newCrit: Criterion = {
      id: crypto.randomUUID(),
      decision_id: '',
      name: `Criterion ${nextNumber}`,
      description: '',
      criterion_type: 'numeric',
      direction: 'higher_better',
      weight: 10,
      sort_order: criteria.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onChange([...criteria, newCrit]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length <= 1) {
      alert('At least 1 criterion is required for evaluation.');
      return;
    }
    const updated = criteria.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateField = (index: number, updates: Partial<Criterion>) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Evaluation Criteria & Importance Weights ({criteria.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure criteria directions (higher vs lower is better) and set relative weights.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={addCriterion} icon={<Plus className="w-4 h-4" />}>
          Add Criterion
        </Button>
      </div>

      <div className="space-y-3">
        {criteria.map((c, index) => {
          const normalizedPct =
            totalWeight > 0 ? Math.round(((c.weight > 0 ? c.weight : 0) / totalWeight) * 100) : 0;

          return (
            <Card
              key={c.id || index}
              className="p-4 border-slate-200 dark:border-white/10 space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    placeholder="e.g., Annual Salary or Commute Time"
                    value={c.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    required
                  />
                </div>

                {/* Criterion Type */}
                <div className="flex items-center gap-2">
                  <select
                    value={c.criterion_type}
                    onChange={(e) =>
                      updateField(index, { criterion_type: e.target.value as CriterionType })
                    }
                    className="text-xs px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="numeric">Numeric Value</option>
                    <option value="qualitative">Qualitative Rating (1-5)</option>
                  </select>

                  {/* Direction */}
                  <select
                    value={c.direction}
                    onChange={(e) =>
                      updateField(index, { direction: e.target.value as CriterionDirection })
                    }
                    className="text-xs px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white outline-none"
                  >
                    <option value="higher_better">Higher is Better ↑</option>
                    <option value="lower_better">Lower is Better ↓ (Cost/Risk)</option>
                    <option value="judgment">Subjective Judgment ⚖️</option>
                  </select>

                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriterion(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      title="Remove Criterion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Weight Slider */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-16">
                  Weight: {c.weight}
                </span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={c.weight}
                  onChange={(e) => updateField(index, { weight: parseFloat(e.target.value) || 1 })}
                  className="flex-1 accent-brand-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 w-16 text-right">
                  {normalizedPct}% impact
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <HelpCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
        <p>
          Weighted scoring normalizes all weights to sum to 100%. For criteria marked "Lower is Better" (such as living costs or commute length), lower raw values receive higher mathematical utility scores.
        </p>
      </div>
    </div>
  );
};
