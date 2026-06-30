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
  currency: z.string().optional(),
  note: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().optional()
});

export const MAX_PAGE_SIZE = 100;

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(10),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional()
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;