import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import type { UserPartialNotificationPreferencesInput } from "../routes/notification/schemas";
import {
  Notification,
  user,
  type UserNotificationPreferences,
} from "../db/schema";
import { and, eq } from "drizzle-orm";
import type { ImageUploadService } from "./image-upload.service";
import type { AnyDb, Db } from "../db";

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
  constructor(
    private db: AnyDb,
    private imageUploadService: ImageUploadService,
  ) {}
  /**
   * Check if a user should receive email and/or push notifications for a given event
   */
  async shouldNotify(
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
  async getPreferences(userId: string) {
    try {
      const userRecord = await this.db.query.user.findFirst({
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
  async updateUserPreferences(
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

      await this.db
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
  async resetUserPreferences(userId: string) {
    try {
      const defaultPrefs = DEFAULT_USER_NOTIFICATION_PREFERENCES;

      await this.db
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

  /**
   * Create a notification for a user, respecting their preferences.
   * Pass `preferenceKey` to gate on the user's email/push settings.
   * Omit it for system notifications that should always be created (e.g. claim status).
   */
  async createNotification(
    recipientId: string,
    payload: {
      type:
        | "claim_submitted"
        | "claim_approved"
        | "claim_rejected"
        | "review_reply"
        | "review_like"
        | "new_review_on_favourite"
        | "place_update"
        | "reply_to_reply"
        | "review_author_reply"
        | "marketing"
        | "newsletter"
        | "nearby_places"
        | "report_status";
      title: string;
      message: string;
      url?: string;
      relatedReviewId?: string;
      relatedPlaceId?: string;
      relatedClaimId?: string;
      relatedReplyId?: string;
      context?: "personal" | "business";
      data?: Record<string, any>;
    },
    preferenceKey?: NotificationEventKey,
  ) {
    try {
      if (preferenceKey) {
        const { push } = await this.shouldNotify(recipientId, preferenceKey);
        if (!push) return;
      }

      await this.db.insert(Notification).values({
        userId: recipientId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        url: payload.url,
        relatedReviewId: payload.relatedReviewId,
        relatedPlaceId: payload.relatedPlaceId,
        relatedClaimId: payload.relatedClaimId,
        relatedReplyId: payload.relatedReplyId,
        context: payload.context ?? "personal",
        data: payload.data,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new DatabaseError("Failed to create notification", {
        originalError: error,
      });
    }
  }

  async getNotifications(userId: string) {
    try {
      const notifications = await this.db.query.Notification.findMany({
        where: eq(Notification.userId, userId),
      });

      return notifications;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Get notifications error:", error);
      }
      throw new DatabaseError("Failed to get notifications", {
        originalError: error,
      });
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      await this.db
        .update(Notification)
        .set({ isRead: true })
        .where(
          and(
            eq(Notification.id, notificationId),
            eq(Notification.userId, userId),
          ),
        );
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Mark notification as read error:", error);
      }
      throw new DatabaseError("Failed to mark notification as read", {
        originalError: error,
      });
    }
  }

  async markAsUnread(notificationId: string, userId: string) {
    try {
      await this.db
        .update(Notification)
        .set({ isRead: false })
        .where(
          and(
            eq(Notification.id, notificationId),
            eq(Notification.userId, userId),
          ),
        );
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Mark notification as unread error:", error);
      }
      throw new DatabaseError("Failed to mark notification as unread", {
        originalError: error,
      });
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await this.db
        .update(Notification)
        .set({ isRead: true })
        .where(eq(Notification.userId, userId));
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Mark notification as read error:", error);
      }
      throw new DatabaseError("Failed to mark notification as read", {
        originalError: error,
      });
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      await this.db
        .delete(Notification)
        .where(
          and(
            eq(Notification.id, notificationId),
            eq(Notification.userId, userId),
          ),
        );
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Delete notification error:", error);
      }
      throw new DatabaseError("Failed to delete notification", {
        originalError: error,
      });
    }
  }
}
