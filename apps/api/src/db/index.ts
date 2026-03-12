import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { Env } from "../config/env";
import {
  drizzle as drizzleWs,
  NeonDatabase,
} from "drizzle-orm/neon-serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(env: Env): DbInstance {
  const url =
    env.NODE_ENV === "production" ? env.DATABASE_URL : env.DATABASE_URL_DEV;

  const sql = neon(url);
  return drizzle(sql, { schema });
}

export function createDbWithTransactions(env: Env) {
  const url =
    env.NODE_ENV === "production" ? env.DATABASE_URL : env.DATABASE_URL_DEV;

  neonConfig.webSocketConstructor = WebSocket;
  const pool = new Pool({ connectionString: url });
  const db = drizzleWs(pool, { schema });

  return { db, pool };
}

export type Db = DbInstance;
export type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;
