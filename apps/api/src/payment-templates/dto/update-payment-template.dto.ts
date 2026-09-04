import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsInt, IsUUID, IsBoolean } from 'class-validator';

export const updatePaymentTemplateSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.enum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']).optional(),
  amount: z.coerce.number().int().positive().optional(),
  sourceAccountId: z.string().uuid().optional(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']).optional(),
  destinationValue: z.string().max(100).optional(),
  beneficiaryId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export class UpdatePaymentTemplateDto {
  @IsString() @IsOptional() name?: string;
  @IsEnum(['BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER']) @IsOptional() type?: string;
  @IsInt() @IsOptional() amount?: number;
  @IsUUID() @IsOptional() sourceAccountId?: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) @IsOptional() destinationType?: string;
  @IsString() @IsOptional() destinationValue?: string;
  @IsUUID() @IsOptional() beneficiaryId?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
