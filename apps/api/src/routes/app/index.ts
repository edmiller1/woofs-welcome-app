import { Hono } from "hono";
import { AppService } from "../../services/app.service";

export const appRouter = new Hono();

appRouter.get("/stats", async (c) => {
  const db = c.get("db");

  const appService = new AppService(db);

  const result = await appService.getAppStats();

  return c.json(result, 200);
});
