import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Scale,
  Sliders,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Archive,
  Trash2,
  RefreshCw,
  Trophy,
  History,
  FileText,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  Decision,
  Alternative,
  Criterion,
  DeterministicResults,
  DecisionContextSnapshot,
  Analysis,
  DecisionScenario,
} from '@shared/types/index.js';
import { api } from '../lib/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { MatrixTable } from '../components/decisions/MatrixTable.js';
import { ScoreChart } from '../components/decisions/ScoreChart.js';
import { AnalysisView } from '../components/analysis/AnalysisView.js';
import { WhatIfSimulator } from '../components/decisions/WhatIfSimulator.js';
import { OutcomeModal } from '../components/decisions/OutcomeModal.js';
import { Modal } from '../components/ui/Modal.js';
import { ContextPicker } from '../components/personal-space/ContextPicker.js';

export const DecisionWorkspacePage: React.FC = () => {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'matrix' | 'scores' | 'ai' | 'whatif' | 'context'>('matrix');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<DeterministicResults | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<DecisionContextSnapshot | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [scenarios, setScenarios] = useState<DecisionScenario[]>([]);

  // Modals
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [isReanalyzeModalOpen, setIsReanalyzeModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const loadDecisionData = async () => {
    if (!decisionId) return;
    try {
      setLoading(true);
      const res = await api.get<{
        decision: Decision;
        alternatives: Alternative[];
        criteria: Criterion[];
        scores: DeterministicResults;
        latestSnapshot: DecisionContextSnapshot | null;
        analyses: Analysis[];
        scenarios: DecisionScenario[];
      }>(`/api/decisions/${decisionId}`);

      setDecision(res.decision);
      setAlternatives(res.alternatives);
      setCriteria(res.criteria);
      setScores(res.scores);
      setLatestSnapshot(res.latestSnapshot);
      setAnalyses(res.analyses);
      setScenarios(res.scenarios);

      // If already analyzed, default to AI or Scores tab
      if (res.analyses.length > 0) {
        setActiveTab('ai');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load decision details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisionData();
  }, [decisionId]);

  const handleRecordOutcome = async (chosenId: string | null, reflection: string) => {
    if (!decisionId) return;
    const res = await api.post<{ decision: Decision }>(`/api/decisions/${decisionId}/outcome`, {
      chosen_alternative_id: chosenId,
      outcome_reflection: reflection,
    });
    setDecision(res.decision);
  };

  const handleArchiveToggle = async () => {
    if (!decision) return;
    const isCurrentlyArchived = Boolean(decision.archived_at);
    const res = await api.post<{ decision: Decision }>(`/api/decisions/${decision.id}/archive`, {
      archive: !isCurrentlyArchived,
    });
    setDecision(res.decision);
  };

  const handleDeleteDecision = async () => {
    if (!decision) return;
    if (!confirm('Are you sure you want to permanently delete this decision and its analyses?')) {
      return;
    }
    await api.delete(`/api/decisions/${decision.id}`);
    navigate('/app');
  };

  const handleRunAnalysis = async (includedIds: string[], decisionSpecificNotes: string[]) => {
    if (!decisionId) return;
    setIsAnalyzing(true);
    try {
      await api.post(`/api/decisions/${decisionId}/context-confirm`, {
        included_entry_ids: includedIds,
        decision_specific_context: decisionSpecificNotes,
      });

      const res = await api.post<{ analysis: Analysis; deterministicResults: DeterministicResults }>(
        `/api/decisions/${decisionId}/analyze`
      );

      setAnalyses([res.analysis, ...analyses]);
      setScores(res.deterministicResults);
      setIsReanalyzeModalOpen(false);
      setActiveTab('ai');
    } catch (err: any) {
      alert(err?.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Sparkles className="w-8 h-8 mx-auto text-brand-500 animate-spin" />
        <p className="text-xs text-slate-500">Loading decision workspace...</p>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <Card className="p-8 text-center space-y-3 border-dashed">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {error || 'Decision not found'}
        </h3>
        <Button variant="secondary" onClick={() => navigate('/app')}>
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  const latestAnalysis = analyses[0];
  const chosenAlternative = alternatives.find((a) => a.id === decision.chosen_alternative_id);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge category={decision.category}>{decision.category}</Badge>
              {decision.custom_category && (
                <Badge variant="slate">{decision.custom_category}</Badge>
              )}
              <Badge
                variant={
                  decision.status === 'analyzed'
                    ? 'brand'
                    : decision.status === 'ready'
                    ? 'success'
                    : 'slate'
                }
              >
                {decision.status}
              </Badge>
              {decision.deadline && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due {decision.deadline}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {decision.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {decision.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOutcomeModalOpen(true)}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            >
              {decision.chosen_alternative_id ? 'Update Outcome' : 'Record Choice'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsReanalyzeModalOpen(true)}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Run AI Analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchiveToggle}
              title={decision.archived_at ? 'Restore Decision' : 'Archive Decision'}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteDecision}
              title="Delete Decision"
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Outcome Highlight if recorded */}
        {decision.chosen_alternative_id && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Chosen Choice: {chosenAlternative?.name || 'Selected'}
              </span>
              {decision.outcome_reflection && (
                <p className="text-slate-600 dark:text-slate-300 italic pt-1">
                  "{decision.outcome_reflection}"
                </p>
              )}
            </div>
            {decision.outcome_recorded_at && (
              <span className="text-[11px] text-slate-400 shrink-0">
                Logged {new Date(decision.outcome_recorded_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-white/5 pt-4 overflow-x-auto">
          {[
            { id: 'matrix', label: 'Evaluation Matrix', icon: Scale },
            { id: 'scores', label: 'Deterministic Scoring', icon: Trophy },
            { id: 'ai', label: 'AI Intelligence Analysis', icon: Sparkles },
            { id: 'whatif', label: 'What-If Simulation', icon: Sliders },
            { id: 'context', label: 'Approved Context Audit', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* TAB 1: Evaluation Matrix */}
      {activeTab === 'matrix' && scores && (
        <div className="space-y-6">
          <MatrixTable alternatives={alternatives} criteria={criteria} scores={scores} />

          {/* Situation & Constraints Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-slate-200 dark:border-white/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Desired Outcome
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {decision.desired_outcome || 'No explicit desired outcome specified.'}
              </p>
            </Card>

            <Card className="p-4 border-slate-200 dark:border-white/10 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Standing Constraints
              </h4>
              {decision.constraints.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No constraints logged.</p>
              ) : (
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                  {decision.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Deterministic Scores */}
      {activeTab === 'scores' && scores && (
        <div className="space-y-6">
          <ScoreChart scores={scores} />
        </div>
      )}

      {/* TAB 3: AI Intelligence Analysis */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {latestAnalysis ? (
            <AnalysisView
              analysis={latestAnalysis.ai_analysis}
              alternatives={alternatives}
              modelName={latestAnalysis.model_name}
              createdAt={latestAnalysis.created_at}
              chosenAlternativeId={decision.chosen_alternative_id}
              onAdoptRecommendation={(altId) =>
                handleRecordOutcome(altId, 'Adopted AI recommended final verdict.')
              }
            />
          ) : (
            <Card className="p-8 text-center space-y-3 border-dashed">
              <Sparkles className="w-8 h-8 mx-auto text-brand-500" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No AI Analysis Performed Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Review your context consent and generate a grounded decision intelligence breakdown.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsReanalyzeModalOpen(true)}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Run First Analysis
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: What-If Simulation Studio */}
      {activeTab === 'whatif' && scores && (
        <WhatIfSimulator
          decisionId={decision.id}
          baselineAlternatives={alternatives}
          baselineCriteria={criteria}
          baselineScores={scores}
          savedScenarios={scenarios}
          onScenarioSaved={(newScen) => setScenarios([newScen, ...scenarios])}
        />
      )}

      {/* TAB 5: Approved Context Audit Snapshot */}
      {activeTab === 'context' && (
        <Card className="p-6 border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Context Audit Trail & Consent Snapshot
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A permanent, immutable record of exactly which private memories were approved and included in this decision's analyses.
              </p>
            </div>
            {latestSnapshot && (
              <span className="text-xs text-slate-400">
                Confirmed: {new Date(latestSnapshot.confirmed_at).toLocaleString()}
              </span>
            )}
          </div>

          {!latestSnapshot || latestSnapshot.context_entries.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">
              No Personal Space context was approved for this decision. It was evaluated using generic criteria only.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {latestSnapshot.context_entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {entry.title}
                      </span>
                      <Badge variant="brand" size="sm">{entry.entry_type}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{entry.content}</p>
                  </div>
                ))}
              </div>

              {latestSnapshot.decision_specific_context?.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Decision-Specific Notes Attached:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc pl-4 space-y-0.5">
                    {latestSnapshot.decision_specific_context.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Outcome Modal */}
      <OutcomeModal
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        alternatives={alternatives}
        currentChoiceId={decision.chosen_alternative_id}
        currentReflection={decision.outcome_reflection}
        onSave={handleRecordOutcome}
      />

      {/* Re-analyze / Context Consent Modal */}
      <Modal
        isOpen={isReanalyzeModalOpen}
        onClose={() => setIsReanalyzeModalOpen(false)}
        title="Confirm Context & Run Decision Analysis"
        description="Select which personal circumstances should inform this analysis. Calculations remain deterministic; Groq generates structured grounded insights."
        maxWidth="xl"
      >
        <ContextPicker
          decisionId={decision.id}
          onConfirm={handleRunAnalysis}
          isLoading={isAnalyzing}
        />
      </Modal>
    </div>
  );
};
