import React, { useState } from 'react';
import { EntryType, DurationType, PersonalContextEntry } from '@shared/types/index.js';
import { Input, Textarea } from '../ui/Input.js';
import { Button } from '../ui/Button.js';

interface ContextFormProps {
  initialData?: PersonalContextEntry | null;
  onSubmit: (data: {
    entry_type: EntryType;
    title: string;
    content: string;
    duration_type: DurationType;
    review_at: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ContextForm: React.FC<ContextFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [entryType, setEntryType] = useState<EntryType>(initialData?.entry_type || 'goal');
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [durationType, setDurationType] = useState<DurationType>(
    initialData?.duration_type || 'long_term'
  );
  const [reviewDate, setReviewDate] = useState<string>(
    initialData?.review_at ? initialData.review_at.slice(0, 10) : ''
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for this entry.');
      return;
    }
    if (!content.trim()) {
      setError('Please describe this context entry.');
      return;
    }

    try {
      await onSubmit({
        entry_type: entryType,
        title: title.trim(),
        content: content.trim(),
        duration_type: durationType,
        review_at: reviewDate ? new Date(reviewDate).toISOString() : null,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save entry');
    }
  };

  const types: { value: EntryType; label: string; desc: string }[] = [
    { value: 'goal', label: 'Goal', desc: 'Objectives you want to achieve' },
    { value: 'constraint', label: 'Constraint', desc: 'Standing boundaries (budget, time, geography)' },
    { value: 'preference', label: 'Preference', desc: 'Values and habits that guide your comfort' },
    { value: 'circumstance', label: 'Circumstance', desc: 'Current life situations or context' },
    { value: 'responsibility', label: 'Responsibility', desc: 'Ongoing obligations to people or institutions' },
    { value: 'profile', label: 'Profile', desc: 'Background facts and core skills' },
    { value: 'note', label: 'Note', desc: 'General reflections and personal reminders' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Entry Type Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Context Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {types.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setEntryType(t.value)}
              className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                entryType === t.value
                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300 font-semibold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <Input
        label="Title"
        placeholder="e.g., Target Savings of $20k by Year End"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Content */}
      <Textarea
        label="Details & Description"
        rows={4}
        placeholder="Describe the context, why it matters to you, and any relevant criteria..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      {/* Duration & Review Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Duration
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDurationType('long_term')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                durationType === 'long_term'
                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              Long-term
            </button>
            <button
              type="button"
              onClick={() => setDurationType('temporary')}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                durationType === 'temporary'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              Temporary
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Review Date (Optional)
          </label>
          <input
            type="date"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#090d16] border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isLoading}>
          {initialData ? 'Update Context Entry' : 'Save to Personal Space'}
        </Button>
      </div>
    </form>
  );
};
