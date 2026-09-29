import { z } from 'zod';

const flexibleString = z.union([z.string(), z.record(z.any())]).transform((val) => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    return (
      (val as any).description ||
      (val as any).assumption ||
      (val as any).text ||
      (val as any).point ||
      (val as any).title ||
      (val as any).question ||
      JSON.stringify(val)
    );
  }
  return String(val);
});

export const AIRiskItemSchema = z.object({
  description: flexibleString.default('Potential risk'),
  appliesTo: z.array(flexibleString).default([]),
  likelihood: z.enum(['low', 'medium', 'high', 'unknown']).default('unknown'),
  basis: flexibleString.default('General assessment'),
});

export const AIAlternativeInsightSchema = z.object({
  alternativeId: z.string(),
  advantages: z.array(flexibleString).default([]),
  drawbacks: z.array(flexibleString).default([]),
  goalAlignment: z.array(flexibleString).default([]),
  scoreContext: z.string().default(''),
});

export const AIFinalVerdictSchema = z.object({
  recommendedAlternativeId: z.string(),
  verdictTitle: z.string().default('Recommendation'),
  confidence: z.enum(['high', 'moderate', 'conditional']).default('moderate'),
  bottomLineReasoning: z.string().default(''),
  keyTradeOff: z.string().default(''),
  nextAction: z.string().default(''),
});

export const AIConversationalSectionSchema = z.object({
  whatImHearing: z.string().default(''),
  thinkingTogether: z.string().default(''),
  questionsToPonder: z.array(flexibleString).default([]),
  priorityPills: z.array(flexibleString).default([]),
  honestVerdict: z.string().default(''),
});

export const AIAnalysisResponseSchema = z.object({
  summary: z.string().default(''),
  finalVerdict: AIFinalVerdictSchema.optional(),
  conversational: AIConversationalSectionSchema.optional(),
  alternativeInsights: z.array(AIAlternativeInsightSchema).default([]),
  tradeOffs: z.array(flexibleString).default([]),
  risks: z.array(AIRiskItemSchema).default([]),
  uncertainties: z.array(flexibleString).default([]),
  missingInformation: z.array(flexibleString).default([]),
  assumptions: z.array(flexibleString).default([]),
  followUpQuestions: z.array(flexibleString).default([]),
  overallNote: z.string().default(''),
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
