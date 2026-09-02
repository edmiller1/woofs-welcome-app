import type { Context, Next } from "hono";
import { type Db } from "../db";
import { eq, lt } from "drizzle-orm";
import { session } from "../db/schema";
import type { Session, User as betterAuthUser } from "better-auth/types";
import type { Env } from "../config/env";
import type { Redis } from "@upstash/redis/cloudflare";

declare module "hono" {
  interface ContextVariableMap {
    user: betterAuthUser | null;
    session: Session | null;
    userContext: "personal" | "business";
    isAdmin: boolean;
    db: Db;
    env: Env;
    redis: Redis;
  }
}

const SESSION_CACHE_SECONDS = 60;

function fetchUserSession(db: Db, token: string) {
  return db.query.session.findFirst({
    where: eq(session.token, token),
    with: {
      user: true,
    },
  });
}

type UserSessionRecord = NonNullable<
  Awaited<ReturnType<typeof fetchUserSession>>
>;

/**
 * Looks up a session by token, cached briefly by token in Redis.
 *
 * This runs on nearly every authenticated (and many public/optional-auth)
 * request, so a short TTL cache meaningfully cuts DB load. Expired/deleted
 * sessions are still deleted from the DB below on a cache miss; a cache hit
 * just means up to SESSION_CACHE_SECONDS of staleness before that cleanup
 * (and any sign-out/account-deletion) is reflected here.
 */
async function findUserSession(
  db: Db,
  redis: Redis,
  token: string,
): Promise<UserSessionRecord | null> {
  const cacheKey = `session:${token}`;
  const cached = await redis.get<UserSessionRecord | null>(cacheKey);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const userSession = await fetchUserSession(db, token);

  await redis.set(cacheKey, userSession ?? null, {
    ex: SESSION_CACHE_SECONDS,
  });

  return userSession ?? null;
}

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const db = c.get("db");
    const redis = c.get("redis");
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.split(" ")[1] || "";

    if (!token) {
      console.log("No token provided");
      return c.json({ error: "Unauthorized - No token" }, 401);
    }

    const userSession = await findUserSession(db, redis, token);

    if (!userSession) {
      return c.json({ error: "Unauthorized - Invalid session" }, 401);
    }

    // Check if session is expired — delete it so it can't be reused
    if (new Date(userSession.expiresAt) < new Date()) {
      await db.delete(session).where(eq(session.token, token));
      return c.json({ error: "Unauthorized - Session expired" }, 401);
    }

    if (userSession.user.deletedAt) {
      await db.delete(session).where(eq(session.token, token));
      return c.json({ error: "Unauthorized - Account deleted" }, 401);
    }

    // get user context
    const userContext = c.req.header("X-User-Context") || "personal";

    const isAdmin = userSession.user.isAdmin as boolean;

    c.set("user", userSession.user);
    c.set("session", userSession);
    c.set("userContext", userContext as "personal" | "business");
    c.set("isAdmin", isAdmin);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Unauthorized - Server error" }, 401);
  }
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const db = c.get("db");
  const redis = c.get("redis");
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1] || "";

  if (!token) {
    return next();
  }

  const userSession = await findUserSession(db, redis, token);

  if (!userSession || userSession.user.deletedAt) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", userSession.user);
  c.set("session", userSession);
  return next();
};
