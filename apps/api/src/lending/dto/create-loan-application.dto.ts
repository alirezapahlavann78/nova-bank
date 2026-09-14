import { z } from 'zod';

export const createLoanApplicationSchema = z.object({
  loanProductId: z.string().uuid(),
  requestedAmount: z.coerce.number().int().positive(),
  durationMonths: z.coerce.number().int().positive().max(600),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  purpose: z.string().max(500).optional(),
});

export const updateLoanApplicationSchema = z.object({
  purpose: z.string().max(500).optional(),
  durationMonths: z.coerce.number().int().positive().max(600).optional(),
});

export class CreateLoanApplicationDto {
  loanProductId!: string;
  requestedAmount!: number;
  durationMonths!: number;
  currency?: string;
  purpose?: string;
}

export class UpdateLoanApplicationDto {
  purpose?: string;
  durationMonths?: number;
}

export class SubmitApplicationDto {
  submissionNotes?: string;
}
