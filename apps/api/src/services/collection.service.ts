import { and, asc, count, eq } from "drizzle-orm";
import { db } from "../db";
import {
  Collection,
  CollectionItem,
  Image,
  Place,
  PlaceImage,
} from "../db/schema";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";

/**
 * Collection Service
 *
 * Handles all collection-related business logic
 */
export class CollectionService {
  static async getCollections(userId: string) {
    try {
      const collections = await db.query.Collection.findMany({
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

  static async createCollection(
    userId: string,
    name: string,
    description?: string,
  ) {
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

      const newCollection = await db
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

  static async savePlaceToCollection(
    placeId: string,
    userId: string,
    collectionId?: string,
  ) {
    try {
      // Verify place exists
      const [place] = await db
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
        const [collection] = await db
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
      const [existingItem] = await db
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
      await db.insert(CollectionItem).values({
        collectionId: targetCollectionId,
        placeId,
      });

      // Update item count
      const [countResult] = await db
        .select({ itemCount: count() })
        .from(CollectionItem)
        .where(eq(CollectionItem.collectionId, targetCollectionId));

      await db
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

  static async removePlaceFromCollection(
    placeId: string,
    userId: string,
    collectionId: string,
  ) {
    try {
      // Verify collection exists and belongs to user
      const [collection] = await db
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
      const deleted = await db
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
      const [countResult] = await db
        .select({ itemCount: count() })
        .from(CollectionItem)
        .where(eq(CollectionItem.collectionId, collectionId));

      await db
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

  static async isPlaceSaved(placeId: string, userId: string) {
    try {
      const [saved] = await db
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

  static async getPlaceCollections(placeId: string, userId: string) {
    try {
      // Get all user's collections with hasPlace flag
      const collections = await db
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
          const previewImages = await db
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
}
