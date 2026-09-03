import { z } from 'zod';

export const holdingFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
