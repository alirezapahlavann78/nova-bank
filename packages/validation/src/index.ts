import { z } from 'zod';

export const amountSchema = z.number().int().nonnegative();
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export const idParamSchema = z.object({ id: z.string().uuid() });
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\+?[0-9]{10,15}$/);
export const currencySchema = z.enum(['IRT', 'USD', 'EUR']);
export const accountTypeSchema = z.enum(['cash', 'bank', 'wallet', 'credit']);

export const createBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  categoryId: z.string().uuid().optional(),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.coerce.number().int().positive().optional(),
  currency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  targetDate: z.string().datetime(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().int().positive().optional(),
  currency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  targetDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export const goalProgressSchema = z.object({
  amount: z.coerce.number().int().positive(),
});

export const reportDateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const notificationFilterSchema = z.object({
  isRead: z.boolean().optional(),
  type: z.enum(['BUDGET_WARNING', 'BUDGET_EXCEEDED', 'GOAL_MILESTONE', 'GOAL_COMPLETED', 'TRANSACTION_CREATED', 'TRANSFER_COMPLETED', 'SYSTEM']).optional(),
});

export const notificationPreferenceSchema = z.object({
  budgetAlerts: z.boolean().optional(),
  goalAlerts: z.boolean().optional(),
  transactionAlerts: z.boolean().optional(),
  transferAlerts: z.boolean().optional(),
  systemAlerts: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().int().positive(),
  description: z.string().optional(),
  transactionDate: z.string().datetime(),
});

export const updateTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  amount: z.coerce.number().int().positive().optional(),
  description: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
});

export const createTransferSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  description: z.string().optional(),
  transactionDate: z.string().datetime(),
});

export const createRecurringTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  nextRunAt: z.string().datetime(),
});

export const updateRecurringTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  amount: z.coerce.number().int().positive().optional(),
  currency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  nextRunAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export function normalizePhone(phone: string): string {
  const persianDigits = /[\u06F0-\u06F9]/g;
  const arabicDigits = /[\u0660-\u0669]/g;
  let normalized = phone
    .replace(persianDigits, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(arabicDigits, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^0-9+]/g, '');

  if (normalized.startsWith('+98')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('98') && normalized.length === 12) {
    normalized = '0' + normalized.slice(2);
  } else if (normalized.startsWith('0098')) {
    normalized = '0' + normalized.slice(4);
  }

  return normalized;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}