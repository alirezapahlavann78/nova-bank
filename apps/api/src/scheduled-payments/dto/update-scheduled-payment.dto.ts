import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID } from 'class-validator';

export const updateScheduledPaymentSchema = z.object({
  amount: z.coerce.number().int().positive().optional(),
  currency: z.enum(['IRT', 'USD', 'EUR']).optional(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']).optional(),
  destinationValue: z.string().max(100).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  endDate: z.string().datetime().optional(),
  maxRuns: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});

export class UpdateScheduledPaymentDto {
  @IsInt() @IsOptional() amount?: number;
  @IsEnum(['IRT', 'USD', 'EUR']) @IsOptional() currency?: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) @IsOptional() destinationType?: string;
  @IsString() @IsOptional() destinationValue?: string;
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) @IsOptional() frequency?: string;
  @IsString() @IsOptional() endDate?: string;
  @IsInt() @IsOptional() maxRuns?: number;
  @IsString() @IsOptional() description?: string;
}
