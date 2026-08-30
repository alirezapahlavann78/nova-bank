import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';

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

export class UpdateBudgetDto {
  @IsString() @IsOptional() name?: string;
  @IsInt() @IsOptional() amount?: number;
  @IsEnum(['IRT', 'USD', 'EUR']) @IsOptional() currency?: string;
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY']) @IsOptional() period?: string;
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() endDate?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}