import { RedisStore } from "@hono-rate-limiter/redis";
import { Redis } from "@upstash/redis/cloudflare";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

const getClientIdentifier = (c: Context) => {
  const forwardedFor =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip");

  if (forwardedFor) {
    // If multiple IPs in x-forwarded-for, take the first one
    return Promise.resolve(forwardedFor.split(",")[0]?.trim() ?? "unknown");
  }

  // Fallback to direct connection (won't work behind proxy)
  return Promise.resolve("unknown");
};

const createRateLimitMessage = (limit: number, window: string) => {
  return `Too many requests. You can make ${limit} requests per ${window}. Please try again later.`;
};

/**
 * Session Check Rate Limit - For get-session endpoint
 *
 * Limit: 30 requests per 15 minutes per IP
 */
export const sessionRateLimiter = (redis: Redis) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) => {
      return c.json(
        {
          error: "Too many session check attempts",
          message: createRateLimitMessage(30, "15 minutes"),
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};

/**
 * STRICT Rate Limit - For Authentication Endpoints
 *
 * Use Case: Sign-in, sign-up, OTP verification
 *
 * Limit: 5 requests per 15 minutes per IP
 */
export const authRateLimiter = (redis: Redis) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) => {
      return c.json(
        {
          error: "Too many authentication attempts",
          message: createRateLimitMessage(5, "15 minutes"),
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};

/**
 * MODERATE Rate Limit - For Write Operations
 *
 * Use Case: Creating reviews, uploading images, adding to collections
 *
 * Limit: 20 requests per 15 minutes per IP
 */
export const writeRateLimiter = (redis: Redis) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) => {
      return c.json(
        {
          error: "Too many requests",
          message: createRateLimitMessage(20, "15 minutes"),
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};

/**
 * LENIENT Rate Limit - For Read Operations
 *
 * Use Case: Browsing places, viewing reviews, searching
 *
 * Limit: 100 requests per 15 minutes per IP
 */
export const readRateLimiter = (redis: Redis) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) => {
      return c.json(
        {
          error: "Too many requests",
          message: createRateLimitMessage(100, "15 minutes"),
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};

/**
 * GLOBAL Rate Limit - For All Endpoints
 *
 * Use Case: Catch-all protection against DDoS
 * Prevents overwhelming the server
 *
 * Limit: 200 requests per 15 minutes per IP
 */
export const globalRateLimiter = (redis: Redis) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) => {
      return c.json(
        {
          error: "Too many requests from your IP",
          message:
            "You've exceeded the maximum number of requests. Please try again later.",
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};

/**
 * User-Specific Rate Limiter (for authenticated actions)
 *
 * Use Case: Limit per-user actions (reviews, claims)
 * Why Needed: Prevents spam even from legitimate users
 */
export const createUserRateLimiter = (limit: number, windowMs: number) => {
  return rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      // Use user ID if authenticated, fallback to IP
      const user = c.get("user");
      return user?.id || getClientIdentifier(c);
    },
    handler: (c) => {
      return c.json(
        {
          error: "Rate limit exceeded",
          message: `You can only perform this action ${limit} times per ${windowMs / 60000} minutes.`,
          retryAfter: c.get("ratelimit-reset" as any),
        },
        429,
      );
    },
  });
};
