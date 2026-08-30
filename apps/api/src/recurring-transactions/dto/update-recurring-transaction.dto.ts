import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';

export const updateRecurringTransactionSchema = z.object({
  amount: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  endDate: z.string().datetime().optional(),
  nextRunAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateRecurringTransactionDto {
  @IsInt() @IsOptional() amount?: number;
  @IsString() @IsOptional() description?: string;
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) @IsOptional() frequency?: string;
  @IsString() @IsOptional() endDate?: string;
  @IsString() @IsOptional() nextRunAt?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}