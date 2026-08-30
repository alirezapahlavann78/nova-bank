import { z } from 'zod';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  accountNumber: z.string().optional(),
  bankId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateAccountDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() accountNumber?: string;
  @IsString() @IsOptional() bankId?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}