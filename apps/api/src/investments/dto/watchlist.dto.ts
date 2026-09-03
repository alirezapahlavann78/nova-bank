import { z } from 'zod';

export const createWatchlistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const updateWatchlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export const addWatchlistItemSchema = z.object({
  assetId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
});

export const watchlistFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
