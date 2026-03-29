import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { LocationService } from "../../services/location.service";
import { ImageUploadService } from "../../services/image-upload.service";

export const locationRouter = new Hono();

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

    const result = await locationService.getExplorePlaces(
      locationPath,
      { types, page },
      auth?.id,
    );

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
