import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  gt,
  inArray,
  lt,
  sum,
} from "drizzle-orm";
import {
  CheckIn,
  Collection,
  Dog,
  PlaceImage,
  Review,
  user,
  UserSettings,
} from "../db/schema";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";
import { ImageUploadService } from "./image-upload.service";
import type { Db } from "../db";
import type { GetProfileReviewsQuery } from "../routes/profile/schemas";

/**
 * Profile Service
 * Handles all profile-related business logic
 */
export class ProfileService {
  constructor(
    private db: Db,
    private imageUploadService: ImageUploadService,
  ) {}

  async getProfile(profileId: string, userId?: string) {
    try {
      const profile = await this.db.query.user.findFirst({
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
          userSettings: {
            columns: {
              showReviews: true,
              showCollections: true,
              showCheckIns: true,
              showDogs: true,
              showAbout: true,
            },
          },
          checkIns: {
            orderBy: (checkIns, { desc }) => desc(checkIns.date),
            limit: 4,
            columns: {
              date: true,
              imageId: true,
              note: true,
            },
            with: {
              place: {
                columns: {
                  name: true,
                  slug: true,
                  rating: true,
                  countryCode: true,
                },
                with: {
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
              dogs: {
                with: {
                  dog: true,
                },
              },
            },
          },
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

      const [reviewStats, collectionStats, checkInStats] = await Promise.all([
        this.db
          .select({
            reviewCount: count(),
            averageRating: avg(Review.rating),
          })
          .from(Review)
          .where(eq(Review.userId, profileId)),
        this.db
          .select({ collectionCount: count() })
          .from(Collection)
          .where(eq(Collection.userId, profileId)),
        this.db
          .select({ checkInCount: count() })
          .from(CheckIn)
          .where(eq(CheckIn.userId, profileId)),
      ]);

      const isOwner = userId === profileId;
      const settings = profile.userSettings;

      const collections =
        isOwner || settings?.showCollections
          ? isOwner
            ? profile.collections
            : profile.collections.filter((c) => c.isPublic)
          : [];

      const reviews = isOwner || settings?.showReviews ? profile.reviews : [];

      const checkIns =
        isOwner || settings?.showCheckIns ? profile.checkIns : [];

      const dogs = isOwner || settings?.showDogs ? profile.dogs : [];

      const about =
        isOwner || settings?.showAbout
          ? {
              currentCity: profile.currentCity,
              instagram: profile.instagram,
              facebook: profile.facebook,
              x: profile.x,
              tiktok: profile.tiktok,
            }
          : {
              currentCity: null,
              instagram: null,
              facebook: null,
              x: null,
              tiktok: null,
            };

      return {
        ...profile,
        ...about,
        collections,
        reviews,
        checkIns,
        dogs,
        isOwner,
        reviewCount: reviewStats[0]?.reviewCount ?? 0,
        collectionCount: collectionStats[0]?.collectionCount ?? 0,
        checkInCount: checkInStats[0]?.checkInCount ?? 0,
        averageRating: Number(reviewStats[0]?.averageRating) || 0,
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

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      image?: File;
      currentCity?: string;
      instagram?: string;
      facebook?: string;
      x?: string;
      tiktok?: string;
      dogs?: string;
      removeDogIds?: string;
      dogImages?: File[];
      showAbout?: string;
      showDogs?: string;
      showCheckIns?: string;
      showReviews?: string;
      showCollections?: string;
    },
  ) {
    try {
      const userRecord = await this.db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      // Build user update data
      const updateData: Record<string, unknown> = {};

      if (data.name) {
        const sanitizedName = sanitizePlainText(data.name);

        if (!sanitizedName || sanitizedName.length < 2) {
          throw new ValidationError("Name must be at least 2 characters");
        }

        if (sanitizedName.length > 50) {
          throw new ValidationError("Name must be less than 50 characters");
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(sanitizedName)) {
          throw new ValidationError(
            "Name can only contain letters, spaces, hyphens, and apostrophes",
          );
        }

        updateData.name = sanitizedName;
      }

      if (data.image) {
        const uploadResult = await this.imageUploadService.uploadImage(
          data.image,
          {
            imageType: "user_avatar",
            uploadedBy: userId,
            altText:
              ((updateData.name as string) || userRecord.name) + " avatar",
          },
        );
        updateData.profileImageId = uploadResult.id;
      }

      if (data.currentCity !== undefined) {
        if (data.currentCity) {
          try {
            const cityData = JSON.parse(data.currentCity);
            if (cityData && typeof cityData.city === "string") {
              updateData.currentCity = {
                city: sanitizePlainText(cityData.city),
                locality: sanitizePlainText(cityData.locality || ""),
                country: sanitizePlainText(cityData.country || ""),
              };
            } else {
              updateData.currentCity = null;
            }
          } catch {
            updateData.currentCity = null;
          }
        } else {
          updateData.currentCity = null;
        }
      }
      if (data.instagram !== undefined) {
        updateData.instagram = sanitizePlainText(data.instagram) || null;
      }
      if (data.facebook !== undefined) {
        updateData.facebook = sanitizePlainText(data.facebook) || null;
      }
      if (data.x !== undefined) {
        updateData.x = sanitizePlainText(data.x) || null;
      }
      if (data.tiktok !== undefined) {
        updateData.tiktok = sanitizePlainText(data.tiktok) || null;
      }

      if (Object.keys(updateData).length > 0) {
        await this.db.update(user).set(updateData).where(eq(user.id, userId));
      }

      // Handle dog removals
      if (data.removeDogIds) {
        const idsToRemove: string[] = JSON.parse(data.removeDogIds);
        if (idsToRemove.length > 0) {
          await this.db.delete(Dog).where(inArray(Dog.id, idsToRemove));
        }
      }

      // Handle dog upserts
      if (data.dogs) {
        const dogs: Array<{
          id?: string;
          name: string;
          breed: string;
          imageIndex?: number;
        }> = JSON.parse(data.dogs);

        for (const dog of dogs) {
          let imageId: string | undefined;

          // Upload dog image if an imageIndex is provided
          const dogImageFile =
            dog.imageIndex !== undefined
              ? data.dogImages?.[dog.imageIndex]
              : undefined;
          if (dogImageFile) {
            const uploadResult = await this.imageUploadService.uploadImage(
              dogImageFile,
              {
                imageType: "user_avatar",
                uploadedBy: userId,
                altText: sanitizePlainText(dog.name) + " photo",
              },
            );
            imageId = uploadResult.id;
          }

          if (dog.id) {
            // Update existing dog
            const setData: Record<string, unknown> = {
              name: sanitizePlainText(dog.name),
              breed: sanitizePlainText(dog.breed),
            };
            if (imageId) {
              setData.imageId = imageId;
            }
            await this.db.update(Dog).set(setData).where(eq(Dog.id, dog.id));
          } else {
            // Insert new dog
            await this.db.insert(Dog).values({
              name: sanitizePlainText(dog.name),
              breed: sanitizePlainText(dog.breed),
              ownerId: userId,
              imageId: imageId || undefined,
            });
          }
        }
      }

      // Handle user settings
      const settingsUpdate: Record<string, boolean> = {};
      if (data.showAbout !== undefined)
        settingsUpdate.showAbout = data.showAbout === "true";
      if (data.showDogs !== undefined)
        settingsUpdate.showDogs = data.showDogs === "true";
      if (data.showCheckIns !== undefined)
        settingsUpdate.showCheckIns = data.showCheckIns === "true";
      if (data.showReviews !== undefined)
        settingsUpdate.showReviews = data.showReviews === "true";
      if (data.showCollections !== undefined)
        settingsUpdate.showCollections = data.showCollections === "true";

      if (Object.keys(settingsUpdate).length > 0) {
        await this.db
          .update(UserSettings)
          .set(settingsUpdate)
          .where(eq(UserSettings.userId, userId));
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Update profile error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to update profile", {
        originalError: error,
      });
    }
  }

  async getProfileDogs(userId: string) {
    try {
      const dogs = await this.db.query.Dog.findMany({
        where: eq(Dog.ownerId, userId),
        columns: {
          name: true,
          breed: true,
          imageId: true,
        },
      });

      return dogs;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get profile dogs error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get profile dogs", {
        originalError: error,
      });
    }
  }

  async getProfileReviews(
    profileId: string,
    query: GetProfileReviewsQuery,
    userId?: string,
  ) {
    try {
      const { limit, cursor, rating, sortBy } = query;

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

      if (!isOwner && !userRecord.userSettings?.showReviews) {
        return { isPrivate: true, reviews: [], isOwner: false };
      }

      const orderBy = (() => {
        switch (sortBy) {
          case "createdAt_asc":
            return asc(Review.createdAt);
          case "rating_desc":
            return desc(Review.rating);
          case "likes_desc":
            return desc(Review.likesCount);
          default:
            return desc(Review.createdAt);
        }
      })();

      const reviews = await this.db.query.Review.findMany({
        where: and(
          eq(Review.userId, profileId),
          rating ? eq(Review.rating, rating) : undefined,
          // TODO: cursor is createdAt-based, reset on sortBy change from frontend
          cursor ? lt(Review.createdAt, new Date(cursor)) : undefined,
        ),
        orderBy: orderBy,
        limit: limit,
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
                where: eq(PlaceImage.isPrimary, true),
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
          images: {
            limit: 1,
            with: {
              image: {
                columns: {
                  cfImageId: true,
                },
              },
            },
          },
        },
      });

      return {
        reviews,
        isOwner,
        isPrivate: false,
        nextCursor:
          reviews.length === limit && reviews.length > 0
            ? reviews[reviews.length - 1]?.createdAt.toISOString()
            : null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get profile reviews error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get profile reviews", {
        originalError: error,
      });
    }
  }
  async getprofileReviewStats(profileId: string, userId?: string) {
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

      if (!isOwner && !userRecord.userSettings?.showReviews) {
        return {
          totalreviews: null,
          averagerating: null,
          totalLikes: null,
          isPrivate: true,
          isOwner: false,
        };
      }

      const stats = await this.db
        .select({
          totalReviews: count(),
          averageRating: avg(Review.rating),
          totalLikes: sum(Review.likesCount),
        })
        .from(Review)
        .where(eq(Review.userId, profileId));

      return {
        totalReviews: stats[0]?.totalReviews ?? 0,
        averageRating: Number(stats[0]?.averageRating) || 0,
        totalLikes: Number(stats[0]?.totalLikes) ?? 0,
        isPrivate: false,
        isOwner,
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get profile review stats error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get profile review stats", {
        originalError: error,
      });
    }
  }
}
