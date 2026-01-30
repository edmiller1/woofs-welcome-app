import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { Location, Place, PlaceImage, Review } from "../db/schema";
import { Google } from "../lib/google";
import { ImageUploadService } from "./image-upload.service";
import { locationPathSchema } from "../routes/location/schemas";
import { placeSlugSchema } from "../routes/place/schemas";

/**
 * Place Service
 *
 * Handles all place-related business logic
 */
export class PlaceService {
  static async getPlace(
    locationPath: string,
    placeSlug: string,
    userId?: string,
  ) {
    try {
      const validatedLocationPath = locationPathSchema.parse(locationPath);
      const validatedPlaceSlug = placeSlugSchema.parse(placeSlug);

      // Query place with location join to verify the path
      const [result] = await db
        .select({
          place: Place,
          location: Location,
        })
        .from(Place)
        .innerJoin(Location, eq(Place.locationId, Location.id))
        .where(and(eq(Place.slug, validatedPlaceSlug), eq(Location.path, validatedLocationPath)))
        .limit(1);

      if (!result) {
        throw new NotFoundError("Place not found");
      }

      const { place, location } = result;

      // Get place images
      const images = await db
        .select()
        .from(PlaceImage)
        .where(eq(PlaceImage.placeId, place.id));

      // If no images, try to fetch from Google Places
      if (images.length === 0) {
        try {
          const placesData = await Google.searchPlaces(
            place.name,
            location.countryCode,
          );

          if (placesData.length === 0) {
            console.log("No Google Places results found");
          } else {
            const imageUrls = await Google.getPlacePhotos(
              placesData[0].place_id,
            );

            if (imageUrls && imageUrls.length > 0) {
              const imageUploadService = new ImageUploadService();

              // Upload images from Google to Cloudflare
              const uploadedImages =
                await imageUploadService.uploadMultipleImagesFromUrls(
                  imageUrls.slice(0, 20), // Limit to 20 images
                  {
                    imageType: "place_gallery",
                    metadata: {
                      source: "google_places",
                      placeId: place.id,
                      googlePlaceId: placesData[0].place_id,
                    },
                  },
                );

              // Create PlaceImage records linking images to the place
              if (uploadedImages.length > 0) {
                await db.insert(PlaceImage).values(
                  uploadedImages.map((img, index) => ({
                    placeId: place.id,
                    imageId: img.id,
                    isPrimary: index === 0, // First image is primary
                    displayOrder: index,
                  })),
                );

                // Re-fetch images after upload
                const newImages = await db
                  .select()
                  .from(PlaceImage)
                  .where(eq(PlaceImage.placeId, place.id));

                images.push(...newImages);
              }
            } else {
              console.log("No images found from Google Places");
            }
          }
        } catch (error) {
          console.error("Error fetching/uploading place images:", error);
        }
      }

      // Get recent reviews
      const reviews = await db
        .select()
        .from(Review)
        .where(eq(Review.placeId, place.id))
        .orderBy(Review.createdAt)
        .limit(10);

      // Build breadcrumbs from location path + place
      const pathSegments = validatedLocationPath.split("/");
      const ancestorPaths = pathSegments.map((_, index) =>
        pathSegments.slice(0, index + 1).join("/"),
      );

      const locationBreadcrumbs = await db
        .select({
          name: Location.name,
          slug: Location.slug,
          path: Location.path,
          level: Location.level,
        })
        .from(Location)
        .where(inArray(Location.path, ancestorPaths))
        .orderBy(asc(Location.level));

      // Add place as the final breadcrumb
      const breadcrumbs = [
        ...locationBreadcrumbs,
        {
          name: place.name,
          slug: place.slug,
          path: `${validatedLocationPath}/places/${validatedPlaceSlug}`,
          level: locationBreadcrumbs.length,
        },
      ];

      return {
        ...place,
        location,
        images,
        reviews,
        breadcrumbs,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get place error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get place", {
        originalError: error,
      });
    }
  }
}
