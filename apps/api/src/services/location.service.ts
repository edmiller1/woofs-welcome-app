import { and, asc, count, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { locationPathSchema } from "../routes/location/schemas";
import {
  Collection,
  CollectionItem,
  Location,
  Place,
  PlaceImage,
} from "../db/schema";
import {
  getPlacesByPlaceSort,
  validatePlaceFilter,
} from "../lib/helpers/location";
import type { PlaceFilter } from "@woofs/types";

const CityLocation = alias(Location, "city");
const RegionLocation = alias(Location, "region");

/**
 * Location Service
 *
 * Handles all location-related business logic
 */
export class LocationService {
  /**
   * Get location
   */
  static async getLocation(path: string, userId?: string) {
    try {
      const validatedPath = locationPathSchema.parse(path);

      const location = await db.query.Location.findFirst({
        where: eq(Location.path, validatedPath),
        with: {
          parent: true,
          children: true,
        },
      });

      if (!location) {
        throw new NotFoundError("Location not found");
      }

      // Build breadcrumbs from path segments
      // e.g., "new-zealand/south-island/canterbury" -> ["new-zealand", "new-zealand/south-island", "new-zealand/south-island/canterbury"]
      const pathSegments = validatedPath.split("/");
      const ancestorPaths = pathSegments.map((_, index) =>
        pathSegments.slice(0, index + 1).join("/"),
      );

      const breadcrumbs = await db
        .select({
          name: Location.name,
          slug: Location.slug,
          path: Location.path,
          level: Location.level,
        })
        .from(Location)
        .where(inArray(Location.path, ancestorPaths))
        .orderBy(asc(Location.level));

      const stats = await db
        .select({
          totalPlaces: count(),
          totalAdventures: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hike', 'Walk', 'Trail']::text[] THEN 1 ELSE 0 END`,
          ).mapWith(Number),
          totalEats: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Restaurant', 'Bar', 'Café']::text[] THEN 1 ELSE 0 END`,
          ).mapWith(Number),
          totalStays: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hotel', 'Motel', 'AirBnb']::text[] THEN 1 ELSE 0 END`,
          ).mapWith(Number),
          totalStores: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Retail']::text[] THEN 1 ELSE 0 END`,
          ).mapWith(Number),
        })
        .from(Place)
        .innerJoin(Location, eq(Place.locationId, Location.id))
        .where(sql`${Location.path} LIKE ${validatedPath + "%"}`);

      const popularPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          imageId: PlaceImage.imageId,
          cityName: CityLocation.name,
          regionName: RegionLocation.name,
          locationPath: CityLocation.path,
        })
        .from(Place)
        .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
        .leftJoin(RegionLocation, eq(CityLocation.parentId, RegionLocation.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true)),
        )
        .where(
          and(
            gte(Place.rating, "4.0"),
            sql`${CityLocation.path} LIKE ${validatedPath + "%"}`,
          ),
        )
        .orderBy(desc(Place.rating))
        .limit(6);

      // Check which places are in user's collections
      let savedPlaceIds: Set<string> = new Set();
      if (userId && popularPlaces.length > 0) {
        const placeIds = popularPlaces.map((p) => p.id);
        const savedItems = await db
          .select({ placeId: CollectionItem.placeId })
          .from(CollectionItem)
          .innerJoin(Collection, eq(CollectionItem.collectionId, Collection.id))
          .where(
            and(
              eq(Collection.userId, userId),
              inArray(CollectionItem.placeId, placeIds),
            ),
          );
        savedPlaceIds = new Set(savedItems.map((item) => item.placeId));
      }

      return {
        ...location,
        breadcrumbs,
        stats: stats[0] || {
          totalPlaces: 0,
          totalAdventures: 0,
          totalEats: 0,
          totalStays: 0,
          totalStores: 0,
        },
        popularPlaces: popularPlaces.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
        })),
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get location error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get location", {
        originalError: error,
      });
    }
  }

  static async getLocationPlaces(
    path: string,
    filters: {
      placeSort?: PlaceFilter;
    },
    userId?: string,
  ) {
    try {
      const validatedPath = locationPathSchema.parse(path);
      console.log("Looking for location with path:", validatedPath);

      const location = await db.query.Location.findFirst({
        where: eq(Location.path, validatedPath),
        with: {
          parent: true,
          children: true,
        },
      });

      console.log("Found location:", location?.name ?? "null");

      if (!location) {
        throw new NotFoundError(`Location not found: ${validatedPath}`);
      }

      const placeFilterType = validatePlaceFilter(filters.placeSort);

      const places = await getPlacesByPlaceSort(path, placeFilterType);

      let savedPlaceIds: Set<string> = new Set();
      if (userId && places.length > 0) {
        const placeIds = places.map((p) => p.id);
        const savedItems = await db
          .select({ placeId: CollectionItem.placeId })
          .from(CollectionItem)
          .innerJoin(Collection, eq(CollectionItem.collectionId, Collection.id))
          .where(
            and(
              eq(Collection.userId, userId),
              inArray(CollectionItem.placeId, placeIds),
            ),
          );
        savedPlaceIds = new Set(savedItems.map((item) => item.placeId));
      }

      return {
        places: places.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
        })),
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get location places error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get location places", {
        originalError: error,
      });
    }
  }
}
