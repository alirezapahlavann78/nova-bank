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
