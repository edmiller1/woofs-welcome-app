export interface Notification {
  id: string;
  userId: string;
  context: string;
  type: string;
  title: string;
  message: string;
  relatedClaimId: string;
  relatedPlaceId: string;
  relatedReviewId: string;
  data: Record<string, any>;
  isRead: boolean;
  readAt: Date;
  createdAt: Date;
}

export interface UserNotificationPreferences {
  email: {
    reviewReplies: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;
    reportStatus: boolean;
    marketing: boolean;
    newsletter: boolean;
    nearbyPlaces: boolean;
  };
  push: {
    reviewReplies: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;
    nearbyPlaces: boolean;
  };
}

export interface BusinessNotificationPreferences {
  email: {
    reviewReplies: boolean;
    reviewLikes: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    newReviewsOnPlaces: boolean;
    placeUpdates: boolean;
    claimStatus: boolean;
    reportStatus: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  push: {
    reviewReplies: boolean;
    reviewLikes: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    newReviewsOnPlaces: boolean;
    reportStatus: boolean;
    nearbyPlaces: boolean;
    claimStatus: boolean;
  };
}

export interface UserNotificationPreferencesInput {
  email?:
    | {
        reviewReplies?: boolean | undefined;
        reviewLikes?: boolean | undefined;
        replyToYourReply?: boolean | undefined;
        reviewThreadActivity?: boolean | undefined;
        newReviewsOnFavourites?: boolean | undefined;
        reportStatus?: boolean | undefined;
        marketing?: boolean | undefined;
        newsletter?: boolean | undefined;
        nearbyPlaces?: boolean | undefined;
      }
    | undefined;
  push?:
    | {
        reviewReplies?: boolean | undefined;
        reviewLikes?: boolean | undefined;
        replyToYourReply?: boolean | undefined;
        reviewThreadActivity?: boolean | undefined;
        newReviewsOnFavourites?: boolean | undefined;
        nearbyPlaces?: boolean | undefined;
      }
    | undefined;
}
