import { Hono } from "hono";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import {
  createReviewSchema,
  deleteReviewSchema,
  getReviewSchema,
  reportReviewSchema,
  updateReviewParamsSchema,
  updateReviewSchema,
} from "./schemas";
import { UnauthorizedError } from "../../lib/errors";
import { ReviewService } from "../../services/review.service";
import { ImageUploadService } from "../../services/image-upload.service";
import { createDbWithTransactions } from "../../db";

export const reviewRouter = new Hono();

reviewRouter.post(
  "/create",
  authMiddleware,
  zValidator("form", createReviewSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const env = c.get("env");

    const { db, pool } = createDbWithTransactions(env);

    try {
      // Services
      const imageUploadService = new ImageUploadService(db, env);
      const reviewService = new ReviewService(db, env, imageUploadService);

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
    } finally {
      await pool.end();
    }
  },
);

reviewRouter.get("/dog-breeds", async (c) => {
  //Context
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const reviewService = new ReviewService(db, env, imageUploadService);

  const result = await reviewService.getDogBreeds();

  return c.json(result, 200);
});

reviewRouter.patch(
  ":reviewId/update",
  authMiddleware,
  zValidator("form", updateReviewSchema),
  zValidator("param", updateReviewParamsSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const env = c.get("env");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { db, pool } = createDbWithTransactions(env);

    try {
      // Services
      const imageUploadService = new ImageUploadService(db, env);
      const reviewService = new ReviewService(db, env, imageUploadService);

      const { images, deletedImages, ...reviewData } = c.req.valid("form");
      const { reviewId } = c.req.valid("param");

      const result = await reviewService.updateReview(
        auth.id,
        reviewId,
        reviewData,
        images,
        deletedImages,
      );

      return c.json(result, 200);
    } finally {
      await pool.end();
    }
  },
);

reviewRouter.delete(
  "/:reviewId",
  authMiddleware,
  zValidator("param", deleteReviewSchema),
  async (c) => {
    // Context
    const auth = c.get("user");
    const env = c.get("env");

    if (!auth) throw new UnauthorizedError("Unauthorized");

    const { reviewId } = c.req.valid("param");
    const { db, pool } = createDbWithTransactions(env);

    try {
      // Services
      const imageUploadService = new ImageUploadService(db, env);
      const reviewService = new ReviewService(db, env, imageUploadService);
      await reviewService.deleteReview(auth.id, reviewId);
      return c.body(null, 204);
    } finally {
      await pool.end();
    }
  },
);

reviewRouter.get(
  "/:reviewId",
  optionalAuthMiddleware,
  zValidator("param", getReviewSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    const imageUploadService = new ImageUploadService(db, env);
    const reviewService = new ReviewService(db, env, imageUploadService);

    const { reviewId } = c.req.valid("param");
    const result = await reviewService.getReview(reviewId, auth?.id);

    return c.json(result, 200);
  },
);

reviewRouter.post(
  "/:reviewId/report",
  authMiddleware,
  zValidator("json", reportReviewSchema),
  zValidator("param", getReviewSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const reviewService = new ReviewService(db, env, imageUploadService);

    const { reviewId } = c.req.valid("param");
    const data = c.req.valid("json");

    const result = await reviewService.reportReview(auth.id, reviewId, data);

    return c.json(result, 200);
  },
);

reviewRouter.post(
  "/:reviewId/like",
  authMiddleware,
  zValidator("param", getReviewSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const env = c.get("env");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { db, pool } = createDbWithTransactions(env);

    try {
      // Services
      const imageUploadService = new ImageUploadService(db, env);
      const reviewService = new ReviewService(db, env, imageUploadService);

      const { reviewId } = c.req.valid("param");

      const result = await reviewService.likeReview(reviewId, auth.id);

      return c.json(result, 200);
    } finally {
      await pool.end();
    }
  },
);
