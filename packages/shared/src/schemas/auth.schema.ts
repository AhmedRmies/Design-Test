import { z } from 'zod';
import { ROLES } from '../constants/roles';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(60),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(ROLES),
  credits: z.number().int().nonnegative(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PublicUser = z.infer<typeof userSchema>;
