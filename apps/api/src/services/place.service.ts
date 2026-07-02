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
import { alias } from "drizzle-orm/pg-core";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import {
  CheckIn,
  CollectionItem,
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
  isMemberFavourite,
} from "../lib/helpers/place";
import { RecommendationService } from "./recommendation.service";
import type { Db } from "../db";
import type { Env } from "../config/env";

/**
 * Place Service
 *
 * Handles all place-related business logic
 */
export class PlaceService {
  constructor(
    private db: Db,
    private imageUploadService: ImageUploadService,
    private collectionService: CollectionService,
    private env: Env,
  ) {}

  async getPlace(locationPath: string, placeSlug: string, userId?: string) {
    try {
      const validatedLocationPath = locationPathSchema.parse(locationPath);
      const validatedPlaceSlug = placeSlugSchema.parse(placeSlug);

      const ParentLocation = alias(Location, "parent_location");

      // Query place with location join to verify the path
      const [result] = await this.db
        .select({
          place: Place,
          location: Location,
          region: ParentLocation,
        })
        .from(Place)
        .innerJoin(Location, eq(Place.locationId, Location.id))
        .leftJoin(ParentLocation, eq(Location.parentId, ParentLocation.id))
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

      const { place, location, region } = result;

      // Get place images
      const images = await this.db
        .select()
        .from(PlaceImage)
        .where(eq(PlaceImage.placeId, place.id));

      // Build breadcrumbs from location path + place
      const pathSegments = validatedLocationPath.split("/");
      const ancestorPaths = pathSegments.map((_, index) =>
        pathSegments.slice(0, index + 1).join("/"),
      );

      const locationBreadcrumbs = await this.db
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
        isSaved = await this.collectionService.isPlaceSaved(place.id, userId);
      }

      // Review Stats
      const stats = await this.db
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
        try {
          const AIdesc = await getPlaceDescription(
            this.env,
            place.name,
            place.address || "",
            location.path,
          );

          await this.db
            .update(Place)
            .set({
              description: AIdesc,
            })
            .where(eq(Place.id, place.id));
        } catch (error) {
          console.error("Error generating place description:", error);
        }
      }

      const memberFavourite = isMemberFavourite(
        Number(place.rating),
        place.reviewsCount || 0,
      );

