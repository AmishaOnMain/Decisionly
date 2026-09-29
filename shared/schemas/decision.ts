import { z } from 'zod';
import { TARGET_CATEGORIES } from '../constants/categories.js';

export const DecisionCategorySchema = z.enum(TARGET_CATEGORIES);

export const CreateDecisionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  category: DecisionCategorySchema,
  custom_category: z.string().trim().max(80).nullable().optional(),
  desired_outcome: z.string().trim().max(2000).nullable().optional(),
  deadline: z.string().nullable().optional(), // YYYY-MM-DD or null
  constraints: z.array(z.string().trim().max(500)).default([]),
  assumptions: z.array(z.string().trim().max(500)).default([]),
});

export const UpdateDecisionSchema = CreateDecisionSchema.partial().extend({
  status: z.enum(['draft', 'ready', 'analyzed', 'archived']).optional(),
});

export const AlternativeItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(1000).default(''),
  sort_order: z.number().int().default(0),
  values: z.record(z.union([z.number(), z.string(), z.null()])).default({}),
});

export const AlternativesPayloadSchema = z
  .object({
    alternatives: z
      .array(AlternativeItemSchema)
      .min(2, 'At least 2 alternatives are required for comparison'),
  })
  .refine(
    (data) => {
      const names = data.alternatives.map((a) => a.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    },
    {
      message: 'Alternative names must be unique within a decision',
      path: ['alternatives'],
    }
  );

export const CriterionItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Criterion name is required').max(100),
  description: z.string().trim().max(1000).default(''),
  criterion_type: z.enum(['numeric', 'qualitative']),
  direction: z.enum(['higher_better', 'lower_better', 'judgment']),
  weight: z.number().positive('Weight must be greater than 0').max(100),
  sort_order: z.number().int().default(0),
});

export const CriteriaPayloadSchema = z
  .object({
    criteria: z
      .array(CriterionItemSchema)
      .min(1, 'At least 1 evaluation criterion is required'),
  })
  .refine(
    (data) => {
      const names = data.criteria.map((c) => c.name.toLowerCase().trim());
      return new Set(names).size === names.length;
    },
    {
      message: 'Criterion names must be unique within a decision',
      path: ['criteria'],
    }
  );

export const RecordOutcomeSchema = z.object({
  chosen_alternative_id: z.string().uuid().nullable(),
  outcome_reflection: z.string().trim().max(5000).nullable().optional(),
});

export type CreateDecisionInput = z.infer<typeof CreateDecisionSchema>;
export type UpdateDecisionInput = z.infer<typeof UpdateDecisionSchema>;
export type AlternativeItem = z.infer<typeof AlternativeItemSchema>;
export type CriterionItem = z.infer<typeof CriterionItemSchema>;
export type RecordOutcomeInput = z.infer<typeof RecordOutcomeSchema>;
