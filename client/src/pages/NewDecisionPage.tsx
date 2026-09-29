import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Alternative, Criterion } from '@shared/types/index.js';
import { api } from '../lib/api.js';
import { VoiceDictationButton } from '../components/ui/VoiceDictationButton.js';

export const NewDecisionPage: React.FC = () => {
  const navigate = useNavigate();

  // 3-step wizard: 1 = The question, 2 = What matters, 3 = Review
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State (matches Picture 3 & 5)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Career');
  const [deadline, setDeadline] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  // Options / Alternatives
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Option A: Make the change',
      description: 'Step into the new opportunity or role',
      sort_order: 0,
      values: {},
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Option B: Stay the current course',
      description: 'Preserve continuity and current stability',
      sort_order: 1,
      values: {},
      created_at: '',
      updated_at: '',
    },
  ]);

  // Key criteria / principles
  const [criteria, setCriteria] = useState<Criterion[]>([
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Peace of mind & energy',
      description: 'How it affects mental load and everyday rhythm',
      criterion_type: 'qualitative',
      direction: 'higher_better',
      weight: 40,
      sort_order: 0,
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Growth & alignment',
      description: 'How well it supports where you want to be in 2 years',
      criterion_type: 'qualitative',
      direction: 'higher_better',
      weight: 35,
      sort_order: 1,
      created_at: '',
      updated_at: '',
    },
    {
      id: crypto.randomUUID(),
      decision_id: '',
      name: 'Financial sustainability',
      description: 'Income, costs, and stability',
      criterion_type: 'numeric',
      direction: 'higher_better',
      weight: 25,
      sort_order: 2,
      created_at: '',
      updated_at: '',
    },
  ]);

  const [newAltName, setNewAltName] = useState('');
  const [newCritName, setNewCritName] = useState('');

  const handleSaveDecision = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Please name what you are deciding.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Create Decision
      const res = await api.post<{ decision: { id: string } }>('/api/decisions', {
        title: title.trim(),
        description: description.trim() || title.trim(),
        category,
        desired_outcome: desiredOutcome.trim() || null,
        deadline: deadline || null,
      });

      const decId = res.decision.id;

      // 2. Save Alternatives
      await api.post(`/api/decisions/${decId}/alternatives`, {
        alternatives: alternatives.map((a, i) => ({
          name: a.name,
          description: a.description || '',
          sort_order: i,
          values: {},
        })),
      });

      // 3. Save Criteria
      await api.post(`/api/decisions/${decId}/criteria`, {
        criteria: criteria.map((c, i) => ({
          name: c.name,
          description: c.description || '',
          criterion_type: c.criterion_type || 'qualitative',
          direction: c.direction || 'higher_better',
          weight: c.weight || 30,
          sort_order: i,
        })),
      });

      // 4. Navigate to workspace to start thinking
      navigate(`/app/decisions/${decId}`);
    } catch (err: any) {
      setError(err?.message || 'Could not save this decision. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto">
      {/* Page Header (matches Picture 3 & 5) */}
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-[#265347] dark:text-[#5EAD9C]">
          NEW DECISION
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-stone-900 dark:text-stone-100">
          Give the question a shape.
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">
          There is no perfect way to frame it. Start with what feels true today.
        </p>
      </div>

      {/* Stepper (matches Picture 3: 1 The question, 2 What matters, 3 Review) */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
        {/* Step 1 */}
        <div
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 cursor-pointer transition-colors ${
            currentStep === 1
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 1
                ? 'bg-amber-500 text-stone-900 shadow-sm'
                : 'bg-forest-600 text-white dark:bg-forest-500'
            }`}
          >
            1
          </div>
          <span>The question</span>
        </div>

        <div className="w-10 sm:w-16 h-px bg-stone-300 dark:bg-white/10" />

        {/* Step 2 */}
        <div
          onClick={() => title.trim() && setCurrentStep(2)}
          className={`flex items-center gap-2 transition-colors ${
            title.trim() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
          } ${
            currentStep === 2
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 2
                ? 'bg-amber-500 text-stone-900 shadow-sm'
                : 'border border-stone-300 dark:border-white/20 text-stone-400'
            }`}
          >
            2
          </div>
          <span>What matters</span>
        </div>

        <div className="w-10 sm:w-16 h-px bg-stone-300 dark:bg-white/10" />

        {/* Step 3 */}
        <div
          onClick={() => title.trim() && setCurrentStep(3)}
          className={`flex items-center gap-2 transition-colors ${
            title.trim() ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
          } ${
            currentStep === 3
              ? 'text-stone-900 dark:text-stone-100 font-semibold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 3
                ? 'bg-amber-500 text-stone-900 shadow-sm'
                : 'border border-stone-300 dark:border-white/20 text-stone-400'
            }`}
          >
            3
          </div>
          <span>Review</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* STEP 1: The Question (matches Picture 3 & 5) */}
      {currentStep === 1 && (
        <div className="rounded-2xl p-6 sm:p-9 bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm space-y-6">
          {/* Field 1: What are you deciding? */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
              What are you deciding?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Whether to take the new role"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Field 2: What is the situation? */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
              What is the situation?
            </label>
            <p className="text-xs text-stone-400">
              Include the details that make this more than a simple yes or no.
            </p>
            <div className="relative">
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I am weighing..."
                className="w-full px-4 py-3 pb-12 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
              />

              {/* AssemblyAI Voice Dictation inside the situation box */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <VoiceDictationButton
                  onTranscript={(text) => {
                    setDescription((prev) => (prev ? prev + ' ' + text : text));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Two-column Row: Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
              >
                <option value="Career" className="dark:bg-[#152226]">Career</option>
                <option value="Personal" className="dark:bg-[#152226]">Personal</option>
                <option value="Financial" className="dark:bg-[#152226]">Financial</option>
                <option value="Relocation" className="dark:bg-[#152226]">Relocation</option>
                <option value="Health" className="dark:bg-[#152226]">Health</option>
                <option value="Travel" className="dark:bg-[#152226]">Travel</option>
                <option value="Education" className="dark:bg-[#152226]">Education</option>
                <option value="Custom" className="dark:bg-[#152226]">Other</option>
              </select>
            </div>

            {/* Useful Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
                Is there a useful date?
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Field 4: What would a good outcome protect? */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200">
              What would a good outcome protect?
            </label>
            <textarea
              rows={3}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="A good outcome would leave room for..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
          </div>

          {/* Action buttons at bottom (matches Picture 5) */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDecision}
                disabled={!title.trim() || isSaving}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                Save draft
              </button>

              <button
                type="button"
                disabled={!title.trim() || isSaving}
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: What Matters (Options & Criteria) */}
      {currentStep === 2 && (
        <div className="rounded-2xl p-6 sm:p-9 bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm space-y-8">
          {/* Options / Paths being weighed */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
                The paths on the table
              </h2>
              <p className="text-xs text-stone-400">
                What are the concrete options you are choosing between?
              </p>
            </div>

            <div className="space-y-3">
              {alternatives.map((alt, idx) => (
                <div
                  key={alt.id}
                  className="p-4 rounded-xl border border-stone-200/80 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={alt.name}
                      onChange={(e) => {
                        const copy = [...alternatives];
                        copy[idx].name = e.target.value;
                        setAlternatives(copy);
                      }}
                      className="w-full text-sm font-semibold bg-transparent border-0 outline-none text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="text"
                      value={alt.description || ''}
                      placeholder="Add a brief note about this path..."
                      onChange={(e) => {
                        const copy = [...alternatives];
                        copy[idx].description = e.target.value;
                        setAlternatives(copy);
                      }}
                      className="w-full text-xs text-stone-500 dark:text-stone-400 bg-transparent border-0 outline-none"
                    />
                  </div>

                  {alternatives.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setAlternatives(alternatives.filter((_, i) => i !== idx))}
                      className="text-stone-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAltName}
                onChange={(e) => setNewAltName(e.target.value)}
                placeholder="Add another path or option..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAltName.trim()) {
                    setAlternatives([
                      ...alternatives,
                      {
                        id: crypto.randomUUID(),
                        decision_id: '',
                        name: newAltName.trim(),
                        description: '',
                        sort_order: alternatives.length,
                        values: {},
                        created_at: '',
                        updated_at: '',
                      },
                    ]);
                    setNewAltName('');
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-white/5 hover:bg-stone-200 text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Criteria / Guiding principles */}
          <div className="space-y-4 pt-6 border-t border-stone-100 dark:border-white/5">
            <div>
              <h2 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">
                What matters to you most?
              </h2>
              <p className="text-xs text-stone-400">
                The principles and criteria against which you want to evaluate these options.
              </p>
            </div>

            <div className="space-y-3">
              {criteria.map((crit, idx) => (
                <div
                  key={crit.id}
                  className="p-4 rounded-xl border border-stone-200/80 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[idx].name = e.target.value;
                        setCriteria(copy);
                      }}
                      className="w-full text-sm font-semibold bg-transparent border-0 outline-none text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="text"
                      value={crit.description || ''}
                      placeholder="Why this matters..."
                      onChange={(e) => {
                        const copy = [...criteria];
                        copy[idx].description = e.target.value;
                        setCriteria(copy);
                      }}
                      className="w-full text-xs text-stone-500 dark:text-stone-400 bg-transparent border-0 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-stone-400">{crit.weight}%</span>
                    {criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCriteria(criteria.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Criterion */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                placeholder="Add another principle (e.g., commute time, financial impact)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-transparent text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCritName.trim()) {
                    setCriteria([
                      ...criteria,
                      {
                        id: crypto.randomUUID(),
                        decision_id: '',
                        name: newCritName.trim(),
                        description: '',
                        criterion_type: 'qualitative',
                        direction: 'higher_better',
                        weight: 25,
                        sort_order: criteria.length,
                        created_at: '',
                        updated_at: '',
                      },
                    ]);
                    setNewCritName('');
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-white/5 hover:bg-stone-200 text-stone-800 dark:text-stone-200 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer"
            >
              <span>Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Begin Thinking */}
      {currentStep === 3 && (
        <div className="rounded-2xl p-6 sm:p-9 bg-white dark:bg-[#152226] border border-stone-200/80 dark:border-white/5 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold text-stone-900 dark:text-stone-100">
              Ready to think this through?
            </h2>
            <p className="text-xs text-stone-400">
              Here is what you've framed. You can always refine these details as you think together.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-stone-50/60 dark:bg-white/[0.02] border border-stone-200/60 dark:border-white/5 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#265347] dark:text-[#5EAD9C]">
                {category}
              </span>
              <h3 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100 mt-1">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {desiredOutcome && (
              <div className="text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-200/50 dark:border-white/5">
                <span className="font-semibold">Desired outcome: </span>
                {desiredOutcome}
              </div>
            )}

            <div className="pt-2 border-t border-stone-200/50 dark:border-white/5 space-y-2">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Options being weighed:
              </p>
              <div className="flex flex-wrap gap-2">
                {alternatives.map((alt) => (
                  <span
                    key={alt.id}
                    className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-xs font-medium text-amber-900 dark:text-amber-300"
                  >
                    {alt.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/50 dark:border-white/5 space-y-2">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Guiding criteria:
              </p>
              <div className="flex flex-wrap gap-2">
                {criteria.map((c) => (
                  <span
                    key={c.id}
                    className="px-3 py-1 rounded-lg bg-stone-100 dark:bg-white/5 text-xs text-stone-600 dark:text-stone-400"
                  >
                    {c.name} ({c.weight}%)
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDecision}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Opening workspace...' : 'Help me think about it'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
