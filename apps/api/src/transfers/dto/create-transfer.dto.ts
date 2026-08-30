import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createTransferSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  description: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
});

export class CreateTransferDto {
  @IsString() sourceAccountId!: string;
  @IsString() destinationAccountId!: string;
  @IsInt() amount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() transactionDate!: string;
}