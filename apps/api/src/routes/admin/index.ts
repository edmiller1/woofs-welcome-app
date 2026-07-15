import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../../middleware/auth";
import { Location, Place } from "../../db/schema";
import { asc, eq } from "drizzle-orm";
import { PlaceService } from "../../services/place.service";
import { ImageUploadService } from "../../services/image-upload.service";
import { CollectionService } from "../../services/collection.service";
import { createPlaceSchema } from "./schemas";

export const adminRouter = new Hono();

adminRouter.use("*", authMiddleware);

adminRouter.use("*", async (c, next) => {
  if (!c.get("isAdmin")) {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});

adminRouter.get("/locations", async (c) => {
  const db = c.get("db");
  const locations = await db
    .select({
      id: Location.id,
      name: Location.name,
      type: Location.type,
      path: Location.path,
      countryCode: Location.countryCode,
    })
    .from(Location)
    .orderBy(asc(Location.name));
  return c.json(locations, 200);
});

adminRouter.post(
  "/place",
  zValidator("json", createPlaceSchema),
  async (c) => {
    const db = c.get("db");
    const env = c.get("env");
    const body = c.req.valid("json");

    const imageUploadService = new ImageUploadService(db, env);
    const collectionService = new CollectionService(db, imageUploadService);
    const placeService = new PlaceService(db, imageUploadService, collectionService, env);

    const [place] = await db
      .insert(Place)
      .values({
        name: body.name,
        slug: body.slug,
        types: body.types,
        description: body.description ?? null,
        locationId: body.locationId,
        countryCode: body.countryCode,
        address: body.address ?? null,
        latitude: body.latitude != null ? String(body.latitude) : null,
        longitude: body.longitude != null ? String(body.longitude) : null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        website: body.website ?? null,
        hours: body.hours ?? null,
        dogRules: body.dogRules ?? [],
        dogAmenities: body.dogAmenities ?? [],
        offLeadAllowed: body.offLeadAllowed ?? false,
        waterAvailable: body.waterAvailable ?? false,
        distanceKm: body.distanceKm ?? 0,
        durationMins: body.durationMins ?? 0,
        difficulty: body.difficulty ?? "beginner",
        isVerified: body.isVerified ?? false,
        isFeatured: body.isFeatured ?? false,
      })
      .returning();

    // Fetch images in the background
    const [location] = await db
      .select({ countryCode: Location.countryCode, name: Location.name })
      .from(Location)
      .where(eq(Location.id, place.locationId))
      .limit(1);

    if (location) {
      c.executionCtx.waitUntil(
        placeService.fetchAndStoreGoogleImages(place.id, place.name, location.countryCode, location.name),
      );
    }

    return c.json({ id: place.id, name: place.name }, 201);
  },
);
