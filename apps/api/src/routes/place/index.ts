import { Hono } from "hono";
import { optionalAuthMiddleware, authMiddleware } from "../../middleware/auth";
import { PlaceService } from "../../services/place.service";
import { BadRequestError } from "../../lib/errors";
import { zValidator } from "@hono/zod-validator";
import { explorePlacesSchema, nearbyPlacesSchema, placeReviewsSchema, searchPlacesSchema, suggestEditSchema, trendingPlacesSchema } from "./schemas";
import { ImageUploadService } from "../../services/image-upload.service";
import { CollectionService } from "../../services/collection.service";
import { PlaceSuggestedEdit, Place } from "../../db/schema";
import { eq, and, count } from "drizzle-orm";
import { sendDiscordSuggestedEditNotification } from "../../lib/discord";

export const placeRouter = new Hono();

placeRouter.get(
  "/search",
  zValidator("query", searchPlacesSchema),
  async (c) => {
    const db = c.get("db");
    const env = c.get("env");
    const { q } = c.req.valid("query");

    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(db, imageUploadService, collectionService, env);

    const result = await placeService.search(q);
    return c.json(result, 200);
  },
);

placeRouter.get("/community-stats", async (c) => {
  const db = c.get("db");
  const env = c.get("env");

  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);
  const placeService = new PlaceService(
    db,
    imageUploadService,
    collectionService,
    env,
  );

  const result = await placeService.getCommunityStats();

  return c.json(result, 200);
});

placeRouter.get(
  "/trending",
  optionalAuthMiddleware,
  zValidator("query", trendingPlacesSchema),
  async (c) => {
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(
      db,
      imageUploadService,
      collectionService,
      env,
    );

    const { limit } = c.req.valid("query");

    const result = await placeService.getTrendingPlaces(limit, auth?.id);

    return c.json(result, 200);
  },
);

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

placeRouter.get(
  "/explore",
  optionalAuthMiddleware,
  zValidator("query", explorePlacesSchema),
  async (c) => {
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(
      db,
      imageUploadService,
      collectionService,
      env,
    );

    const { swLat, swLng, neLat, neLng, types, rating, distance, minLength, maxLength, difficulty } =
      c.req.valid("query");

    const result = await placeService.explorePlaces(
      { swLat, swLng, neLat, neLng, types, rating, distance, minLength, maxLength, difficulty },
      auth?.id,
    );

    return c.json(result, 200);
  },
);

placeRouter.get("/popular", async (c) => {
  const db = c.get("db");
  const env = c.get("env");

  const imageUploadService = new ImageUploadService(db, env);
  const collectionService = new CollectionService(db, imageUploadService);
  const placeService = new PlaceService(db, imageUploadService, collectionService, env);

  const result = await placeService.getPopularPlaces(4);
  return c.json(result, 200);
});

placeRouter.post(
  "/suggest-edit",
  authMiddleware,
  zValidator("json", suggestEditSchema),
  async (c) => {
    const auth = c.get("user")!;
    const db = c.get("db");
    const env = c.get("env");
    const { placeId, field, suggestedValue, notes } = c.req.valid("json");

    // Rate limit: max 5 pending suggestions per user per place
    const pendingResult = await db
      .select({ pendingCount: count() })
      .from(PlaceSuggestedEdit)
      .where(
        and(
          eq(PlaceSuggestedEdit.placeId, placeId),
          eq(PlaceSuggestedEdit.userId, auth.id),
          eq(PlaceSuggestedEdit.status, "pending"),
        ),
      );

    if ((pendingResult[0]?.pendingCount ?? 0) >= 5) {
      throw new BadRequestError("You have too many pending suggestions for this place");
    }

    // Fetch current place value to snapshot it
    const [place] = await db
      .select()
      .from(Place)
      .where(eq(Place.id, placeId))
      .limit(1);

    if (!place) throw new BadRequestError("Place not found");

    const currentValue = place[field as keyof typeof place] ?? null;

    const [edit] = await db
      .insert(PlaceSuggestedEdit)
      .values({
        placeId,
        userId: auth.id,
        field,
        currentValue: currentValue as any,
        suggestedValue,
        notes,
      })
      .returning();

    // Discord notification (non-blocking)
    sendDiscordSuggestedEditNotification(env, {
      placeName: place.name,
      placeSlug: place.slug,
      locationPath: "", // location path not on Place directly, just omit for now
      userName: auth.name ?? auth.email,
      field,
      suggestedValue,
      notes,
    }).catch(() => {});

    return c.json({ id: edit!.id }, 201);
  },
);

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
