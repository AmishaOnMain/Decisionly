import React, { useState } from 'react';
import { Alternative } from '@shared/types/index.js';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Textarea } from '../ui/Input.js';
import { CheckCircle2 } from 'lucide-react';

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  alternatives: Alternative[];
  currentChoiceId: string | null;
  currentReflection: string | null;
  onSave: (chosenId: string | null, reflection: string) => Promise<void>;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  isOpen,
  onClose,
  alternatives,
  currentChoiceId,
  currentReflection,
  onSave,
}) => {
  const [chosenId, setChosenId] = useState<string | null>(currentChoiceId);
  const [reflection, setReflection] = useState<string>(currentReflection || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(chosenId, reflection);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to record outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Your Chosen Alternative & Reflection"
      description="Record which option you chose in reality, and optionally add retrospective reflections on how the decision played out."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Selected Choice
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {alternatives.map((alt) => (
              <button
                type="button"
                key={alt.id}
                onClick={() => setChosenId(alt.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                  chosenId === alt.id
                    ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-300 font-bold'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{alt.name}</span>
                {chosenId === alt.id && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Retrospective Reflection (Optional)"
          rows={4}
          placeholder="How did this decision turn out? Did unexpected risks emerge? What would you do differently next time?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />

        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
          Note: This outcome record is strictly personal documentation for your future learning and reflection. It will never be inferred as an automated preference for future decisions.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save Outcome Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
