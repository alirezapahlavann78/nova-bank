import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID } from 'class-validator';

export const createScheduledPaymentSchema = z.object({
  type: z.enum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  sourceAccountId: z.string().uuid(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']),
  destinationValue: z.string().max(100),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  maxRuns: z.coerce.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  templateId: z.string().uuid().optional(),
});

export class CreateScheduledPaymentDto {
  @IsEnum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']) type!: string;
  @IsInt() amount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsUUID() sourceAccountId!: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) destinationType!: string;
  @IsString() destinationValue!: string;
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) frequency!: string;
  @IsString() startDate!: string;
  @IsString() @IsOptional() endDate?: string;
  @IsInt() @IsOptional() maxRuns?: number;
  @IsString() @IsOptional() description?: string;
  @IsUUID() @IsOptional() templateId?: string;
}
