import {
  and,
  asc,
  arrayOverlaps,
  count,
  desc,
  eq,
  gte,
  inArray,
  sql,
  sum,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { locationPathSchema } from "../routes/location/schemas";
import {
  Collection,
  CollectionItem,
  Dog,
  Image,
  Location,
  Place,
  PlaceImage,
  Review,
  ReviewDog,
  ReviewImage,
  user,
} from "../db/schema";
import {
  getPlacesByPlaceSort,
  validatePlaceFilter,
} from "../lib/helpers/location";
import type { PlaceFilter } from "@woofs/types";
import type { Db } from "../db";
import type { ImageUploadService } from "./image-upload.service";
import { isMemberFavourite } from "../lib/helpers/place";

const CityLocation = alias(Location, "city");
const RegionLocation = alias(Location, "region");

/**
 * Location Service
 *
 * Handles all location-related business logic
 */
export class LocationService {
  constructor(
    private db: Db,
    private imageUploadService: ImageUploadService,
  ) {}
  /**
   * Get location
   */
  async getLocation(path: string, userId?: string) {
    try {
      const validatedPath = locationPathSchema.parse(path);

      const location = await this.db.query.Location.findFirst({
        where: eq(Location.path, validatedPath),
        with: {
          parent: true,
          children: true,
        },
      });

      if (!location) {
        throw new NotFoundError("Location not found");
      }

      // Resolve cfImageId for the location's hero image
      let cfImageId: string | null = null;
      if (location.image) {
        const imageRow = await this.db.query.Image.findFirst({
          where: eq(Image.id, location.image),
          columns: { cfImageId: true },
        });
        cfImageId = imageRow?.cfImageId ?? null;
      }

      // Build breadcrumbs from path segments
      // e.g., "new-zealand/south-island/canterbury" -> ["new-zealand", "new-zealand/south-island", "new-zealand/south-island/canterbury"]
      const pathSegments = validatedPath.split("/");
      const ancestorPaths = pathSegments.map((_, index) =>
        pathSegments.slice(0, index + 1).join("/"),
      );

      const breadcrumbs = await this.db
        .select({
          name: Location.name,
          slug: Location.slug,
          path: Location.path,
          level: Location.level,
        })
        .from(Location)
        .where(inArray(Location.path, ancestorPaths))
        .orderBy(asc(Location.level));

      const stats = await this.db
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
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Store']::text[] THEN 1 ELSE 0 END`,
          ).mapWith(Number),
        })
        .from(Place)
        .innerJoin(Location, eq(Place.locationId, Location.id))
        .where(sql`${Location.path} LIKE ${validatedPath + "%"}`);

      const [popularPlaces, stays, eats, adventures] = await Promise.all([
        //popular places
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            types: Place.types,
            description: Place.description,
            rating: Place.rating,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            countryCode: Place.countryCode,
            imageId: PlaceImage.imageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
            lat: Place.latitude,
            lng: Place.longitude,
            dogAmenities: Place.dogAmenities,
          })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .leftJoin(
            PlaceImage,
            and(
              eq(PlaceImage.placeId, Place.id),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .where(
            and(
              gte(Place.rating, "4.0"),
              sql`${CityLocation.path} LIKE ${validatedPath + "%"}`,
            ),
          )
          .orderBy(
            desc(sql`cast(${Place.rating} as decimal) * ${Place.reviewsCount}`),
          )
          .limit(9),
        //stays
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            types: Place.types,
            description: Place.description,
            rating: Place.rating,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            countryCode: Place.countryCode,
            imageId: PlaceImage.imageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
            lat: Place.latitude,
            lng: Place.longitude,
            dogAmenities: Place.dogAmenities,
          })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .leftJoin(
            PlaceImage,
            and(
              eq(PlaceImage.placeId, Place.id),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .where(
            and(
              arrayOverlaps(Place.types, [
                "Hotel",
                "Motel",
                "Accomodation",
                "AirBnb",
              ]),
              sql`${CityLocation.path} LIKE ${validatedPath + "%"}`,
            ),
          )
          .orderBy(desc(Place.rating))
          .limit(6),
        //eats
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            types: Place.types,
            description: Place.description,
            rating: Place.rating,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            countryCode: Place.countryCode,
            imageId: PlaceImage.imageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
            lat: Place.latitude,
            lng: Place.longitude,
            dogAmenities: Place.dogAmenities,
          })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .leftJoin(
            PlaceImage,
            and(
              eq(PlaceImage.placeId, Place.id),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .where(
            and(
              arrayOverlaps(Place.types, [
                "Bar",
                "Restaurant",
                "Café",
                "Winery",
              ]),
              sql`${CityLocation.path} LIKE ${validatedPath + "%"}`,
            ),
          )
          .orderBy(desc(Place.rating))
          .limit(6),
        //adventures
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            types: Place.types,
            description: Place.description,
            rating: Place.rating,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            countryCode: Place.countryCode,
            imageId: PlaceImage.imageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
            lat: Place.latitude,
            lng: Place.longitude,
            dogAmenities: Place.dogAmenities,
          })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .leftJoin(
            PlaceImage,
            and(
              eq(PlaceImage.placeId, Place.id),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .where(
            and(
              arrayOverlaps(Place.types, [
                "Park",
                "Dog Park",
                "Beach",
                "Walk",
                "Hike",
                "Lake",
                "River",
                "Trail",
                "Activity",
              ]),
              sql`${CityLocation.path} LIKE ${validatedPath + "%"}`,
            ),
          )
          .orderBy(desc(Place.rating))
          .limit(6),
      ]);

      const allPlaces = [...popularPlaces, ...stays];
      const savedPlaceIds = await this.getSavedPlaceIds(
        userId,
        allPlaces.map((p) => p.id),
      );

      return {
        ...location,
        image: cfImageId,
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
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
        })),
        stays: stays.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
        })),
        eats: eats.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
        })),
        adventures: adventures.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
          memberFavourite: isMemberFavourite(
            Number(place.rating),
            place.reviewsCount || 0,
          ),
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

  async getExplorePlaces(
    path: string,
    filters: {
      types?: string[];
      page?: number;
      bbox?: { swLat: number; swLng: number; neLat: number; neLng: number };
    },
    userId?: string,
  ) {
    try {
      const pageSize = 50;
      const page = Math.max(1, filters.page ?? 1);
      const offset = (page - 1) * pageSize;

      const CityLocation = alias(Location, "city");
      const RegionLocation = alias(Location, "region");

      const typeFilter =
        filters.types && filters.types.length > 0
          ? arrayOverlaps(
              Place.types,
              filters.types as (typeof Place.types.enumValues)[number][],
            )
          : undefined;

      const locationFilter = filters.bbox
        ? sql`${Place.latitude}::numeric BETWEEN ${filters.bbox.swLat} AND ${filters.bbox.neLat}
            AND ${Place.longitude}::numeric BETWEEN ${filters.bbox.swLng} AND ${filters.bbox.neLng}`
        : sql`${CityLocation.path} LIKE ${locationPathSchema.parse(path) + "%"}`;

      const whereClause = and(typeFilter, locationFilter);

      const [places, totalResult] = await Promise.all([
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            types: Place.types,
            description: Place.description,
            rating: Place.rating,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            countryCode: Place.countryCode,
            imageId: PlaceImage.imageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
            lat: Place.latitude,
            lng: Place.longitude,
          })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .leftJoin(
            PlaceImage,
            and(
              eq(PlaceImage.placeId, Place.id),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .where(whereClause)
          .orderBy(desc(Place.rating))
          .limit(pageSize)
          .offset(offset),
        this.db
          .select({ total: count() })
          .from(Place)
          .innerJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .where(whereClause),
      ]);

      const savedPlaceIds = await this.getSavedPlaceIds(
        userId,
        places.map((p) => p.id),
      );

      return {
        places: places.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id),
        })),
        total: totalResult[0]?.total ?? 0,
        page,
        pageSize,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to get explore places", {
        originalError: error,
      });
    }
  }

  private async getSavedPlaceIds(
    userId: string | undefined,
    placeIds: string[],
  ): Promise<Set<string>> {
    if (!userId || placeIds.length === 0) return new Set();
    const savedItems = await this.db
      .select({ placeId: CollectionItem.placeId })
      .from(CollectionItem)
      .innerJoin(Collection, eq(CollectionItem.collectionId, Collection.id))
      .where(
        and(
          eq(Collection.userId, userId),
          inArray(CollectionItem.placeId, placeIds),
        ),
      );
    return new Set(savedItems.map((item) => item.placeId));
  }

  async getChildLocations(path: string) {
    const ChildLoc = alias(Location, "child_loc");
    const PlaceLoc = alias(Location, "place_loc");

    const rows = await this.db
      .select({
        id: ChildLoc.id,
        name: ChildLoc.name,
        slug: ChildLoc.slug,
        path: ChildLoc.path,
        type: ChildLoc.type,
        imageRowId: ChildLoc.image,
        placeCount: count(Place.id),
      })
      .from(ChildLoc)
      .innerJoin(Location, eq(ChildLoc.parentId, Location.id))
      .leftJoin(PlaceLoc, sql`${PlaceLoc.path} LIKE ${ChildLoc.path} || '%'`)
      .leftJoin(Place, eq(Place.locationId, PlaceLoc.id))
      .where(eq(Location.path, path))
      .groupBy(
        ChildLoc.id,
        ChildLoc.name,
        ChildLoc.slug,
        ChildLoc.path,
        ChildLoc.type,
        ChildLoc.image,
      )
      .orderBy(desc(count(Place.id)))
      .limit(20);

    // Resolve cfImageIds in one query
    const imageRowIds = rows
      .map((r) => r.imageRowId)
      .filter((id): id is string => id !== null);

    const imageMap = new Map<string, string>();
    if (imageRowIds.length > 0) {
      const images = await this.db
        .select({ id: Image.id, cfImageId: Image.cfImageId })
        .from(Image)
        .where(inArray(Image.id, imageRowIds));
      for (const img of images) imageMap.set(img.id, img.cfImageId);
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      path: r.path,
      type: r.type,
      image: r.imageRowId ? (imageMap.get(r.imageRowId) ?? null) : null,
      placeCount: r.placeCount,
    }));
  }

  async getNearbyLocations(path: string) {
    const CurrentLoc = alias(Location, "current_loc");
    const SiblingLoc = alias(Location, "sibling_loc");
    const PlaceLoc = alias(Location, "place_loc");

    // Find the current location's parentId, then get siblings
    const current = await this.db
      .select({ parentId: CurrentLoc.parentId })
      .from(CurrentLoc)
      .where(eq(CurrentLoc.path, path))
      .limit(1);

    if (!current[0]?.parentId) return [];

    const rows = await this.db
      .select({
        id: SiblingLoc.id,
        name: SiblingLoc.name,
        slug: SiblingLoc.slug,
        path: SiblingLoc.path,
        type: SiblingLoc.type,
        imageRowId: SiblingLoc.image,
        placeCount: count(Place.id),
      })
      .from(SiblingLoc)
      .leftJoin(PlaceLoc, sql`${PlaceLoc.path} LIKE ${SiblingLoc.path} || '%'`)
      .leftJoin(Place, eq(Place.locationId, PlaceLoc.id))
      .where(
        and(
          eq(SiblingLoc.parentId, current[0].parentId),
          sql`${SiblingLoc.path} != ${path}`,
        ),
      )
      .groupBy(
        SiblingLoc.id,
        SiblingLoc.name,
        SiblingLoc.slug,
        SiblingLoc.path,
        SiblingLoc.type,
        SiblingLoc.image,
      )
      .orderBy(desc(count(Place.id)))
      .limit(20);

    const imageRowIds = rows
      .map((r) => r.imageRowId)
      .filter((id): id is string => id !== null);

    const imageMap = new Map<string, string>();
    if (imageRowIds.length > 0) {
      const images = await this.db
        .select({ id: Image.id, cfImageId: Image.cfImageId })
        .from(Image)
        .where(inArray(Image.id, imageRowIds));
      for (const img of images) imageMap.set(img.id, img.cfImageId);
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      path: r.path,
      type: r.type,
      image: r.imageRowId ? (imageMap.get(r.imageRowId) ?? null) : null,
      placeCount: r.placeCount,
    }));
  }

  async getLocationPhotos(path: string, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    const PlaceLoc = alias(Location, "place_loc");

    const [photos, totalResult] = await Promise.all([
      this.db
        .select({
          cfImageId: Image.cfImageId,
          placeName: Place.name,
          placeSlug: Place.slug,
          locationPath: PlaceLoc.path,
          reviewerName: user.name,
          reviewId: Review.id,
        })
        .from(ReviewImage)
        .innerJoin(Image, eq(ReviewImage.imageId, Image.id))
        .innerJoin(Review, eq(ReviewImage.reviewId, Review.id))
        .innerJoin(user, eq(Review.userId, user.id))
        .innerJoin(Place, eq(Review.placeId, Place.id))
        .innerJoin(PlaceLoc, eq(Place.locationId, PlaceLoc.id))
        .where(sql`${PlaceLoc.path} LIKE ${path + "%"}`)
        .orderBy(desc(ReviewImage.createdAt))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ total: count() })
        .from(ReviewImage)
        .innerJoin(Review, eq(ReviewImage.reviewId, Review.id))
        .innerJoin(Place, eq(Review.placeId, Place.id))
        .innerJoin(PlaceLoc, eq(Place.locationId, PlaceLoc.id))
        .where(sql`${PlaceLoc.path} LIKE ${path + "%"}`),
    ]);

    // Fetch dogs for each review in one query
    const reviewIds = [...new Set(photos.map((p) => p.reviewId))];
    const dogRows =
      reviewIds.length > 0
        ? await this.db
            .select({
              reviewId: ReviewDog.reviewId,
              dogName: Dog.name,
              dogBreed: Dog.breed,
            })
            .from(ReviewDog)
            .innerJoin(Dog, eq(ReviewDog.dogId, Dog.id))
            .where(inArray(ReviewDog.reviewId, reviewIds))
        : [];

    const dogsByReview = new Map<string, { name: string; breed: string }[]>();
    for (const d of dogRows) {
      const existing = dogsByReview.get(d.reviewId) ?? [];
      existing.push({ name: d.dogName, breed: d.dogBreed });
      dogsByReview.set(d.reviewId, existing);
    }

    return {
      photos: photos.map((p) => ({
        cfImageId: p.cfImageId,
        placeName: p.placeName,
        placeSlug: p.placeSlug,
        locationPath: p.locationPath,
        reviewerName: p.reviewerName,
        dogs: dogsByReview.get(p.reviewId) ?? [],
      })),
      total: totalResult[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getLocationPlaces(
    path: string,
    filters: {
      placeSort?: PlaceFilter;
    },
    userId?: string,
  ) {
    try {
      const validatedPath = locationPathSchema.parse(path);
      console.log("Looking for location with path:", validatedPath);

      const location = await this.db.query.Location.findFirst({
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

      const places = await getPlacesByPlaceSort(this.db, path, placeFilterType);

      const savedPlaceIds = await this.getSavedPlaceIds(
        userId,
        places.map((p) => p.id),
      );

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

  async getFeaturedLocations(limit: number = 8) {
    try {
      const placeCountSq = this.db
        .select({
          locationId: Place.locationId,
          placeCount: count().as("place_count"),
        })
        .from(Place)
        .groupBy(Place.locationId)
        .as("place_counts");

      const locations = await this.db
        .select({
          id: Location.id,
          name: Location.name,
          path: Location.path,
          type: Location.type,
          level: Location.level,
          image: Location.image,
          isPopular: Location.isPopular,
          totalReviews: Location.totalReviews,
          averageRating: Location.averageRating,
          placeCount: sql<number>`coalesce(${placeCountSq.placeCount}, 0)`,
        })
        .from(Location)
        .leftJoin(placeCountSq, eq(Location.id, placeCountSq.locationId))
        .where(
          and(
            sql`${Location.level} in (2, 3)`,
            sql`coalesce(${placeCountSq.placeCount}, 0) > 0`,
          ),
        )
        .orderBy(
          desc(Location.isPopular),
          desc(
            sql`coalesce(${placeCountSq.placeCount}, 0) * cast(${Location.averageRating} as decimal)`,
          ),
        )
        .limit(limit);

      return locations;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to get featured locations", {
        originalError: error,
      });
    }
  }

  async getDirectory(opts: {
    type: "country" | "island" | "region" | "city";
    letter?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { type, letter, page = 1, limit = 100 } = opts;
      const offset = (page - 1) * limit;

      const conditions = [eq(Location.type, type)];
      if (letter) {
        conditions.push(sql`lower(${Location.name}) like ${letter.toLowerCase() + "%"}`);
      }

      const [rows, countRows] = await Promise.all([
        this.db
          .select({ name: Location.name, path: Location.path, countryCode: Location.countryCode })
          .from(Location)
          .where(and(...conditions))
          .orderBy(asc(sql`lower(${Location.name})`))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ total: count() })
          .from(Location)
          .where(and(...conditions)),
      ]);

      return { locations: rows, total: countRows[0]?.total ?? 0, page, limit };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to get directory", { originalError: error });
    }
  }
}
