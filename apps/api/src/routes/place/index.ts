import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { PlaceService } from "../../services/place.service";
import { BadRequestError } from "../../lib/errors";
import { zValidator } from "@hono/zod-validator";
import { nearbyPlacesSchema, placeReviewsSchema } from "./schemas";
import { ImageUploadService } from "../../services/image-upload.service";
import { CollectionService } from "../../services/collection.service";

export const placeRouter = new Hono();

placeRouter.get(
  "/reviews",
  optionalAuthMiddleware,
  zValidator("query", placeReviewsSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(
      db,
      imageUploadService,
      collectionService,
      env,
    );

    const { page, limit, placeId } = c.req.valid("query");

    const result = await placeService.getPlaceReviews(
      placeId,
      page,
      limit,
      auth?.id,
    );

    return c.json(result, 200);
  },
);

placeRouter.get(
  "/nearby/:placeId",
  optionalAuthMiddleware,
  zValidator("query", nearbyPlacesSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(
      db,
      imageUploadService,
      collectionService,
      env,
    );

    const { lat, lng, radius, limit } = c.req.valid("query");

    const result = await placeService.getNearbyPlaces(
      c.req.param("placeId"),
      lat,
      lng,
      radius,
      limit,
      auth?.id,
    );

    return c.json(result, 200);
  },
);

placeRouter.get("/types", (c) => {
  //Context
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);
  const placeService = new PlaceService(
    db,
    imageUploadService,
    collectionService,
    env,
  );

  const result = placeService.getTypes();

  return c.json(result, 200);
});

placeRouter.get("/similar/:placeId", optionalAuthMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);
  const placeService = new PlaceService(
    db,
    imageUploadService,
    collectionService,
    env,
  );

  const placeId = c.req.param("placeId");

  const result = await placeService.getSimilarPlaces(placeId, 6, auth?.id);

  return c.json(result, 200);
});

placeRouter.get("/:path{.*}", optionalAuthMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);
  const placeService = new PlaceService(
    db,
    imageUploadService,
    collectionService,
    env,
  );

  const path = c.req.param("path");

  const segments = path.split("/");
  const slug = segments.pop();
  const locationPath = segments.join("/");

  if (!slug) {
    throw new BadRequestError("Slug is required");
  }

  const result = await placeService.getPlace(locationPath, slug, auth?.id);

  return c.json(result, 200);
});
