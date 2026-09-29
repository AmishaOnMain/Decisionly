import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, CheckSquare, Square, AlertCircle, Info, Sparkles } from 'lucide-react';
import { PersonalContextEntry } from '@shared/types/index.js';
import { api } from '../../lib/api.js';
import { Card } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface CandidateContextEntry {
  entry: PersonalContextEntry;
  relevanceScore: number;
  matchReasons: string[];
  isReviewDue: boolean;
  suggested: boolean;
}

interface ContextPickerProps {
  decisionId: string;
  onConfirm: (includedIds: string[], decisionSpecificContext: string[]) => void;
  isLoading?: boolean;
}

export const ContextPicker: React.FC<ContextPickerProps> = ({
  decisionId,
  onConfirm,
  isLoading = false,
}) => {
  const [candidates, setCandidates] = useState<CandidateContextEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [decisionNotes, setDecisionNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  useEffect(() => {
    async function loadCandidates() {
      try {
        setLoadingCandidates(true);
        const res = await api.post<{ candidates: CandidateContextEntry[] }>(
          `/api/decisions/${decisionId}/context-preview`
        );
        setCandidates(res.candidates || []);

        // Pre-check suggested entries by default, but let user uncheck or check freely
        const preSelected = new Set<string>();
        (res.candidates || []).forEach((c) => {
          if (c.suggested) {
            preSelected.add(c.entry.id);
          }
        });
        setSelectedIds(preSelected);
      } catch (err) {
        console.error('Failed to load candidate context:', err);
      } finally {
        setLoadingCandidates(false);
      }
    }
    loadCandidates();
  }, [decisionId]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(new Set(candidates.map((c) => c.entry.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const addDecisionNote = () => {
    if (newNote.trim()) {
      setDecisionNotes([...decisionNotes, newNote.trim()]);
      setNewNote('');
    }
  };

  const removeDecisionNote = (index: number) => {
    setDecisionNotes(decisionNotes.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onConfirm(Array.from(selectedIds), decisionNotes);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-500/20 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-semibold text-slate-900 dark:text-white">
            Privacy & Explicit Consent Guarantee
          </p>
          <p>
            Only the items you explicitly select below will be attached to this decision analysis. Unselected memories and other private records in your Personal Space are strictly excluded from the AI payload.
          </p>
        </div>
      </div>

      {/* Suggested & Available Context */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Space Context
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select which relevant life circumstances or goals should inform the analysis.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-slate-500 hover:underline font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {loadingCandidates ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Finding matching context from your Personal Space...
          </div>
        ) : candidates.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 space-y-2">
            <Info className="w-6 h-6 mx-auto text-slate-400" />
            <p>No Personal Space entries found yet.</p>
            <p className="text-[11px] text-slate-400">
              You can still proceed with decision-specific criteria or add one-time notes below.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {candidates.map(({ entry, matchReasons, isReviewDue, suggested }) => {
              const isSelected = selectedIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  onClick={() => toggleSelect(entry.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-500/40 shadow-sm'
                      : 'bg-white dark:bg-[#111827]/60 border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-brand-600 dark:text-brand-400">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-brand-500/20" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {entry.title}
                          </span>
                          <Badge variant="brand" size="sm">
                            {entry.entry_type}
                          </Badge>
                          {suggested && (
                            <span className="text-[10px] text-brand-600 dark:text-brand-300 bg-brand-500/10 px-1.5 py-0.5 rounded font-medium">
                              Suggested
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {entry.content}
                        </p>

                        {/* Match Reasons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {matchReasons.map((r, i) => (
                            <span
                              key={i}
                              className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                            >
                              • {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision-Specific One-Time Context */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Decision-Specific One-Time Context
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add any private notes or constraints that apply ONLY to this specific choice (not saved to Personal Space).
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="e.g., Must start by next month or offer expires."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDecisionNote();
              }
            }}
          />
          <Button variant="secondary" type="button" onClick={addDecisionNote} icon={<Plus className="w-4 h-4" />}>
            Add Note
          </Button>
        </div>

        {decisionNotes.length > 0 && (
          <div className="space-y-1.5">
            {decisionNotes.map((note, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
              >
                <span>{note}</span>
                <button
                  type="button"
                  onClick={() => removeDecisionNote(idx)}
                  className="text-slate-400 hover:text-red-500 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Button */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200/80 dark:border-white/10">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {selectedIds.size} personal context item(s) selected
        </div>
        <Button
          variant="primary"
          type="button"
          onClick={handleContinue}
          isLoading={isLoading}
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          Confirm Context & Run Analysis
        </Button>
      </div>
    </div>
  );
};
