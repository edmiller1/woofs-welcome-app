import type { Context } from "hono";
import { rateLimiter } from "hono-rate-limiter";

const getClientIdentifier = (c: Context) => {
  const forwardedFor =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return "unknown";
};

const createRateLimitMessage = (limit: number, window: string) => {
  return `Too many requests. You can make ${limit} requests per ${window}. Please try again later.`;
};

export const sessionRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) =>
    c.json(
      {
        error: "Too many session check attempts",
        message: createRateLimitMessage(30, "15 minutes"),
      },
      429,
    ),
});

export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) =>
    c.json(
      {
        error: "Too many authentication attempts",
        message: createRateLimitMessage(5, "15 minutes"),
      },
      429,
    ),
});

export const writeRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) =>
    c.json(
      {
        error: "Too many requests",
        message: createRateLimitMessage(20, "15 minutes"),
      },
      429,
    ),
});

export const readRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) =>
    c.json(
      {
        error: "Too many requests",
        message: createRateLimitMessage(100, "15 minutes"),
      },
      429,
    ),
});

export const globalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: "draft-6",
  keyGenerator: getClientIdentifier,
  handler: (c) =>
    c.json(
      {
        error: "Too many requests from your IP",
        message:
          "You've exceeded the maximum number of requests. Please try again later.",
      },
      429,
    ),
});

export const createUserRateLimiter = (limit: number, windowMs: number) => {
  return rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const user = c.get("user");
      return user?.id || getClientIdentifier(c);
    },
    handler: (c) =>
      c.json(
        {
          error: "Rate limit exceeded",
          message: `You can only perform this action ${limit} times per ${windowMs / 60000} minutes.`,
        },
        429,
      ),
  });
};
