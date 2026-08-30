import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export const updateCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  last4: z.string().length(4).regex(/^\d{4}$/).optional(),
  cardType: z.enum(['DEBIT', 'CREDIT', 'PREPAID']).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateCardDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() last4?: string;
  @IsEnum(['DEBIT', 'CREDIT', 'PREPAID']) @IsOptional() cardType?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}