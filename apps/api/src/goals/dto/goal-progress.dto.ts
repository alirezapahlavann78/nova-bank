import { z } from 'zod';
import { IsInt, Min } from 'class-validator';

export const goalProgressSchema = z.object({
  amount: z.coerce.number().int().positive(),
});

export class GoalProgressDto {
  @IsInt() @Min(1) amount!: number;
}