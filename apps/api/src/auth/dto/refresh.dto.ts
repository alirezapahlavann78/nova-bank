import { z } from 'zod';
import { IsString } from 'class-validator';

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}
