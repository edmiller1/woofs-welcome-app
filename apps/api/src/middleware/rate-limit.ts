import { RedisStore } from "@hono-rate-limiter/redis";
import { Redis } from "@upstash/redis/cloudflare";
import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

const getClientIdentifier = (c: Context): string => {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip") ||
    "unknown";
  return ip.split(",")[0]?.trim() ?? "unknown";
};

const createRateLimitMessage = (limit: number, window: string) =>
  `Too many requests. You can make ${limit} requests per ${window}. Please try again later.`;

export const sessionRateLimiter = (redis: Redis) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        { error: "Too many session check attempts", message: createRateLimitMessage(30, "15 minutes") },
        429,
      ),
  });

export const authRateLimiter = (redis: Redis) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        { error: "Too many authentication attempts", message: createRateLimitMessage(5, "15 minutes") },
        429,
      ),
  });

export const writeRateLimiter = (redis: Redis) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        { error: "Too many requests", message: createRateLimitMessage(20, "15 minutes") },
        429,
      ),
  });

export const readRateLimiter = (redis: Redis) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        { error: "Too many requests", message: createRateLimitMessage(100, "15 minutes") },
        429,
      ),
  });

export const globalRateLimiter = (redis: Redis) =>
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-6",
    keyGenerator: getClientIdentifier,
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        {
          error: "Too many requests from your IP",
          message: "You've exceeded the maximum number of requests. Please try again later.",
        },
        429,
      ),
  });

export const createUserRateLimiter = (redis: Redis, limit: number, windowMs: number) =>
  rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const user = c.get("user");
      return user?.id || getClientIdentifier(c);
    },
    store: new RedisStore({ client: redis }),
    handler: (c) =>
      c.json(
        {
          error: "Rate limit exceeded",
          message: `You can only perform this action ${limit} times per ${windowMs / 60000} minutes.`,
        },
        429,
      ),
  });
