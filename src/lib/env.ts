import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DATABASE_URL_POOLED: z.string().optional(),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16)
    .default("fade-exclusive-dev-secret-key-minimum-32-chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_PATH_SLUG: z.string().min(6).default("fade-atelier-ops-9x7k"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  R2_ACCOUNT_ID: z.string().optional().default("demo-r2-account"),
  R2_ACCESS_KEY_ID: z.string().optional().default("demo-r2-key"),
  R2_SECRET_ACCESS_KEY: z.string().optional().default("demo-r2-secret"),
  R2_PUBLIC_BUCKET: z.string().default("fade-public-media"),
  R2_PRIVATE_BUCKET: z.string().default("fade-private-uploads"),
  R2_PUBLIC_BASE_URL: z.string().url().default("https://media.fadeexclusive.com"),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("Fadé Exclusive <atelier@fadeexclusive.com>"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default("1x00000000000000000000AA"),
  TURNSTILE_SECRET_KEY: z.string().default("1x0000000000000000000000000000000AA"),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  CRON_SECRET: z.string().min(8).default("fade-cron-secret-key-2026"),
  SENTRY_DSN: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;
  const parsed = serverEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ADMIN_PATH_SLUG: process.env.ADMIN_PATH_SLUG,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_BUCKET: process.env.R2_PUBLIC_BUCKET,
    R2_PRIVATE_BUCKET: process.env.R2_PRIVATE_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
  });

  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Environment validation failed");
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
