import { TargetCategory } from '../constants/categories.js';

export type EntryType =
  | 'profile'
  | 'goal'
  | 'circumstance'
  | 'preference'
  | 'constraint'
  | 'responsibility'
  | 'note';

export type DurationType = 'long_term' | 'temporary';

export interface UserSafe {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalContextEntry {
  id: string;
  user_id: string;
  entry_type: EntryType;
  title: string;
  content: string;
  duration_type: DurationType;
  review_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DecisionStatus = 'draft' | 'ready' | 'analyzed' | 'archived';

export interface Decision {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: TargetCategory;
  custom_category: string | null;
  desired_outcome: string | null;
  deadline: string | null;
  constraints: string[];
  assumptions: string[];
  status: DecisionStatus;
  chosen_alternative_id: string | null;
  chosen_at: string | null;
  outcome_reflection: string | null;
  outcome_recorded_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Alternative {
  id: string;
  decision_id: string;
  name: string;
  description: string;
  sort_order: number;
  // Criteria values mapped by criterion_id -> number or string or null (if unknown)
  values: Record<string, number | string | null>;
  created_at: string;
  updated_at: string;
}

export type CriterionType = 'numeric' | 'qualitative';
export type CriterionDirection = 'higher_better' | 'lower_better' | 'judgment';

export interface Criterion {
  id: string;
  decision_id: string;
  name: string;
  description: string;
  criterion_type: CriterionType;
  direction: CriterionDirection;
  weight: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DecisionContextSnapshot {
  id: string;
  decision_id: string;
  user_id: string;
  context_entries: Array<{
    id: string;
    entry_type: EntryType;
    title: string;
    content: string;
    duration_type: DurationType;
  }>;
  decision_specific_context: string[];
  confirmed_at: string;
  created_at: string;
}

export interface CriterionContribution {
  criterionId: string;
  criterionName: string;
  rawValue: number | string | null;
  normalizedScore: number | null; // 0 to 1, or null if unknown
  weightedContribution: number | null;
  isUnknown: boolean;
}

export interface AlternativeScoreResult {
  alternativeId: string;
  alternativeName: string;
  totalScore: number | null; // 0 to 100, or null if missing essential data
  rank: number | null;
  breakdown: Record<string, CriterionContribution>;
  knownRatio: number; // percentage of criteria with known valid values (0 to 1)
  uncertaintyFlag: boolean;
}

export interface DeterministicResults {
  isComputable: boolean;
  scoringMethodExplanation: string;
  normalizedWeights: Record<string, number>; // criterionId -> normalized weight (sum to 1)
  alternativeScores: AlternativeScoreResult[];
  winnerAlternativeId: string | null;
  hasUncertainty: boolean;
  warnings: string[];
}

export interface AIRiskItem {
  description: string;
  appliesTo: string[];
  likelihood: 'low' | 'medium' | 'high' | 'unknown';
  basis: string;
}

export interface AIAlternativeInsight {
  alternativeId: string;
  advantages: string[];
  drawbacks: string[];
  goalAlignment: string[];
  scoreContext: string;
}

export interface AIAnalysisResponse {
  summary: string;
  alternativeInsights: AIAlternativeInsight[];
  tradeOffs: string[];
  risks: AIRiskItem[];
  uncertainties: string[];
  missingInformation: string[];
  assumptions: string[];
  followUpQuestions: string[];
  overallNote: string;
}

export interface AIScenarioResponse {
  summary: string;
  changes: string[];
  limitations: string[];
}

export interface Analysis {
  id: string;
  decision_id: string;
  user_id: string;
  context_snapshot_id: string | null;
  input_snapshot: {
    decision: Decision;
    alternatives: Alternative[];
    criteria: Criterion[];
    context_snapshot?: DecisionContextSnapshot;
  };
  deterministic_results: DeterministicResults;
  ai_analysis: AIAnalysisResponse;
  model_name: string | null;
  created_at: string;
}

export interface DecisionScenario {
  id: string;
  decision_id: string;
  user_id: string;
  name: string;
  scenario_inputs: {
    criteriaWeights?: Record<string, number>;
    alternativeValues?: Record<string, Record<string, number | string | null>>;
    excludedAlternativeIds?: string[];
    excludedCriteriaIds?: string[];
    notes?: string;
  };
  deterministic_results: DeterministicResults;
  ai_explanation: AIScenarioResponse | null;
  created_at: string;
  updated_at: string;
}
