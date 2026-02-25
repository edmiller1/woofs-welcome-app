import { z } from "zod";

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),

  // Server
  PORT: z.string().default("9000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Web Frontend
  FRONTEND_BASE_URL: z.url(),
  FRONTEND_BASE_URL_WWW: z.url(),

  // Mobile App
  MOBILE_BASE_URL: z.url(),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_BASE_URL: z.url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url(),

  // Google APIs
  GOOGLE_PLACES_API_KEY: z.string().min(1),
  GOOGLE_GEMINI_API_KEY: z.string().min(1),

  // Email
  RESEND_API_KEY: z.string().min(1),

  // Sentry
  SENTRY_DSN: z.string().min(1),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(1),

  // Discord
  DISCORD_CLAIM_WEBHOOK_URL: z.string().min(1),

  // Cloudflare
  CF_ACCOUNT_ID: z.string().min(1),
  CF_TOKEN: z.string().min(1),
  CF_ACCESS_KEY_ID: z.string().min(1),
  CF_SECRET_ACCESS_KEY: z.string().min(1),
  CF_ENDPOINT: z.url(),
  CF_BUCKET_NAME: z.string().min(1),
  CF_IMAGES_API_TOKEN: z.string().min(1),
  CF_IMAGES_DELIVERY_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Env): Env {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:\n");

    parsed.error.issues.forEach((err) => {
      console.error(`- ${err.path.join(".")}: ${err.message}`);
    });

    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}
