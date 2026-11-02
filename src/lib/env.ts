import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  DEMO_MODE: z.enum(['true', 'false']).default('true'),

  // Database Connection Strings
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(16).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  OWNER_INITIAL_EMAIL: z.string().email().optional(),
  OWNER_INITIAL_PASSWORD: z.string().min(8).optional(),

  // Neon Object Storage
  NEON_STORAGE_ENDPOINT: z.string().url().optional(),
  NEON_STORAGE_REGION: z.string().optional(),
  NEON_STORAGE_BUCKET_PUBLIC: z.string().optional(),
  NEON_STORAGE_BUCKET_PRIVATE: z.string().optional(),
  NEON_STORAGE_ACCESS_KEY_ID: z.string().optional(),
  NEON_STORAGE_SECRET_ACCESS_KEY: z.string().optional(),

  // Communications
  RESEND_API_KEY: z.string().optional(),
  BOOKING_NOTIFICATION_EMAIL: z.string().email().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }
  return parsed.data;
}

export const env = parseEnv();

