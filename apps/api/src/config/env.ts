import { z } from "zod";

const envSchema = z.object({
  //Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  //Server
  PORT: z.string().default("9000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  //Web Frontend
  FRONTEND_BASE_URL: z.string().url("CLIENT_BASE_URL must be a valid URL"),

  //Mobile App
  MOBILE_BASE_URL: z.string().url("MOBILE_BASE_URL must be a valid URL"),

  //Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.url("GOOGLE_REDIRECT_URI must be a valid URL"),

  // Google Places API
  GOOGLE_PLACES_API_KEY: z.string().min(1, "GOOGLE_PLACES_API_KEY is required"),

  // Resend (Email)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // Sentry
  SENTRY_DSN: z.string().min(1, "SENTRY_DSN is required"),

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_URL is required"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),

  // Discord
  DISCORD_CLAIM_WEBHOOK_URL: z
    .string()
    .min(1, "DISCORD_CLAIM_WEBHOOK_URL is required"),

  // Cloudflare
  CF_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  CF_TOKEN: z.string().min(1, "R2_TOKEN is required"),
  CF_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  CF_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  CF_ENDPOINT: z.url().min(1, "R2_ENDPOINT is required"),
  CF_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  CF_IMAGES_API_TOKEN: z.string().min(1, "R2_IMAGES_API_TOKEN is required"),
  CF_IMAGES_DELIVERY_URL: z.url().min(1, "R2_IMAGES_DELIVERY_URL is required"),
});

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment variables:");
      console.error("");

      error.issues.forEach((err) => {
        console.log(`- ${err.path.join(".")}: ${err.message}`);
      });

      console.error("");
      console.error(
        "💡 Check your .env file and make sure all required variables are set.",
      );
      console.error("");

      process.exit(1);
    }
    throw error;
  }
}

// Export validated and typed environment variables
export const env = validateEnv();

// Export types for use in other files
export type Env = z.infer<typeof envSchema>;
