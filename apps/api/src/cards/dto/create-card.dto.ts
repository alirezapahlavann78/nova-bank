import { z } from 'zod';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export const createCardSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  last4: z.string().length(4).regex(/^\d{4}$/),
  cardType: z.enum(['DEBIT', 'CREDIT', 'PREPAID']),
});

export class CreateCardDto {
  @IsString() accountId!: string;
  @IsString() name!: string;
  @IsString() last4!: string;
  @IsEnum(['DEBIT', 'CREDIT', 'PREPAID']) cardType!: string;
}