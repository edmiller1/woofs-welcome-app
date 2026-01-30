/**
 * Auth Service
 *
 * Handles all auth-related business logic
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import {
  AppError,
  DatabaseError,
  NotFoundError,
  ValidationError,
} from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";
import { ImageUploadService, type UploadResult } from "./image-upload.service";

const imageUploadService = new ImageUploadService();

export class AuthService {
  /**
   * Set name and image for user
   */
  static async welcomeUser(userId: string, name: string, image?: File) {
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
        const uploadResult = await imageUploadService.uploadImage(image, {
          imageType: "user_avatar",
          uploadedBy: userId,
          altText: sanitizedName + " avatar",
        });

        // Update user with name and profile image
        await db
          .update(user)
          .set({
            name: sanitizedName,
            profileImageId: uploadResult.id,
            provider: "email",
          })
          .where(eq(user.id, userId));
      } else {
        // Update user name only
        await db
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

  static async updateProfile(userId: string, name?: string, image?: File) {
    try {
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const updateData: { name?: string; profileImageId?: string } = {};

      if (name) {
        const sanitizedName = sanitizePlainText(name);

        if (!sanitizedName || sanitizedName.length < 2) {
          throw new Error("Name must be at least 2 characters");
        }

        if (sanitizedName.length > 50) {
          throw new Error("Name must be less than 50 characters");
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(sanitizedName)) {
          throw new Error(
            "Name can only contain letters, spaces, hyphens, and apostrophes",
          );
        }

        updateData.name = sanitizedName;
      }

      if (image) {
        const uploadResult = await imageUploadService.uploadImage(image, {
          imageType: "user_avatar",
          uploadedBy: userId,
          altText: (updateData.name || userRecord.name) + " avatar",
        });

        updateData.profileImageId = uploadResult.id;
      }

      if (Object.keys(updateData).length > 0) {
        await db.update(user).set(updateData).where(eq(user.id, userId));
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
