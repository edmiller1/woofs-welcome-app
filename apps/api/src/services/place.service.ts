import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from "../lib/errors";
import {
  Collection,
  CollectionItem,
  Location,
  Place,
  PlaceImage,
  Review,
} from "../db/schema";
import { Google } from "../lib/google";
import { ImageUploadService } from "./image-upload.service";
import { locationPathSchema } from "../routes/location/schemas";
import { placeSlugSchema } from "../routes/place/schemas";
import { sanitizePlainText } from "../lib/sanitize";
import { CollectionService } from "./collection.service";

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
        .where(
          and(
            eq(Place.slug, validatedPlaceSlug),
            eq(Location.path, validatedLocationPath),
          ),
        )
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

      let isSaved = false;
      if (userId) {
        isSaved = await CollectionService.isPlaceSaved(place.id, userId);
      }

      // Review Stats
      const stats = await db
        .select({
          rating: Review.rating,
          count: count(),
        })
        .from(Review)
        .where(eq(Review.placeId, place.id))
        .groupBy(Review.rating);

      const totalReviews = stats.reduce((sum, s) => sum + s.count, 0);
      const averageRating =
        totalReviews > 0
          ? stats.reduce((sum, s) => sum + s.rating * s.count, 0) / totalReviews
          : 0;

      const reviewBreakdown = [5, 4, 3, 2, 1].map((rating) => {
        const found = stats.find((s) => s.rating === rating);
        const ratingCount = found?.count ?? 0;
        return {
          rating,
          count: ratingCount,
          percentage: totalReviews > 0 ? (ratingCount / totalReviews) * 100 : 0,
        };
      });

      return {
        ...place,
        location,
        images,
        reviewStats: {
          totalReviews,
          averageRating,
          reviewBreakdown,
        },
        breadcrumbs,
        isSaved,
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

  static async getPlaceReviews(
    placeId: string,
    page: number,
    limit: number,
    userId?: string,
  ) {
    try {
      const reviews = await db.query.Review.findMany({
        where: eq(Review.placeId, placeId),
        with: {
          images: true,
          likes: true,
          replies: true,
          reports: true,
          user: {
            columns: {
              id: true,
              name: true,
              image: true,
              profileImageId: true,
            },
          },
        },
        orderBy: desc(Review.createdAt),
        limit: limit,
        offset: page * limit,
      });

      return reviews.map((review) => ({
        ...review,
        isOwner: userId ? review.userId === userId : false,
        hasLiked: userId
          ? review.likes.some((like) => like.userId === userId)
          : false,
        hasReported: userId
          ? review.reports.some((report) => report.userId === userId)
          : false,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get place reviews error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get place reviews", {
        originalError: error,
      });
    }
  }
}
