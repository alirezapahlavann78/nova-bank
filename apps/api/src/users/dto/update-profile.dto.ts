import { IsString, IsOptional, IsLocale } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @IsLocale()
  locale?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
