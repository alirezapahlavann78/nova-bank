import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createRecurringTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  description: z.string().max(500).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export class CreateRecurringTransactionDto {
  @IsString() accountId!: string;
  @IsString() categoryId!: string;
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER']) type!: string;
  @IsInt() amount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) frequency!: string;
  @IsString() startDate!: string;
  @IsString() @IsOptional() endDate?: string;
}