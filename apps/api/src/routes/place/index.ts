import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { PlaceService } from "../../services/place.service";
import { BadRequestError } from "../../lib/errors";

export const placeRouter = new Hono();

placeRouter.get("/:path{.*}", optionalAuthMiddleware, async (c) => {
  const auth = c.get("user");
  const path = c.req.param("path");

  const segments = path.split("/");
  const slug = segments.pop();
  const locationPath = segments.join("/");

  if (!slug) {
    throw new BadRequestError("Slug is required");
  }

  const result = await PlaceService.getPlace(locationPath, slug, auth?.id);

  return c.json(result, 200);
});
