import {
  and,
  asc,
  between,
  count,
  desc,
  eq,
  inArray,
  ne,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import {
  Location,
  Place,
  PlaceImage,
  placeTypeEnum,
  Review,
} from "../db/schema";
import { Google } from "../lib/google";
import { ImageUploadService } from "./image-upload.service";
import { locationPathSchema } from "../routes/location/schemas";
import { placeSlugSchema } from "../routes/place/schemas";
import { CollectionService } from "./collection.service";
import {
  calculateDistance,
  getBoundingBox,
  getPlaceDescription,
} from "../lib/helpers/place";
import { RecommendationService } from "./recommendation.service";

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

      if (!place.description) {
        const AIdesc = await getPlaceDescription(place.name, location.path);

        await db
          .update(Place)
          .set({
            description: AIdesc,
          })
          .where(eq(Place.id, place.id));
      }

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
        offset: (page - 1) * limit,
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

  static async getNearbyPlaces(
    placeId: string,
    lat: number,
    lng: number,
    radius: number,
    limit: number,
    userId?: string,
  ) {
    try {
      const bbox = getBoundingBox(lat, lng, radius);

      const conditions = [
        between(
          sql`CAST(${Place.latitude} AS DECIMAL)`,
          bbox.minLat.toString(),
          bbox.maxLat.toString(),
        ),
        between(
          sql`CAST(${Place.longitude} AS DECIMAL)`,
          bbox.minLng.toString(),
          bbox.maxLng.toString(),
        ),
      ];

      //Exclude current place
      conditions.push(ne(Place.id, placeId));

      // Get places with conditions
      const places = await db.query.Place.findMany({
        where: and(...conditions),
        with: {
          location: true,
          images: true,
        },
        limit: limit * 2,
      });

      //Calculate distances and filter by radius
      const placesWithDistance = places
        .map((place) => {
          const distance = calculateDistance(
            lat,
            lng,
            parseFloat(place.latitude!),
            parseFloat(place.longitude!),
          );
          return {
            ...place,
            distance,
          };
        })
        .filter((place) => place.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      let savedPlaceIds = new Set<string>();
      if (userId) {
        savedPlaceIds = await CollectionService.getSavedPlaceIds(
          placesWithDistance.map((place) => place.id),
          userId,
        );
      }

      return {
        places: placesWithDistance.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
        })),
        center: { lat, lng },
        radius,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get nearby places error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get nearby places", {
        originalError: error,
      });
    }
  }

  static getTypes() {
    try {
      return placeTypeEnum.enumValues.sort((a, b) => a.localeCompare(b));
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get place types error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get place types", {
        originalError: error,
      });
    }
  }

  static async getSimilarPlaces(
    placeId: string,
    limit: number = 6,
    userId?: string,
  ) {
    try {
      const sourcePlace = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
        with: {
          location: {
            with: {
              parent: {
                with: {
                  parent: {
                    columns: { name: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!sourcePlace) {
        throw new Error("Place not found");
      }

      const candidates = await db.query.Place.findMany({
        where: and(
          eq(Place.locationId, sourcePlace.locationId),
          ne(Place.id, placeId),
        ),
        with: {
          location: true,
          images: true,
        },
      });

      const scored = candidates.map((candidate) => ({
        place: candidate,
        score: RecommendationService.calculateSimilarityScore(
          sourcePlace,
          candidate,
        ),
      }));

      // 4. Sort by score and return top N
      const topPlaces = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.place);

      let savedPlaceIds = new Set<string>();
      if (userId) {
        savedPlaceIds = await CollectionService.getSavedPlaceIds(
          topPlaces.map((place) => place.id),
          userId,
        );
      }

      const parentLocationName =
        sourcePlace.location?.parent?.parent?.name ?? null;

      return topPlaces.map((place) => ({
        ...place,
        isSaved: savedPlaceIds.has(place.id),
        parentLocationName,
      }));
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get similar places error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get similar places", {
        originalError: error,
      });
    }
  }
}
