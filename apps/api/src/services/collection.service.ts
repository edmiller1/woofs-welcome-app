import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import {
  Collection,
  CollectionItem,
  Image,
  Location,
  Place,
  PlaceImage,
  user,
} from "../db/schema";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";
import type { Db } from "../db";
import type { ImageUploadService } from "./image-upload.service";
import { alias } from "drizzle-orm/pg-core";

const CityLocation = alias(Location, "city");
const RegionLocation = alias(Location, "region");

/**
 * Collection Service
 *
 * Handles all collection-related business logic
 */
export class CollectionService {
  constructor(
    private db: Db,
    private imageUploadService: ImageUploadService,
  ) {}

  async getCollections(userId: string) {
    try {
      const collections = await this.db.query.Collection.findMany({
        where: eq(Collection.userId, userId),
        with: {
          items: true,
        },
      });

      return collections;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get collections error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get collections", {
        originalError: error,
      });
    }
  }

  async createCollection(userId: string, name: string, description?: string) {
    try {
      const sanitizedName = sanitizePlainText(name);

      if (!sanitizedName || sanitizedName.length < 2) {
        throw new BadRequestError("Name must be at least 2 characters");
      }

      let sanitizedDescription: string | undefined;
      if (description) {
        sanitizedDescription = sanitizePlainText(description);
        if (sanitizedDescription.length < 2) {
          throw new BadRequestError(
            "Description must be at least 2 characters",
          );
        }
      }

      const newCollection = await this.db
        .insert(Collection)
        .values({
          name: sanitizedName,
          description: sanitizedDescription,
          userId,
          itemCount: 0,
          emoji: "",
          color: "",
          isPublic: false,
        })
        .returning();

      if (!newCollection[0]) {
        throw new DatabaseError("Failed to create collection");
      }

      return {
        collectionId: newCollection[0].id,
        isSuccess: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Create collection error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to create collection", {
        originalError: error,
      });
    }
  }

  async savePlaceToCollection(
    placeId: string,
    userId: string,
    collectionId?: string,
  ) {
    try {
      // Verify place exists
      const [place] = await this.db
        .select({ id: Place.id })
        .from(Place)
        .where(eq(Place.id, placeId))
        .limit(1);

      if (!place) {
        throw new NotFoundError("Place not found");
      }

      let targetCollectionId: string;

      if (!collectionId) {
        // Create a default collection for the user
        const newCollection = await this.createCollection(
          userId,
          "Saved Places",
        );
        targetCollectionId = newCollection.collectionId;
      } else {
        // Verify collection exists and belongs to user
        const [collection] = await this.db
          .select({ id: Collection.id })
          .from(Collection)
          .where(
            and(eq(Collection.id, collectionId), eq(Collection.userId, userId)),
          )
          .limit(1);

        if (!collection) {
          throw new NotFoundError("Collection not found");
        }

        targetCollectionId = collectionId;
      }

      // Check if place is already in collection
      const [existingItem] = await this.db
        .select({ id: CollectionItem.id })
        .from(CollectionItem)
        .where(
          and(
            eq(CollectionItem.collectionId, targetCollectionId),
            eq(CollectionItem.placeId, placeId),
          ),
        )
        .limit(1);

      if (existingItem) {
        throw new BadRequestError("Place is already in this collection");
      }

      // Add place to collection
      await this.db.insert(CollectionItem).values({
        collectionId: targetCollectionId,
        placeId,
      });

      // Update item count
      const [countResult] = await this.db
        .select({ itemCount: count() })
        .from(CollectionItem)
        .where(eq(CollectionItem.collectionId, targetCollectionId));

      await this.db
        .update(Collection)
        .set({ itemCount: countResult?.itemCount ?? 0 })
        .where(eq(Collection.id, targetCollectionId));

      return {
        collectionId: targetCollectionId,
        isSuccess: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Save place to collection error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to save place to collection", {
        originalError: error,
      });
    }
  }

  async removePlaceFromCollection(
    placeId: string,
    userId: string,
    collectionId: string,
  ) {
    try {
      // Verify collection exists and belongs to user
      const [collection] = await this.db
        .select({ id: Collection.id })
        .from(Collection)
        .where(
          and(eq(Collection.id, collectionId), eq(Collection.userId, userId)),
        )
        .limit(1);

      if (!collection) {
        throw new NotFoundError("Collection not found");
      }

      // Delete the collection item
      const deleted = await this.db
        .delete(CollectionItem)
        .where(
          and(
            eq(CollectionItem.collectionId, collectionId),
            eq(CollectionItem.placeId, placeId),
          ),
        )
        .returning();

      if (deleted.length === 0) {
        throw new NotFoundError("Place not found in collection");
      }

      // Update item count
      const [countResult] = await this.db
        .select({ itemCount: count() })
        .from(CollectionItem)
        .where(eq(CollectionItem.collectionId, collectionId));

      await this.db
        .update(Collection)
        .set({ itemCount: countResult?.itemCount ?? 0 })
        .where(eq(Collection.id, collectionId));

      return { isSuccess: true };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Remove place from collection error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to remove place from collection", {
        originalError: error,
      });
    }
  }

  async isPlaceSaved(placeId: string, userId: string) {
    try {
      const [saved] = await this.db
        .select({ id: CollectionItem.id })
        .from(CollectionItem)
        .innerJoin(Collection, eq(CollectionItem.collectionId, Collection.id))
        .where(
          and(
            eq(CollectionItem.placeId, placeId),
            eq(Collection.userId, userId),
          ),
        )
        .limit(1);

      return !!saved;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Check place saved error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to check if place is saved", {
        originalError: error,
      });
    }
  }

  async getSavedPlaceIds(placeIds: string[], userId: string) {
    try {
      if (placeIds.length === 0) return new Set<string>();

      const savedItems = await this.db
        .select({ placeId: CollectionItem.placeId })
        .from(CollectionItem)
        .innerJoin(Collection, eq(CollectionItem.collectionId, Collection.id))
        .where(
          and(
            inArray(CollectionItem.placeId, placeIds),
            eq(Collection.userId, userId),
          ),
        );

      return new Set(savedItems.map((item) => item.placeId));
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get saved place ids error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get saved place ids", {
        originalError: error,
      });
    }
  }

  async getPlaceCollections(placeId: string, userId: string) {
    try {
      // Get all user's collections with hasPlace flag
      const collections = await this.db
        .select({
          id: Collection.id,
          name: Collection.name,
          emoji: Collection.emoji,
          color: Collection.color,
          itemCount: Collection.itemCount,
          hasPlace: CollectionItem.id,
        })
        .from(Collection)
        .leftJoin(
          CollectionItem,
          and(
            eq(CollectionItem.collectionId, Collection.id),
            eq(CollectionItem.placeId, placeId),
          ),
        )
        .where(eq(Collection.userId, userId))
        .orderBy(asc(Collection.name));

      // Get preview images for each collection (first 4 places with images)
      const collectionsWithPreviews = await Promise.all(
        collections.map(async (c) => {
          const previewImages = await this.db
            .select({
              imageId: Image.cfImageId,
            })
            .from(CollectionItem)
            .innerJoin(Place, eq(CollectionItem.placeId, Place.id))
            .innerJoin(PlaceImage, eq(Place.id, PlaceImage.placeId))
            .innerJoin(Image, eq(PlaceImage.imageId, Image.id))
            .where(eq(CollectionItem.collectionId, c.id))
            .orderBy(asc(CollectionItem.createdAt))
            .limit(4);

          return {
            id: c.id,
            name: c.name,
            emoji: c.emoji,
            color: c.color,
            itemCount: c.itemCount,
            hasPlace: !!c.hasPlace,
            previewImages: previewImages.map((p) => p.imageId),
          };
        }),
      );

      return collectionsWithPreviews;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get place collections error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get place collections", {
        originalError: error,
      });
    }
  }

  async getProfileCollections(profileId: string, userId?: string) {
    try {
      const userRecord = await this.db.query.user.findFirst({
        where: eq(user.id, profileId),
        with: {
          userSettings: true,
        },
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const isOwner = userId === profileId;

      if (!isOwner && !userRecord.userSettings?.showCollections) {
        return { isPrivate: true, collections: [], isOwner: false };
      }

      const collections = await this.db.query.Collection.findMany({
        where: eq(Collection.userId, profileId),
        with: {
          items: true,
        },
      });

      const collectionsWithPreviews = await Promise.all(
        collections.map(async (c) => {
          const previewImages = await this.db
            .select({
              imageId: Image.cfImageId,
            })
            .from(CollectionItem)
            .innerJoin(Place, eq(CollectionItem.placeId, Place.id))
            .innerJoin(PlaceImage, eq(Place.id, PlaceImage.placeId))
            .innerJoin(Image, eq(PlaceImage.imageId, Image.id))
            .where(eq(CollectionItem.collectionId, c.id))
            .orderBy(asc(CollectionItem.createdAt))
            .limit(4);

          return {
            id: c.id,
            name: c.name,
            emoji: c.emoji,
            color: c.color,
            itemCount: c.itemCount,
            description: c.description,
            isPublic: c.isPublic,
            previewImages: previewImages.map((p) => p.imageId),
          };
        }),
      );

      if (userId && userId === profileId) {
        return {
          isPrivate: false,
          collections: collectionsWithPreviews,
          isOwner: true,
        };
      }

      return {
        isPrivate: false,
        collections: collectionsWithPreviews.filter((c) => c.isPublic),
        isOwner: userId === profileId,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get profile collections error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get profile collections", {
        originalError: error,
      });
    }
  }

  async getCollectionWithPlaces(
    collectionId: string,
    profileId: string,
    userId?: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    try {
      const collection = await this.db.query.Collection.findFirst({
        where: and(
          eq(Collection.id, collectionId),
          eq(Collection.userId, profileId),
        ),
      });

      if (!collection) {
        throw new NotFoundError("Collection not found");
      }

      const offset = (page - 1) * limit;

      const searchCondition = search
        ? ilike(Place.name, `%${search}%`)
        : undefined;

      const whereCondition = searchCondition
        ? and(eq(CollectionItem.collectionId, collection.id), searchCondition)
        : eq(CollectionItem.collectionId, collection.id);

      const [totalResult, places] = await Promise.all([
        this.db
          .select({ total: count() })
          .from(CollectionItem)
          .leftJoin(Place, eq(CollectionItem.placeId, Place.id))
          .where(whereCondition),
        this.db
          .select({
            id: Place.id,
            name: Place.name,
            slug: Place.slug,
            rating: Place.rating,
            lat: Place.latitude,
            lng: Place.longitude,
            countryCode: Place.countryCode,
            reviewsCount: Place.reviewsCount,
            isVerified: Place.isVerified,
            createdAt: Place.createdAt,
            imageId: PlaceImage.imageId,
            types: Place.types,
            cfImageId: Image.cfImageId,
            cityName: CityLocation.name,
            regionName: RegionLocation.name,
            locationPath: CityLocation.path,
          })
          .from(CollectionItem)
          .leftJoin(Place, eq(CollectionItem.placeId, Place.id))
          .leftJoin(
            PlaceImage,
            and(
              eq(Place.id, PlaceImage.placeId),
              eq(PlaceImage.isPrimary, true),
            ),
          )
          .leftJoin(Image, eq(PlaceImage.imageId, Image.id))
          .leftJoin(CityLocation, eq(Place.locationId, CityLocation.id))
          .leftJoin(
            RegionLocation,
            eq(CityLocation.parentId, RegionLocation.id),
          )
          .where(whereCondition)
          .orderBy(desc(CollectionItem.createdAt))
          .limit(limit)
          .offset(offset),
      ]);

      const total = totalResult[0]?.total ?? 0;

      // Check which places are in user's collections
      let savedPlaceIds: Set<string> = new Set();
      if (userId && places.length > 0) {
        const placeIds = places.map((p) => p.id!);
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
        savedPlaceIds = new Set(savedItems.map((item) => item.placeId));
      }

      return {
        isPrivate: false,
        collection,
        places: places.map((place) => ({
          ...place,
          isSaved: savedPlaceIds.has(place.id!),
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get collection with places error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get collection with places", {
        originalError: error,
      });
    }
  }
}
