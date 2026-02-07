import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { PlaceService } from "../../services/place.service";
import { BadRequestError } from "../../lib/errors";
import { zValidator } from "@hono/zod-validator";
import { placeReviewsSchema } from "./schemas";

export const placeRouter = new Hono();

placeRouter.get(
  "/reviews",
  optionalAuthMiddleware,
  zValidator("query", placeReviewsSchema),
  async (c) => {
    const auth = c.get("user");

    const { page, limit, placeId } = c.req.valid("query");

    const result = await PlaceService.getPlaceReviews(
      placeId,
      page,
      limit,
      auth?.id,
    );

    return c.json(result, 200);
  },
);

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
