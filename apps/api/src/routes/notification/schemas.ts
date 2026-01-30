import { z } from "zod";

const userEmailPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  replyToYourReply: z.boolean(),
  reviewThreadActivity: z.boolean(),
  newReviewsOnFavourites: z.boolean(),
  reportStatus: z.boolean(),
  marketing: z.boolean(),
  newsletter: z.boolean(),
  nearbyPlaces: z.boolean(),
});

const userPushPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  replyToYourReply: z.boolean(),
  reviewThreadActivity: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnFavourites: z.boolean(),
  reportStatus: z.boolean(),
  nearbyPlaces: z.boolean(),
});

// Partial schema for PATCH for user
export const userPartialNotificationPreferencesSchema = z
  .object({
    email: userEmailPreferencesSchema.partial().optional(),
    push: userPushPreferencesSchema.partial().optional(),
  })
  .refine((data) => data.email !== undefined || data.push !== undefined, {
    message: "At least one channel (email or push) must be provided",
  });

export type UserPartialNotificationPreferencesInput = z.infer<
  typeof userPartialNotificationPreferencesSchema
>;
