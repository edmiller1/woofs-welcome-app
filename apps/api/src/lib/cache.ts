import type { Redis } from "@upstash/redis/cloudflare";

/**
 * Returns the cached value for `key` if present, otherwise computes it via
 * `fn`, caches it for `ttlSeconds`, and returns it. Intended for
 * non-user-specific, slow-changing data (stats, featured/popular lists)
 * that would otherwise hit the DB on every request.
 */
export async function getOrSetCache<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const result = await fn();
  await redis.set(key, result, { ex: ttlSeconds });
  return result;
}
