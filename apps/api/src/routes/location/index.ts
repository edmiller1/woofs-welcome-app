import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { LocationService } from "../../services/location.service";
import { ImageUploadService } from "../../services/image-upload.service";
import { Location } from "../../db/schema";
import { asc } from "drizzle-orm";

export const locationRouter = new Hono();

locationRouter.get("/featured", async (c) => {
  const db = c.get("db");
  const env = c.get("env");
  const imageUploadService = new ImageUploadService(db, env);
  const locationService = new LocationService(db, imageUploadService);
  const result = await locationService.getFeaturedLocations(8);
  return c.json(result, 200);
});

locationRouter.get("/directory", async (c) => {
  const db = c.get("db");
  const env = c.get("env");
  const imageUploadService = new ImageUploadService(db, env);
  const locationService = new LocationService(db, imageUploadService);

  const type = (c.req.query("type") ?? "country") as "country" | "island" | "region" | "city";
  const letter = c.req.query("letter") ?? undefined;
  const page = Number(c.req.query("page") ?? "1");
  const limit = Number(c.req.query("limit") ?? "100");

  const result = await locationService.getDirectory({ type, letter, page, limit });
  return c.json(result, 200);
});

// Location route: /location/:path (catch-all)
// Example: /location/new-zealand/canterbury/christchurch
// Example: /location/new-zealand/canterbury/christchurch/places?placeSort=popular
locationRouter.get("/:path{.+}", optionalAuthMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const locationService = new LocationService(db, imageUploadService);

  const fullPath = c.req.param("path");

  // Check if this is an /explore request
  if (fullPath.endsWith("/explore")) {
    const locationPath = fullPath.replace(/\/explore$/, "");
    const typesParam = c.req.query("types");
    const types = typesParam ? typesParam.split(",").filter(Boolean) : undefined;
    const page = Number(c.req.query("page") ?? "1");

    const swLat = c.req.query("swLat");
    const swLng = c.req.query("swLng");
    const neLat = c.req.query("neLat");
    const neLng = c.req.query("neLng");
    const bbox =
      swLat && swLng && neLat && neLng
        ? {
            swLat: Number(swLat),
            swLng: Number(swLng),
            neLat: Number(neLat),
            neLng: Number(neLng),
          }
        : undefined;

    const result = await locationService.getExplorePlaces(
      locationPath,
      { types, page, bbox },
      auth?.id,
    );

    return c.json(result, 200);
  }

  // Check if this is a /children request
  if (fullPath.endsWith("/children")) {
    const locationPath = fullPath.replace(/\/children$/, "");
    const depth = Math.min(Number(c.req.query("depth") ?? "1"), 3);
    const result = await locationService.getChildLocations(locationPath, depth);
    return c.json(result, 200);
  }

  // Check if this is a /nearby request
  if (fullPath.endsWith("/nearby")) {
    const locationPath = fullPath.replace(/\/nearby$/, "");
    const result = await locationService.getNearbyLocations(locationPath);
    return c.json(result, 200);
  }

  // Check if this is a /photos request
  if (fullPath.endsWith("/photos")) {
    const locationPath = fullPath.replace(/\/photos$/, "");
    const page = Number(c.req.query("page") ?? "1");
    const limit = Number(c.req.query("limit") ?? "12");
    const result = await locationService.getLocationPhotos(locationPath, page, limit);
    return c.json(result, 200);
  }

  // Check if this is a /places request
  if (fullPath.endsWith("/places")) {
    const locationPath = fullPath.replace(/\/places$/, "");
    const placeSort = c.req.query("placeSort") as
      | "popular"
      | "new"
      | "verified"
      | "surprise"
      | undefined;

    const result = await locationService.getLocationPlaces(
      locationPath,
      { placeSort },
      auth?.id,
    );

    return c.json(result, 200);
  }

  // Otherwise, it's a location request
  const result = await locationService.getLocation(fullPath, auth?.id);

  return c.json(result, 200);
});

locationRouter.get("/sitemap", async (c) => {
  const db = c.get("db");
  const redis = c.get("redis");

  const CACHE_KEY = "sitemap:locations";
  const cached = await redis.get<{ path: string; updatedAt: string }[]>(CACHE_KEY);
  if (cached) return c.json(cached, 200);

  const locations = await db
    .select({ path: Location.path, updatedAt: Location.updatedAt })
    .from(Location)
    .orderBy(asc(Location.path));

  await redis.set(CACHE_KEY, locations, { ex: 60 * 60 * 24 }); // 24h

  return c.json(locations, 200);
});
