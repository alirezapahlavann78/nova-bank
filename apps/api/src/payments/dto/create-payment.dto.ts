import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID } from 'class-validator';

export const createPaymentSchema = z.object({
  type: z.enum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']),
  amount: z.coerce.number().int().positive(),
  currency: z.enum(['IRT', 'USD', 'EUR']).default('IRT'),
  sourceAccountId: z.string().uuid(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']),
  destinationValue: z.string().max(100),
  destinationName: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  fees: z.coerce.number().int().nonnegative().default(0),
});

export class CreatePaymentDto {
  @IsEnum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']) type!: string;
  @IsInt() amount!: number;
  @IsEnum(['IRT', 'USD', 'EUR']) currency?: string;
  @IsUUID() sourceAccountId!: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) destinationType!: string;
  @IsString() destinationValue!: string;
  @IsString() @IsOptional() destinationName?: string;
  @IsString() @IsOptional() description?: string;
  @IsInt() fees?: number;
}
