import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['BANK', 'CASH', 'WALLET', 'CREDIT']),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  accountNumber: z.string().optional(),
  bankId: z.string().uuid().optional(),
  initialBalance: z.coerce.number().int().nonnegative().optional(),
});

export class CreateAccountDto {
  @IsString() name!: string;
  @IsEnum(['BANK', 'CASH', 'WALLET', 'CREDIT']) type!: string;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsString() @IsOptional() accountNumber?: string;
  @IsString() @IsOptional() bankId?: string;
  @IsInt() @IsOptional() initialBalance?: number;
}