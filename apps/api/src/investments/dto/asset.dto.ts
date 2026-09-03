import { z } from 'zod';

export const assetFiltersSchema = z.object({
  symbol: z.string().optional(),
  assetType: z.enum(['STOCK', 'ETF', 'BOND', 'MUTUAL_FUND', 'CRYPTO', 'CASH', 'OTHER']).optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const assetSearchParamsSchema = z.object({
  symbol: z.string().optional(),
  name: z.string().optional(),
  assetType: z.enum(['STOCK', 'ETF', 'BOND', 'MUTUAL_FUND', 'CRYPTO', 'CASH', 'OTHER']).optional(),
});
