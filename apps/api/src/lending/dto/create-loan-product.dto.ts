import { z } from 'zod';

export const createLoanProductSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  minAmount: z.coerce.number().int().positive(),
  maxAmount: z.coerce.number().int().positive(),
  interestRate: z.coerce.number().min(0).max(1000),
  durationMonths: z.coerce.number().int().positive().max(600),
  installmentFrequency: z.enum(['MONTHLY', 'WEEKLY', 'BI_WEEKLY', 'QUARTERLY']).default('MONTHLY'),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  requiredScoreBand: z.enum(['POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT']).optional(),
});

export class CreateLoanProductDto {
  name!: string;
  description?: string;
  minAmount!: number;
  maxAmount!: number;
  interestRate!: number;
  durationMonths!: number;
  installmentFrequency?: string;
  currency?: string;
  requiredScoreBand?: string;
}

export class UpdateLoanProductDto {
  name?: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  interestRate?: number;
  durationMonths?: number;
  installmentFrequency?: string;
  currency?: string;
  requiredScoreBand?: string;
  isActive?: boolean;
}
