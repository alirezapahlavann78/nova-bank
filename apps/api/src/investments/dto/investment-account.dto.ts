import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export const createInvestmentAccountSchema = z.object({
  accountNumber: z.string().optional(),
  brokerName: z.string().min(1).max(100).optional(),
  accountType: z.enum(['BROKERAGE', 'RETIREMENT', 'SAVINGS_INVESTMENT', 'OTHER']).default('BROKERAGE'),
  baseCurrency: z.enum(['IRT', 'USD', 'EUR']).default('USD'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).default('ACTIVE'),
});

export class CreateInvestmentAccountDto {
  @IsString() @IsOptional() accountNumber?: string;
  @IsString() @IsOptional() brokerName?: string;
  @IsEnum(['BROKERAGE', 'RETIREMENT', 'SAVINGS_INVESTMENT', 'OTHER']) @IsOptional() accountType?: string;
  @IsEnum(['IRT', 'USD', 'EUR']) @IsOptional() baseCurrency?: string;
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CLOSED']) @IsOptional() status?: string;
}

export const updateInvestmentAccountSchema = z.object({
  accountNumber: z.string().optional(),
  brokerName: z.string().min(1).max(100).optional(),
  accountType: z.enum(['BROKERAGE', 'RETIREMENT', 'SAVINGS_INVESTMENT', 'OTHER']).optional(),
  baseCurrency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'CLOSED']).optional(),
});

export class UpdateInvestmentAccountDto {
  @IsString() @IsOptional() accountNumber?: string;
  @IsString() @IsOptional() brokerName?: string;
  @IsEnum(['BROKERAGE', 'RETIREMENT', 'SAVINGS_INVESTMENT', 'OTHER']) @IsOptional() accountType?: string;
  @IsEnum(['IRT', 'USD', 'EUR']) @IsOptional() baseCurrency?: string;
  @IsEnum(['ACTIVE', 'SUSPENDED', 'CLOSED']) @IsOptional() status?: string;
}
