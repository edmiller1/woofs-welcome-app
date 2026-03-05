import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { Env } from "../config/env";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(env: Env): DbInstance {
  const url =
    env.NODE_ENV === "production" ? env.DATABASE_URL : env.DATABASE_URL_DEV;
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export type Db = DbInstance;
