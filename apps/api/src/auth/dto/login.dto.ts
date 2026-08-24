import { z } from 'zod';
import { IsString, MinLength, Matches } from 'class-validator';

export const loginSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  password: z.string().min(8),
  deviceId: z.string().optional(),
});

export class LoginDto {
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsString()
  deviceId?: string;
}
