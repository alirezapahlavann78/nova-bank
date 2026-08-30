import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createBudgetSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  categoryId: z.string().uuid().optional(),
});

export class CreateBudgetDto {
  @IsString() name!: string;
  @IsInt() amount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY']) period!: string;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
  @IsString() @IsOptional() categoryId?: string;
}