import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import type { UserPartialNotificationPreferencesInput } from "../routes/notification/schemas";
import { user, type UserNotificationPreferences } from "../db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_USER_NOTIFICATION_PREFERENCES = {
  email: {
    reviewReplies: true,
    replyToYourReply: true,
    reviewThreadActivity: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,
    marketing: false,
    newsletter: false,
    nearbyPlaces: false,
    reportStatus: true,
  },
  push: {
    reviewReplies: true,
    replyToYourReply: true,
    reviewThreadActivity: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,
    nearbyPlaces: false,
  },
};

/** Keys that exist in both email and push preferences */
type NotificationEventKey =
  | "reviewReplies"
  | "replyToYourReply"
  | "reviewThreadActivity"
  | "reviewLikes"
  | "newReviewsOnFavourites"
  | "nearbyPlaces";

/**
 * Notification Service
 *
 * Handles all notification-related business logic
 */
export class NotificationService {
  /**
   * Check if a user should receive email and/or push notifications for a given event
   */
  static async shouldNotify(
    userId: string,
    event: NotificationEventKey,
  ): Promise<{ email: boolean; push: boolean }> {
    const preferences = await this.getPreferences(userId);

    return {
      email: preferences.email[event] ?? false,
      push: preferences.push[event] ?? false,
    };
  }
  /**
   * Get users notification preferences with defaults merged
   */
  static async getPreferences(userId: string) {
    try {
      const userRecord = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, userId),
      });

      if (!userRecord) {
        throw new NotFoundError("User not found");
      }

      const userPreferences = userRecord.notificationPreferences;

      if (!userPreferences) {
        return DEFAULT_USER_NOTIFICATION_PREFERENCES;
      }

      return {
        email: {
          ...DEFAULT_USER_NOTIFICATION_PREFERENCES.email,
          ...(userPreferences.email || {}),
        },
        push: {
          ...DEFAULT_USER_NOTIFICATION_PREFERENCES.push,
          ...(userPreferences.push || {}),
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get notification preferences error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to get notification preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Update user's notification preferences (partial update)
   */
  static async updateUserPreferences(
    userId: string,
    updates: UserPartialNotificationPreferencesInput,
  ) {
    try {
      const currentPreferences = await this.getPreferences(userId);

      // Merge updates with current preferences
      const updatedPrefs: UserNotificationPreferences = {
        email: {
          ...currentPreferences.email,
          ...(updates.email || {}),
        },
        push: {
          ...currentPreferences.push,
          ...(updates.push || {}),
        },
      };

      await db
        .update(user)
        .set({
          notificationPreferences: updatedPrefs,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return updatedPrefs;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Update notification preferences error:", error);
      }
      throw new DatabaseError("Failed to update notification preferences", {
        originalError: error,
      });
    }
  }

  /**
   * Reset user preferences to defaults
   */
  static async resetUserPreferences(userId: string) {
    try {
      const defaultPrefs = DEFAULT_USER_NOTIFICATION_PREFERENCES;

      await db
        .update(user)
        .set({
          notificationPreferences: defaultPrefs,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));

      return {
        ...defaultPrefs,
        success: true,
        message: "Notification preferences reset to defaults",
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Reset notification preferences error:", error);
      }
      throw new DatabaseError("Failed to reset notification preferences", {
        originalError: error,
      });
    }
  }
}
