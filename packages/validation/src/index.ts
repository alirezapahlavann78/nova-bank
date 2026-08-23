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
