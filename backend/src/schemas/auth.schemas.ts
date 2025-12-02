import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPass: z.string().min(8)
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});