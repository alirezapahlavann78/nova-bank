import { z } from 'zod';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  icon: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export class CreateCategoryDto {
  @IsString() name!: string;
  @IsString() nameEn!: string;
  @IsString() @IsOptional() icon?: string;
  @IsEnum(['INCOME', 'EXPENSE']) type!: string;
}