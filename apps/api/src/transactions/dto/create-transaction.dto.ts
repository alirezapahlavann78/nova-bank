import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.coerce.number().int().positive(),
  description: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
});

export class CreateTransactionDto {
  @IsString() accountId!: string;
  @IsString() categoryId!: string;
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER']) type!: string;
  @IsInt() amount!: number;
  @IsString() @IsOptional() description?: string;
  @IsString() transactionDate!: string;
}