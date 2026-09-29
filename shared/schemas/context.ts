import { z } from 'zod';

export const EntryTypeSchema = z.enum([
  'profile',
  'goal',
  'circumstance',
  'preference',
  'constraint',
  'responsibility',
  'note',
]);

export const DurationTypeSchema = z.enum(['long_term', 'temporary']);

export const CreateContextEntrySchema = z.object({
  entry_type: EntryTypeSchema,
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(150),
  content: z.string().trim().min(3, 'Content must be at least 3 characters').max(3000),
  duration_type: DurationTypeSchema.default('long_term'),
  review_at: z.string().datetime().nullable().optional(),
});

export const UpdateContextEntrySchema = CreateContextEntrySchema.partial();

export const ContextConfirmPayloadSchema = z.object({
  included_entry_ids: z.array(z.string().uuid()),
  decision_specific_context: z.array(z.string().trim().max(1000)).default([]),
});

export type CreateContextEntryInput = z.infer<typeof CreateContextEntrySchema>;
export type UpdateContextEntryInput = z.infer<typeof UpdateContextEntrySchema>;
export type ContextConfirmPayload = z.infer<typeof ContextConfirmPayloadSchema>;
