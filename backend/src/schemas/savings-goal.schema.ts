import { z } from "zod";

export const upsertSavingsGoalSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    targetAmount: z.number().positive("Target amount must be greater than 0"),
    currency: z.string().min(3).max(5).optional()
});

export type UpsertSavingsGoalRequest = z.infer<typeof upsertSavingsGoalSchema>;