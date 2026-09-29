import { z } from 'zod';

export const AIRiskItemSchema = z.object({
  description: z.string(),
  appliesTo: z.array(z.string()),
  likelihood: z.enum(['low', 'medium', 'high', 'unknown']),
  basis: z.string(),
});

export const AIAlternativeInsightSchema = z.object({
  alternativeId: z.string(),
  advantages: z.array(z.string()),
  drawbacks: z.array(z.string()),
  goalAlignment: z.array(z.string()),
  scoreContext: z.string(),
});

export const AIFinalVerdictSchema = z.object({
  recommendedAlternativeId: z.string(),
  verdictTitle: z.string(),
  confidence: z.enum(['high', 'moderate', 'conditional']),
  bottomLineReasoning: z.string(),
  keyTradeOff: z.string(),
  nextAction: z.string(),
});

export const AIConversationalSectionSchema = z.object({
  whatImHearing: z.string(),
  thinkingTogether: z.string(),
  questionsToPonder: z.array(z.string()),
  priorityPills: z.array(z.string()),
  honestVerdict: z.string(),
});

export const AIAnalysisResponseSchema = z.object({
  summary: z.string(),
  finalVerdict: AIFinalVerdictSchema.optional(),
  conversational: AIConversationalSectionSchema.optional(),
  alternativeInsights: z.array(AIAlternativeInsightSchema),
  tradeOffs: z.array(z.string()),
  risks: z.array(AIRiskItemSchema),
  uncertainties: z.array(z.string()),
  missingInformation: z.array(z.string()),
  assumptions: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  overallNote: z.string(),
});

export const AIScenarioResponseSchema = z.object({
  summary: z.string(),
  changes: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const CreateScenarioPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Scenario name is required').max(100),
  scenario_inputs: z.object({
    criteriaWeights: z.record(z.number().positive()).optional(),
    alternativeValues: z
      .record(z.record(z.union([z.number(), z.string(), z.null()])))
      .optional(),
    excludedAlternativeIds: z.array(z.string().uuid()).optional(),
    excludedCriteriaIds: z.array(z.string().uuid()).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  include_ai_explanation: z.boolean().default(true),
});

export type CreateScenarioPayload = z.infer<typeof CreateScenarioPayloadSchema>;
