import { Hono } from "hono";
import { AppService } from "../../services/app.service";
import { getOrSetCache } from "../../lib/cache";

export const appRouter = new Hono();

appRouter.get("/stats", async (c) => {
  const db = c.get("db");
  const redis = c.get("redis");

  const appService = new AppService(db);

  const result = await getOrSetCache(redis, "app-stats", 300, () =>
    appService.getAppStats(),
  );

  return c.json(result, 200);
});
