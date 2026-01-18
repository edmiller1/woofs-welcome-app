/**
 * Auth Service
 *
 * Handles all auth-related business logic
 */

import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import { AppError, DatabaseError, ValidationError } from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";

export class AuthService {
  /**
   * Set name and image for user
   */
  static async welcomeUser(userId: string, name: string, image?: string) {
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
        // TODO: Validate image URL
        // TODO: UPload image
      }

      // Update user name
      await db
        .update(user)
        .set({ name: sanitizedName })
        .where(eq(user.id, userId));

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
}
