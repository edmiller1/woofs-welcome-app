/**
 * Auth Service
 *
 * Handles all auth-related business logic
 */

import { eq, inArray } from "drizzle-orm";
import { Dog, user, UserSettings } from "../db/schema";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";
import type { Db } from "../db";
import type { ImageUploadService } from "./image-upload.service";

export class AuthService {
  constructor(
    private db: Db,
    private imageUploadService: ImageUploadService,
  ) {}
  /**
   * Set name and image for user
   */
  async welcomeUser(userId: string, name: string, image?: File) {
    try {
      const sanitizedName = sanitizePlainText(name);

      if (!sanitizedName || sanitizedName.length < 2) {
        throw new ValidationError("Name must be at least 2 characters");
      }

      if (sanitizedName.length > 50) {
        throw new ValidationError("Name must be less than 50 characters");
      }

      const nameRegex = /^[a-zA-Z\s'-]+$/;

      if (!nameRegex.test(sanitizedName)) {
        throw new Error(
          "Name can only contain letters, spaces, hyphens, and apostrophes",
        );
      }

      if (image) {
        // Upload image to Cloudflare (this also saves to db)
        const uploadResult = await this.imageUploadService.uploadImage(image, {
          imageType: "user_avatar",
          uploadedBy: userId,
          altText: sanitizedName + " avatar",
        });

        // Update user with name and profile image
        await this.db
          .update(user)
          .set({
            name: sanitizedName,
            profileImageId: uploadResult.id,
            provider: "email",
          })
          .where(eq(user.id, userId));
      } else {
        // Update user name only
        await this.db
          .update(user)
          .set({ name: sanitizedName, provider: "email" })
          .where(eq(user.id, userId));
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Welcome user error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to welcome user", {
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
        updateData.currentCity = sanitizePlainText(data.currentCity) || null;
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
}
