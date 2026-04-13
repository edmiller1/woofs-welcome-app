import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { upcomingEventsSchema } from "./schemas";
import { EventService } from "../../services/event.service";

export const eventRouter = new Hono();

eventRouter.get(
  "/upcoming",
  optionalAuthMiddleware,
  zValidator("query", upcomingEventsSchema),
  async (c) => {
    const auth = c.get("user");
    const db = c.get("db");

    const eventService = new EventService(db);

    const { limit } = c.req.valid("query");

    const result = await eventService.getUpcomingEvents(limit, auth?.id);

    return c.json(result, 200);
  },
);
