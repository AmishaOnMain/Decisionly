import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters'),
  display_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
});

export const SignInSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
