import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID, IsBoolean } from 'class-validator';

export const createPaymentTemplateSchema = z.object({
  name: z.string().max(100),
  type: z.enum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']),
  amount: z.coerce.number().int().positive().optional(),
  sourceAccountId: z.string().uuid().optional(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']),
  destinationValue: z.string().max(100),
  beneficiaryId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export class CreatePaymentTemplateDto {
  @IsString() name!: string;
  @IsEnum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']) type!: string;
  @IsInt() @IsOptional() amount?: number;
  @IsUUID() @IsOptional() sourceAccountId?: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) destinationType!: string;
  @IsString() destinationValue!: string;
  @IsUUID() @IsOptional() beneficiaryId?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
