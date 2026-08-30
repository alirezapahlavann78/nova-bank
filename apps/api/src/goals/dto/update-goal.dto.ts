import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().int().positive().optional(),
  currency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  targetDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateGoalDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() @IsOptional() targetAmount?: number;
  @IsEnum(['IRT', 'USD', 'EUR']) @IsOptional() currency?: string;
  @IsString() @IsOptional() targetDate?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}