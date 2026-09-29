import React, { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { Alternative, Criterion } from '@shared/types/index.js';
import { Input, Textarea } from '../ui/Input.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';

interface AlternativeEditorProps {
  alternatives: Alternative[];
  criteria: Criterion[];
  onChange: (updated: Alternative[]) => void;
}

export const AlternativeEditor: React.FC<AlternativeEditorProps> = ({
  alternatives,
  criteria,
  onChange,
}) => {
  const addAlternative = () => {
    const nextNumber = alternatives.length + 1;
    const newAlt: Alternative = {
      id: crypto.randomUUID(),
      decision_id: '',
      name: `Option ${nextNumber}`,
      description: '',
      sort_order: alternatives.length,
      values: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onChange([...alternatives, newAlt]);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length <= 2) {
      alert('A decision requires at least 2 alternatives to compare.');
      return;
    }
    const updated = alternatives.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateField = (index: number, field: 'name' | 'description', val: string) => {
    const updated = [...alternatives];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const updateValue = (altIndex: number, criterionId: string, val: any) => {
    const updated = [...alternatives];
    const currentValues = { ...(updated[altIndex].values || {}) };

    if (val === 'unknown' || val === null || val === '') {
      currentValues[criterionId] = 'unknown';
    } else {
      currentValues[criterionId] = val;
    }

    updated[altIndex] = { ...updated[altIndex], values: currentValues };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Alternatives to Compare ({alternatives.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define at least 2 choices and enter estimated or known values for your criteria.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={addAlternative} icon={<Plus className="w-4 h-4" />}>
          Add Alternative
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternatives.map((alt, index) => (
          <Card key={alt.id || index} className="p-5 space-y-4 relative border-slate-200 dark:border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Input
                  label={`Alternative #${index + 1} Name`}
                  placeholder="e.g., Job Offer at Stripe"
                  value={alt.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  required
                />
              </div>
              {alternatives.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeAlternative(index)}
                  className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  title="Remove Alternative"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <Textarea
              label="Brief Description or Context"
              rows={2}
              placeholder="e.g., Remote role, generous equity, slightly higher base..."
              value={alt.description}
              onChange={(e) => updateField(index, 'description', e.target.value)}
            />

            {/* Criteria Values for this Alternative */}
            {criteria.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Criteria Values for this Option
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {criteria.map((c) => {
                    const rawVal = alt.values?.[c.id];
                    const isUnknown = rawVal === 'unknown' || rawVal === null || rawVal === undefined;

                    return (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {c.name}
                          </label>
                          <button
                            type="button"
                            onClick={() => updateValue(index, c.id, isUnknown ? 5 : 'unknown')}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                              isUnknown
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-700'
                            }`}
                            title="Mark this value as unknown so it is not treated as zero"
                          >
                            {isUnknown ? 'Unknown' : 'Known'}
                          </button>
                        </div>

                        {isUnknown ? (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 italic py-1">
                            Value marked unknown (will not be penalized as 0)
                          </div>
                        ) : c.criterion_type === 'numeric' ? (
                          <input
                            type="number"
                            step="any"
                            placeholder="Numeric value"
                            value={rawVal !== undefined ? rawVal : ''}
                            onChange={(e) =>
                              updateValue(
                                index,
                                c.id,
                                e.target.value === '' ? 'unknown' : parseFloat(e.target.value)
                              )
                            }
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#090d16] border border-slate-200 dark:border-white/10 outline-none focus:border-brand-500"
                          />
                        ) : (
                          <select
                            value={rawVal || '3'}
                            onChange={(e) => updateValue(index, c.id, e.target.value)}
                            className="w-full text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-[#090d16] border border-slate-200 dark:border-white/10 outline-none focus:border-brand-500"
                          >
                            <option value="1">1 - Poor / Very Low</option>
                            <option value="2">2 - Fair / Low</option>
                            <option value="3">3 - Moderate / Average</option>
                            <option value="4">4 - Good / High</option>
                            <option value="5">5 - Excellent / Outstanding</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
