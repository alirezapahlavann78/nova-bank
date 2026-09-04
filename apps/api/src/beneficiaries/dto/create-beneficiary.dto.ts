import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export const createBeneficiarySchema = z.object({
  name: z.string().max(100),
  destinationType: z.enum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']),
  destinationValue: z.string().max(100),
  bankCode: z.string().max(20).optional(),
  bankName: z.string().max(100).optional(),
  isFavorite: z.boolean().default(false),
});

export class CreateBeneficiaryDto {
  @IsString() name!: string;
  @IsEnum(['ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY']) destinationType!: string;
  @IsString() destinationValue!: string;
  @IsString() @IsOptional() bankCode?: string;
  @IsString() @IsOptional() bankName?: string;
  @IsBoolean() @IsOptional() isFavorite?: boolean;
}
