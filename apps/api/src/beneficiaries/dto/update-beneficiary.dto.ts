import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export const updateBeneficiarySchema = z.object({
  name: z.string().max(100).optional(),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']).optional(),
  destinationValue: z.string().max(100).optional(),
  bankCode: z.string().max(20).optional(),
  bankName: z.string().max(100).optional(),
  isFavorite: z.boolean().optional(),
});

export class UpdateBeneficiaryDto {
  @IsString() @IsOptional() name?: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) @IsOptional() destinationType?: string;
  @IsString() @IsOptional() destinationValue?: string;
  @IsString() @IsOptional() bankCode?: string;
  @IsString() @IsOptional() bankName?: string;
  @IsBoolean() @IsOptional() isFavorite?: boolean;
}
