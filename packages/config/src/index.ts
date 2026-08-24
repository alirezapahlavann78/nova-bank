import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  AI_GATEWAY_ENABLED: z.coerce.boolean().default(false),
  AI_PROVIDER_API_KEY: z.string().optional(),
  AI_DEFAULT_MODEL: z.string().optional(),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(4096),
  SUBSCRIPTION_WEBHOOK_SECRET: z.string().optional(),
  DEFAULT_CURRENCY: z.string().default('toman'),
  DEFAULT_LOCALE: z.string().default('fa-IR'),
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv() {
  if (!env) {
    env = envSchema.parse(process.env);
  }
  return env;
}
