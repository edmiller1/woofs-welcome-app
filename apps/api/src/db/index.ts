import { Pool } from "@neondatabase/serverless";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import type { Env } from "../config/env";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DbInstance | null = null;

export function createDb(env: Env) {
  if (cachedDb) return cachedDb;
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  cachedDb = drizzle(pool, { schema });
  return cachedDb;
}

export type Db = DbInstance;
