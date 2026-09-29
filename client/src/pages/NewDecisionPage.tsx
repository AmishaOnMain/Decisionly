import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Sliders,
  Scale,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { TARGET_CATEGORIES, TargetCategory, CATEGORY_DETAILS } from '@shared/constants/categories.js';
import { Alternative, Criterion } from '@shared/types/index.js';
import { api } from '../lib/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input, Textarea } from '../components/ui/Input.js';
import { AlternativeEditor } from '../components/decisions/AlternativeEditor.js';
import { CriteriaEditor } from '../components/decisions/CriteriaEditor.js';
import { ContextPicker } from '../components/personal-space/ContextPicker.js';

export const NewDecisionPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Step: 1 = Details, 2 = Alternatives, 3 = Criteria, 4 = Values Matrix, 5 = Context & Run
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decision basic details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TargetCategory>('Career');
  const [customCategory, setCustomCategory] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [deadline, setDeadline] = useState('');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [newConstraint, setNewConstraint] = useState('');
  const [newAssumption, setNewAssumption] = useState('');

  // Alternatives & Criteria
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Option A',
      description: '',
      sort_order: 0,
      values: {},
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Option B',
      description: '',
      sort_order: 1,
      values: {},
      created_at: '',
      updated_at: '',
    },
  ]);

  const [criteria, setCriteria] = useState<Criterion[]>([
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Financial Return / Value',
      description: '',
      criterion_type: 'numeric',
      direction: 'higher_better',
      weight: 40,
      sort_order: 0,
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Time & Effort Required',
      description: '',
      criterion_type: 'numeric',
      direction: 'lower_better', // lower is better
      weight: 30,
      sort_order: 1,
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Alignment with Values',
      description: '',
      criterion_type: 'qualitative',
      direction: 'higher_better',
      weight: 30,
      sort_order: 2,
      created_at: '',
      updated_at: '',
    },
  ]);

  // Saved decision ID once draft is persisted
  const [savedDecisionId, setSavedDecisionId] = useState<string | null>(null);

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setConstraints([...constraints, newConstraint.trim()]);
      setNewConstraint('');
    }
  };

  const removeConstraint = (idx: number) => {
    setConstraints(constraints.filter((_, i) => i !== idx));
  };

  const addAssumption = () => {
    if (newAssumption.trim()) {
      setAssumptions([...assumptions, newAssumption.trim()]);
      setNewAssumption('');
    }
  };

  const removeAssumption = (idx: number) => {
    setAssumptions(assumptions.filter((_, i) => i !== idx));
  };

  // Save Draft to Backend
  const saveDraft = async (): Promise<string> => {
    setError(null);
    if (!title.trim() || title.length < 3) {
      throw new Error('Decision title must be at least 3 characters.');
    }
    if (!description.trim() || description.length < 5) {
      throw new Error('Please describe the situation in at least 5 characters.');
    }

    setIsSaving(true);
    try {
      let decId = savedDecisionId;
      if (!decId) {
        // Create draft
        const res = await api.post<{ decision: { id: string } }>('/api/decisions', {
          title: title.trim(),
          description: description.trim(),
          category,
          custom_category: category === 'Custom' ? customCategory.trim() : null,
          desired_outcome: desiredOutcome.trim() || null,
          deadline: deadline || null,
          constraints,
          assumptions,
        });
        decId = res.decision.id;
        setSavedDecisionId(decId);
      } else {
        // Update draft
        await api.patch(`/api/decisions/${decId}`, {
          title: title.trim(),
          description: description.trim(),
          category,
          custom_category: category === 'Custom' ? customCategory.trim() : null,
          desired_outcome: desiredOutcome.trim() || null,
          deadline: deadline || null,
          constraints,
          assumptions,
        });
      }

      // Sync alternatives and criteria
      await Promise.all([
        api.put(`/api/decisions/${decId}/alternatives`, {
          alternatives: alternatives.map((a, i) => ({
            id: a.id,
            name: a.name.trim(),
            description: a.description || '',
            sort_order: i,
            values: a.values || {},
          })),
        }),
        api.put(`/api/decisions/${decId}/criteria`, {
          criteria: criteria.map((c, i) => ({
            id: c.id,
            name: c.name.trim(),
            description: c.description || '',
            criterion_type: c.criterion_type,
            direction: c.direction,
            weight: c.weight,
            sort_order: i,
          })),
        }),
      ]);

      return decId;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setError(null);
    try {
      if (currentStep === 1) {
        if (!title.trim() || title.length < 3) {
          setError('Please provide a decision title (at least 3 characters).');
          return;
        }
        if (!description.trim() || description.length < 5) {
          setError('Please provide a situation description (at least 5 characters).');
          return;
        }
      } else if (currentStep === 2) {
        if (alternatives.length < 2) {
          setError('At least 2 alternatives are required for comparison.');
          return;
        }
        const names = alternatives.map((a) => a.name.toLowerCase().trim());
        if (new Set(names).size !== names.length) {
          setError('Alternative names must be unique.');
          return;
        }
      } else if (currentStep === 3) {
        if (criteria.length < 1) {
          setError('At least 1 evaluation criterion is required.');
          return;
        }
      }

      // Automatically persist draft when advancing to step 5 (Context selection)
      if (currentStep === 4) {
        const id = await saveDraft();
        setCurrentStep(5);
        return;
      }

      setCurrentStep((prev) => prev + 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to advance step');
    }
  };

  const handleContextConfirmedAndAnalyze = async (
    includedIds: string[],
    decisionSpecificNotes: string[]
  ) => {
    setIsSaving(true);
    setError(null);
    try {
      let decId = savedDecisionId;
      if (!decId) {
        decId = await saveDraft();
      }

      // 1. Confirm context snapshot
      await api.post(`/api/decisions/${decId}/context-confirm`, {
        included_entry_ids: includedIds,
        decision_specific_context: decisionSpecificNotes,
      });

      // 2. Trigger full deterministic & AI analysis
      await api.post(`/api/decisions/${decId}/analyze`);

      // 3. Navigate to workspace to view results!
      navigate(`/app/decisions/${decId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      const decId = await saveDraft();
      navigate(`/app/decisions/${decId}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to save draft');
    }
  };

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Alternatives' },
    { num: 3, label: 'Criteria' },
    { num: 4, label: 'Values' },
    { num: 5, label: 'Context & Analyze' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Wizard Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create New Decision
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step {currentStep} of 5: {steps[currentStep - 1].label}
          </p>
        </div>

        {/* Action: Save Draft */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveAndExit}
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Draft & Exit
          </Button>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            disabled={s.num > currentStep && !savedDecisionId}
            onClick={() => s.num < currentStep && setCurrentStep(s.num)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              s.num === currentStep
                ? 'bg-brand-600 text-white font-bold shadow-sm'
                : s.num < currentStep
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-60'
            }`}
          >
            {s.num < currentStep ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <span>{s.num}</span>
            )}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* STEP 1: Decision Details */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6 border-slate-200 dark:border-white/10">
          <div className="space-y-4">
            <Input
              label="Decision Title"
              placeholder="e.g., Relocating to Austin vs. Remaining in New York"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* 9 Predefined Categories Grid */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Decision Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TARGET_CATEGORIES.map((catKey) => {
                  const details = CATEGORY_DETAILS[catKey];
                  return (
                    <button
                      type="button"
                      key={catKey}
                      onClick={() => setCategory(catKey)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        category === catKey
                          ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{details.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {details.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {category === 'Custom' && (
                <div className="pt-2">
                  <Input
                    label="Custom Category Name"
                    placeholder="e.g., Intellectual Property or Vehicle Lease"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
            </div>

            <Textarea
              label="Current Situation & Context"
              rows={4}
              placeholder="Describe the context of this decision, what triggered it, and the stakes involved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Desired Outcome (Optional)"
                placeholder="e.g., Lower cost of living while maintaining career velocity"
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Decision Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#090d16] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Decision Constraints */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Decision Constraints (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Maximum monthly rent of $2,400"
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
                />
                <Button variant="secondary" type="button" onClick={addConstraint} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>
              {constraints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {constraints.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      {c}
                      <button type="button" onClick={() => removeConstraint(i)} className="text-slate-400 hover:text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Assumptions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Assumptions & Unknowns (Optional)
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Assuming tax laws remain constant over the next 2 years"
                  value={newAssumption}
                  onChange={(e) => setNewAssumption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAssumption())}
                />
                <Button variant="secondary" type="button" onClick={addAssumption} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>
              {assumptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {assumptions.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                    >
                      {a}
                      <button type="button" onClick={() => removeAssumption(i)} className="text-slate-400 hover:text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Alternatives */}
      {currentStep === 2 && (
        <Card className="p-6 border-slate-200 dark:border-white/10">
          <AlternativeEditor
            alternatives={alternatives}
            criteria={[]}
            onChange={(updated) => setAlternatives(updated)}
          />
        </Card>
      )}

      {/* STEP 3: Criteria & Weights */}
      {currentStep === 3 && (
        <Card className="p-6 border-slate-200 dark:border-white/10">
          <CriteriaEditor
            criteria={criteria}
            onChange={(updated) => setCriteria(updated)}
          />
        </Card>
      )}

      {/* STEP 4: Values Matrix */}
      {currentStep === 4 && (
        <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enter Criterion Values for Each Alternative
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide numeric or qualitative values for each option. You can mark any value as "Unknown" if you are uncertain—it will be evaluated transparently without being penalized as zero.
            </p>
          </div>
          <AlternativeEditor
            alternatives={alternatives}
            criteria={criteria}
            onChange={(updated) => setAlternatives(updated)}
          />
        </Card>
      )}

      {/* STEP 5: Context Selection & Consent */}
      {currentStep === 5 && savedDecisionId && (
        <Card className="p-6 border-slate-200 dark:border-white/10">
          <ContextPicker
            decisionId={savedDecisionId}
            onConfirm={handleContextConfirmedAndAnalyze}
            isLoading={isSaving}
          />
        </Card>
      )}

      {/* Wizard Footer Navigation Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
        <Button
          variant="outline"
          disabled={currentStep === 1 || isSaving}
          onClick={() => setCurrentStep((prev) => prev - 1)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Previous
        </Button>

        {currentStep < 5 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            isLoading={isSaving}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 4 ? 'Confirm & Proceed to Context' : 'Next Step'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
