import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createReviewSchema } from "./schemas";
import { UnauthorizedError } from "../../lib/errors";
import { ReviewService } from "../../services/review.service";

export const reviewRouter = new Hono();

reviewRouter.post(
  "/create",
  authMiddleware,
  zValidator("form", createReviewSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { images, ...reviewData } = c.req.valid("form");

    const result = await ReviewService.createReview(auth.id, reviewData, images);

    return c.json(result, 201);
  },
);

reviewRouter.get("/dog-breeds", async (c) => {
  const result = await ReviewService.getDogBreeds();

  return c.json(result, 200);
});
