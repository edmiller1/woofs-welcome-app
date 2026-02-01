import type { PlaceFilter } from "@woofs/types";
import { db } from "../../db";
import { Location, Place, PlaceImage } from "../../db/schema";
import { alias } from "drizzle-orm/pg-core";
import { and, desc, eq, gte, or, sql } from "drizzle-orm";

const CityLocation = alias(Location, "city");
const RegionLocation = alias(Location, "region");

export const validatePlaceFilter = (filter?: PlaceFilter) => {
  const validFilters = ["popular", "new", "verified", "surprise"] as const;
  if (filter && validFilters.includes(filter as PlaceFilter)) {
    return filter as PlaceFilter;
  }
  return "popular"; // default
};

export const getPlacesByPlaceSort = async (
  path: string,
  placeSort: PlaceFilter,
) => {
  let filteredPlaces;

  switch (placeSort) {
    case "popular":
      filteredPlaces = await db
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
            sql`${CityLocation.path} LIKE ${path + "%"}`,
          ),
        )
        .orderBy(desc(Place.rating))
        .limit(20);
      break;

    case "new":
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      filteredPlaces = await db
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
            sql`${CityLocation.path} LIKE ${path + "%"}`,
            or(
              gte(Place.createdAt, twoMonthsAgo),
              gte(Place.updatedAt, twoMonthsAgo),
            ),
          ),
        )
        .orderBy(desc(Place.createdAt), desc(Place.updatedAt))
        .limit(20);
      break;
    case "verified":
      filteredPlaces = await db
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
            eq(Place.isVerified, true),
            sql`${CityLocation.path} LIKE ${path + "%"}`,
          ),
        )
        .orderBy(desc(Place.updatedAt))
        .limit(20);
      break;
    case "surprise":
      filteredPlaces = await db
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
        .where(sql`${CityLocation.path} LIKE ${path + "%"}`)
        .orderBy(sql`RANDOM()`)
        .limit(20);
      break;
    default:
      filteredPlaces = await db
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
            sql`${CityLocation.path} LIKE ${path + "%"}`,
          ),
        )
        .orderBy(desc(Place.rating))
        .limit(20);
  }

  return filteredPlaces;
};
