import {z} from 'zod';

export const createRequest = z.object({prompt: z.string().min(1, 'Prompt is required')});

export type CreateAIRequest = z.infer<typeof createRequest>;
