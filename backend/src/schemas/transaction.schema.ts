import {z} from 'zod';

export const createTransactionSchema = z.object({
    categoryId: z.number(),
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number(),
    currency: z.string().optional(),
    note: z.string().optional(),
    merchant: z.string().optional(),
    date: z.string().optional()
});

export const updateTransactionSchema = z.object({
  categoryId: z.number().optional(),
  amount: z.number().optional(),
  note: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().optional()
});