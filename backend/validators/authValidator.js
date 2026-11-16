import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(24, 'Username must be at most 24 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be at most 72 characters'), // bcrypt truncates past 72 bytes
});

// Deliberately laxer than register: existing accounts must still be able to log in.
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(24),
  password: z.string().min(1, 'Password is required').max(72),
});
