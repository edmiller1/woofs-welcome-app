import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import type { Env } from "../config/env";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(env: Env): DbInstance {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export type Db = DbInstance;