      return {
        ...place,
        location,
        region,
        images,
        reviewStats: {
          totalReviews,
          averageRating: Number(averageRating.toFixed(1)),
          reviewBreakdown: reviewBreakdown.map((data) => ({
            ...data,
            percentage: Number(((data.count / totalReviews) * 100).toFixed(1)),
          })),
        },
        breadcrumbs,
        isSaved,
        memberFavourite,
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

  async fetchAndStoreGoogleImages(
    placeId: string,
    placeName: string,
    countryCode: string,
  ): Promise<void> {
    const existing = await this.db
      .select({ id: PlaceImage.id })
      .from(PlaceImage)
      .where(eq(PlaceImage.placeId, placeId))
      .limit(1);

    if (existing.length > 0) return;

    try {
      const placesData = await Google.searchPlaces(
        this.env,
        placeName,
        countryCode,
      );

      if (placesData.length === 0) {
        console.log(`[Google Images] No results for "${placeName}"`);
        return;
      }

      const imageUrls = await Google.getPlacePhotos(
        this.env,
        placesData[0].place_id,
      );

      if (!imageUrls || imageUrls.length === 0) {
        console.log(`[Google Images] No photos for "${placeName}"`);
        return;
      }

      const uploadedImages =
        await this.imageUploadService.uploadMultipleImagesFromUrls(
          imageUrls.slice(0, 10),
          {
            imageType: "place_gallery",
            metadata: {
              source: "google_places",
              placeId,
              googlePlaceId: placesData[0].place_id,
            },
          },
        );

      if (uploadedImages.length > 0) {
        await this.db.insert(PlaceImage).values(
          uploadedImages.map((img, index) => ({
            placeId,
            imageId: img.id,
            isPrimary: index === 0,
            displayOrder: index,
          })),
        );
        console.log(
          `[Google Images] Stored ${uploadedImages.length} images for "${placeName}"`,
        );
      }
    } catch (error) {
      console.error(`[Google Images] Error for "${placeName}":`, error);
    }
  }

  async getPlaceReviews(
    placeId: string,
    page: number,
    limit: number,
    userId?: string,
  ) {
    try {
      const reviews = await this.db.query.Review.findMany({
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

  async getNearbyPlaces(
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
      const places = await this.db.query.Place.findMany({
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
        savedPlaceIds = await this.collectionService.getSavedPlaceIds(
          placesWithDistance.map((place) => place.id),
          userId,
        );
      }

      return {
        places: placesWithDistance.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
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

  async explorePlaces(
    filters: {
      swLat: number;
      swLng: number;
      neLat: number;
      neLng: number;
      types?: string[];
      rating?: number;
      distance?: number;
      minLength?: number;
      maxLength?: number;
      difficulty?: "beginner" | "intermediate" | "advanced";
    },
    userId?: string,
  ) {
    try {
      const conditions = [
        between(
          sql`CAST(${Place.latitude} AS DECIMAL)`,
          filters.swLat.toString(),
          filters.neLat.toString(),
        ),
        between(
          sql`CAST(${Place.longitude} AS DECIMAL)`,
          filters.swLng.toString(),
          filters.neLng.toString(),
        ),
      ];

      if (filters.types && filters.types.length > 0) {
        conditions.push(
          sql`${Place.types} && ARRAY[${sql.join(
            filters.types.map((t) => sql`${t}`),
            sql`, `,
          )}]::place_type[]`,
        );
      }

      if (filters.rating) {
        conditions.push(
          sql`CAST(${Place.rating} AS DECIMAL) >= ${filters.rating}`,
        );
      }

      if (filters.minLength !== undefined) {
        conditions.push(sql`${Place.distanceKm} >= ${filters.minLength}`);
      }

      if (filters.maxLength !== undefined) {
        conditions.push(sql`${Place.distanceKm} <= ${filters.maxLength}`);
      }

      if (filters.difficulty) {
        conditions.push(eq(Place.difficulty, filters.difficulty));
      }

      if (filters.distance !== undefined) {
        const centerLat = (filters.swLat + filters.neLat) / 2;
        const centerLng = (filters.swLng + filters.neLng) / 2;
        // Haversine distance in km
        conditions.push(
          sql`(6371 * acos(
            cos(radians(${centerLat})) *
            cos(radians(CAST(${Place.latitude} AS DECIMAL))) *
            cos(radians(CAST(${Place.longitude} AS DECIMAL)) - radians(${centerLng})) +
            sin(radians(${centerLat})) *
            sin(radians(CAST(${Place.latitude} AS DECIMAL)))
          )) <= ${filters.distance}`,
        );
      }

      const places = await this.db.query.Place.findMany({
        where: and(...conditions),
        with: {
          location: { with: { parent: true } },
          images: { limit: 1, where: eq(PlaceImage.isPrimary, true) },
        },
        orderBy: desc(Place.rating),
        limit: 500,
      });

      let savedPlaceIds = new Set<string>();
      if (userId) {
        savedPlaceIds = await this.collectionService.getSavedPlaceIds(
          places.map((p) => p.id),
          userId,
        );
      }

      const mapped = places.map((place) => ({
        id: place.id,
        name: place.name,
        slug: place.slug,
        types: place.types,
        rating: place.rating,
        reviewsCount: place.reviewsCount,
        lat: place.latitude ? parseFloat(place.latitude) : null,
        lng: place.longitude ? parseFloat(place.longitude) : null,
        imageId: place.images[0]?.imageId ?? null,
        locationPath: place.location.path,
        cityName: place.location.name,
        regionName: place.location.parent?.name ?? "",
        countryCode: place.location.countryCode,
        dogAmenities: place.dogAmenities ?? [],
        isSaved: savedPlaceIds.has(place.id),
        isVerified: place.isVerified,
        memberFavourite: isMemberFavourite(
          Number(place.rating),
          place.reviewsCount || 0,
        ),
      }));

      return { places: mapped, total: mapped.length };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to explore places", {
        originalError: error,
      });
    }
  }

  getTypes() {
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

  async getTrendingPlaces(limit: number = 6, userId?: string) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const checkInCounts = await this.db
        .select({
          placeId: CheckIn.placeId,
          checkInCount: count(),
        })
        .from(CheckIn)
        .where(sql`${CheckIn.date} >= ${oneWeekAgo.toISOString()}`)
        .groupBy(CheckIn.placeId)
        .orderBy(desc(count()))
        .limit(limit);

      if (checkInCounts.length === 0) {
        return [];
      }

      const placeIds = checkInCounts.map((r) => r.placeId);

      const places = await this.db.query.Place.findMany({
        where: inArray(Place.id, placeIds),
        with: {
          location: {
            with: {
              parent: {
                columns: { name: true },
              },
            },
          },
          images: {
            limit: 1,
            where: eq(PlaceImage.isPrimary, true),
          },
        },
      });

      const countMap = new Map(
        checkInCounts.map((r) => [r.placeId, r.checkInCount]),
      );

      let savedPlaceIds = new Set<string>();
      if (userId) {
        savedPlaceIds = await this.collectionService.getSavedPlaceIds(
          placeIds,
          userId,
        );
      }

      return places
        .map((place) => ({
          ...place,
          checkInCount: countMap.get(place.id) ?? 0,
          isSaved: savedPlaceIds.has(place.id),
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
        }))
        .sort((a, b) => b.checkInCount - a.checkInCount);
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get trending places error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get trending places", {
        originalError: error,
      });
    }
  }

  async getCommunityStats() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const [totalReviews, checkInsThisWeek, placesSaved] = await Promise.all([
        this.db
          .select({ value: count() })
          .from(Review)
          .where(sql`${Review.createdAt} >= ${oneWeekAgo.toISOString()}`),
        this.db
          .select({ value: count() })
          .from(CheckIn)
          .where(sql`${CheckIn.date} >= ${oneWeekAgo.toISOString()}`),
        this.db
          .select({ value: count() })
          .from(CollectionItem)
          .where(
            sql`${CollectionItem.createdAt} >= ${oneWeekAgo.toISOString()}`,
          ),
      ]);

      return {
        totalReviews: totalReviews[0]?.value ?? 0,
        checkIns: checkInsThisWeek[0]?.value ?? 0,
        placesSaved: placesSaved[0]?.value ?? 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get community stats error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get community stats", {
        originalError: error,
      });
    }
  }

  async getSimilarPlaces(placeId: string, limit: number = 6, userId?: string) {
    try {
      const sourcePlace = await this.db.query.Place.findFirst({
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

      const candidates = await this.db.query.Place.findMany({
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
        savedPlaceIds = await this.collectionService.getSavedPlaceIds(
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
        memberFavourite: isMemberFavourite(
          Number(place.rating),
          place.reviewsCount || 0,
        ),
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
