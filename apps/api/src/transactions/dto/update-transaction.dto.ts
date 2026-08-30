import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const updateTransactionSchema = z.object({
  amount: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  transactionDate: z.string().datetime().optional(),
});

export class UpdateTransactionDto {
  @IsInt() @IsOptional() amount?: number;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() transactionDate?: string;
}