import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { PlaceService } from "../../services/place.service";

export const placeRouter = new Hono();

placeRouter.get("/:path{.*}", optionalAuthMiddleware, async (c) => {
  const auth = c.get("user");
  const path = c.req.param("path");

  const result = await PlaceService.getPlace(path, auth?.id);

  return c.json(result, 200);
});
