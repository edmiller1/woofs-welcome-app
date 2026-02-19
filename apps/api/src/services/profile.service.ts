import { eq } from "drizzle-orm";
import { db } from "../db";
import { Collection, Review, user } from "../db/schema";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";

/**
 * Profile Service
 * Handles all profile-related business logic
 */
export class ProfileService {
  static async getProfile(profileId: string, userId?: string) {
    try {
      const profile = await db.query.user.findFirst({
        where: eq(user.id, profileId),
        columns: {
          id: true,
          name: true,
          image: true,
          emailVerified: true,
          profileImageId: true,
          createdAt: true,
          currentCity: true,
          x: true,
          tiktok: true,
          facebook: true,
          instagram: true,
        },
        with: {
          reviews: {
            orderBy: (reviews, { desc }) => desc(reviews.createdAt),
            limit: 12,
            with: {
              place: {
                columns: {
                  name: true,
                  slug: true,
                  rating: true,
                  countryCode: true,
                },
                with: {
                  images: {
                    limit: 1,
                  },
                  location: {
                    columns: {
                      name: true,
                      path: true,
                    },
                    with: {
                      parent: {
                        columns: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
          collections: {
            orderBy: (collections, { desc }) => desc(collections.createdAt),
            limit: 12,
            with: {
              items: {
                limit: 4,
                with: {
                  place: {
                    columns: {
                      name: true,
                    },
                    with: {
                      images: {
                        limit: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          dogs: true,
        },
      });

      if (!profile) {
        throw new NotFoundError("Profile not found");
      }

      const reviewCount = profile.reviews.length;

      const collectionCount = profile.collections.length;

      const averageRating =
        profile.reviews.reduce((acc, cur) => acc + cur.rating, 0) /
        profile.reviews.length;

      return {
        ...profile,
        isOwner: userId ? profile.id === userId : false,
        reviewCount,
        collectionCount,
        averageRating,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get profile error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get profile", {
        originalError: error,
      });
    }
  }
}
