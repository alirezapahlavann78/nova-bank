import { z } from 'zod';

export const transactionDateRangeSchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export const investmentTransactionFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  transactionType: z.enum(['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'INTEREST', 'OTHER']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const createInvestmentTransactionSchema = z.object({
  accountId: z.string().uuid(),
  assetId: z.string().uuid().optional(),
  transactionType: z.enum(['BUY', 'SELL', 'DIVIDEND', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'INTEREST', 'OTHER']),
  quantity: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  amount: z.coerce.number(),
  fees: z.coerce.number().nonnegative().default(0),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('USD'),
  transactionDate: z.string().datetime(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
