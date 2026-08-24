import { z } from 'zod';
import { IsString, MinLength, Matches } from 'class-validator';

export const registerSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  email: z.string().email().optional(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  locale: z.string().default('fa-IR'),
  timezone: z.string().default('Asia/Tehran'),
  deviceId: z.string().optional(),
  platform: z.string().optional(),
  deviceName: z.string().optional(),
});

export class RegisterDto {
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Invalid phone number' })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsString()
  email?: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  locale?: string;

  @IsString()
  timezone?: string;

  @IsString()
  deviceId?: string;

  @IsString()
  platform?: string;

  @IsString()
  deviceName?: string;
}
