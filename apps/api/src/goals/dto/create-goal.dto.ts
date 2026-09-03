import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  targetDate: z.string().datetime(),
  goalType: z.enum(['SAVINGS', 'INVESTMENT']).default('SAVINGS'),
});

export class CreateGoalDto {
  @IsString() name!: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() targetAmount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsString() targetDate!: string;
  @IsEnum(['SAVINGS', 'INVESTMENT']) @IsOptional() goalType?: string;
}