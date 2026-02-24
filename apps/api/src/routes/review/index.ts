import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { createReviewSchema } from "./schemas";
import { UnauthorizedError } from "../../lib/errors";
import { ReviewService } from "../../services/review.service";
import { ImageUploadService } from "../../services/image-upload.service";

export const reviewRouter = new Hono();

reviewRouter.post(
  "/create",
  authMiddleware,
  zValidator("form", createReviewSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const reviewService = new ReviewService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { images, ...reviewData } = c.req.valid("form");

    const result = await reviewService.createReview(
      auth.id,
      reviewData,
      images,
    );

    return c.json(result, 201);
  },
);

reviewRouter.get("/dog-breeds", async (c) => {
  // Services
  const imageUploadService = new ImageUploadService(c.get("db"), c.get("env"));
  const reviewService = new ReviewService(c.get("db"), imageUploadService);

  const result = await reviewService.getDogBreeds();

  return c.json(result, 200);
});
