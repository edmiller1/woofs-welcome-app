import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { LocationService } from "../../services/location.service";

export const locationRouter = new Hono();

// Location route: /location/:path (catch-all)
// Example: /location/new-zealand/canterbury/christchurch
// Example: /location/new-zealand/canterbury/christchurch/places?placeSort=popular
locationRouter.get("/:path{.+}", optionalAuthMiddleware, async (c) => {
  const auth = c.get("user");
  const fullPath = c.req.param("path");

  // Check if this is a /places request
  if (fullPath.endsWith("/places")) {
    const locationPath = fullPath.replace(/\/places$/, "");
    const placeSort = c.req.query("placeSort") as
      | "popular"
      | "new"
      | "verified"
      | "surprise"
      | undefined;

    const result = await LocationService.getLocationPlaces(
      locationPath,
      { placeSort },
      auth?.id,
    );

    return c.json(result, 200);
  }

  // Otherwise, it's a location request
  const result = await LocationService.getLocation(fullPath, auth?.id);

  return c.json(result, 200);
});
