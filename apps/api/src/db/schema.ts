import {
  pgTable,
  text,
  uuid,
  varchar,
  boolean,
  numeric,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  unique,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const placeTypeEnum = pgEnum("place_type", [
  "Park",
  "Restaurant",
  "Hotel",
  "Motel",
  "AirBnb",
  "Store",
  "Café",
  "Bar",
  "Dog Park",
  "Beach",
  "Walk",
  "Hike",
  "Service",
  "Activity",
  "Lake",
  "River",
  "Trail",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "approved",
  "resolved",
  "rejected",
  "closed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "claim_submitted",
  "claim_approved",
  "claim_rejected",
  "review_reply",
  "review_like",
  "new_review_on_favourite",
  "place_update",
  "reply_to_reply",
  "review_author_reply",
]);

export const notificationContextEnum = pgEnum("notification_context", [
  "personal",
  "business",
]);

export const imageTypeEnum = pgEnum("image_type", [
  "place_hero",
  "place_gallery",
  "review_photo",
  "user_avatar",
  "business_logo",
]);

export const imageSourceEnum = pgEnum("image_source", [
  "user_upload",
  "business_upload",
  "admin_upload",
  "import",
]);

// ============================================================================
// TABLES
// ============================================================================

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    profileImageId: uuid("profile_image_id").references(
      (): AnyPgColumn => Image.id,
      { onDelete: "set null" },
    ),
    provider: varchar("provider", { length: 255 }),
    isAdmin: boolean("is_admin").default(false),
    activeContext: text("active_context").default("personal"), // 'personal' | 'business'
    activeBusinessId: uuid("active_business_id").references(
      (): AnyPgColumn => Business.id,
    ),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    notificationPreferences: jsonb("notification_preferences")
      .default({
        email: {
          reviewReplies: true,
          reviewLikes: true,
          replyToYourReply: true,
          reviewThreadActivity: true,
          newReviewsOnFavourites: true,
          marketing: false,
          newsletter: false,
          nearbyPlaces: false,
          reportStatus: true,
        },
        push: {
          reviewReplies: true,
          reviewLikes: true,
          replyToYourReply: true,
          reviewThreadActivity: true,
          newReviewsOnFavourites: true,
          nearbyPlaces: false,
          replyToReply: true,
        },
      })
      .$type<UserNotificationPreferences>(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
    profileImageIdx: index("user_profile_image_idx").on(table.profileImageId),
  }),
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const Business = pgTable(
  "business",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Business identity
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    description: text("description"),

    logoImageId: uuid("logo_image_id").references((): AnyPgColumn => Image.id, {
      onDelete: "set null",
    }),

    // Verification & subscription
    verified: boolean("verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    subscriptionTier: text("subscription_tier").default("free"), // 'free', 'basic', 'premium'
    subscriptionExpiresAt: timestamp("subscription_expires_at"),

    notificationPreferences: jsonb("notification_preferences")
      .default({
        email: {
          reviewReplies: true,
          reviewLikes: true,
          replyToYourReply: true,
          reviewThreadActivity: true,
          newReviewsOnFavourites: true,
          placeUpdates: true,
          claimStatus: true,
          reportStatus: true,
          marketing: false,
          newsletter: false,
        },
        push: {
          reviewReplies: true,
          reviewLikes: true,
          replyToYourReply: true,
          reviewThreadActivity: true,
          newReviewsOnPlaces: true,
          nearbyPlaces: false,
          claimStatus: true,
        },
      })
      .$type<BusinessNotificationPreferences>(),

    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    ownerIdx: index("business_owner_idx").on(table.ownerId),
    emailIdx: index("business_email_idx").on(table.email),
    logoImageIdx: index("business_logo_image_idx").on(table.logoImageId),
  }),
);

export const Location = pgTable(
  "location",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),

    // Self-referential parent relationship
    // Example: Auckland's parent = Auckland Region
    parentId: uuid("parent_id").references((): AnyPgColumn => Location.id),

    // Type of location (country, island, state, region, city, suburb, etc.)
    type: text("type").notNull(),

    // Country code for easy filtering (NZ, AU, US, etc.)
    countryCode: text("country_code").notNull(),

    // Full path for URLs and breadcrumbs
    // Example: "new-zealand/north-island/auckland-region/auckland"
    path: text("path").notNull(),

    // Hierarchy level (0 = country, 1 = island/state, 2 = region, 3 = city)
    level: integer("level").notNull().default(0),

    // Coordinates (mainly for cities)
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),

    // Display properties
    image: text("image"),
    isPopular: boolean("is_popular").default(false),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Slug must be unique within a country
    slugCountryIdx: uniqueIndex("location_slug_country_idx").on(
      table.slug,
      table.countryCode,
    ),

    // Path must be globally unique
    pathIdx: uniqueIndex("location_path_idx").on(table.path),

    // Fast lookups for children of a parent
    parentIdx: index("location_parent_idx").on(table.parentId),

    // Fast lookups by type within a country
    typeCountryIdx: index("location_type_country_idx").on(
      table.type,
      table.countryCode,
    ),

    // Fast lookups for popular locations
    popularIdx: index("location_popular_idx")
      .on(table.countryCode, table.isPopular)
      .where(sql`${table.isPopular} = true`),

    // Efficient hierarchy queries
    levelIdx: index("location_level_idx").on(table.level, table.countryCode),

    // For case-insensitive name searches
    nameIdx: index("location_name_lower_idx").on(sql`lower(${table.name})`),
  }),
);

export const Place = pgTable(
  "place",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    types: placeTypeEnum("types").array().notNull(),
    description: text("description"),

    // CHANGED: Now references Location instead of City
    locationId: uuid("location_id")
      .notNull()
      .references(() => Location.id),

    // ADDED: Store country code for easy filtering
    countryCode: text("country_code").notNull().default("NZ"),

    // Address & coordinates
    address: text("address"),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),

    // Contact info
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    hours: jsonb("hours"),

    // Dog-specific info
    dogPolicy: text("dog_policy"),
    indoorAllowed: boolean("indoor_allowed").default(false),
    outdoorAllowed: boolean("outdoor_allowed").default(false),
    hasDogMenu: boolean("has_dog_menu").default(false),

    // Metrics and flags
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
    reviewsCount: integer("reviews_count").default(0),
    isVerified: boolean("is_verified").default(false),
    isFeatured: boolean("is_featured").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    claimedBy: uuid("claimed_by").references(() => Business.id),
    claimedAt: timestamp("claimed_at"),

    // Analytics
    totalViews: integer("total_views").default(0).notNull(),
    viewsThisMonth: integer("views_this_month").default(0).notNull(),
    analyticsLastUpdated: timestamp("analytics_last_updated"),
  },
  (table) => ({
    // Slug must be unique within a country
    slugCountryIdx: uniqueIndex("place_slug_country_idx").on(
      table.slug,
      table.countryCode,
    ),

    // CHANGED: Index on locationId instead of cityId
    locationIdx: index("place_location_idx").on(table.locationId),

    // ADDED: For filtering by country
    countryIdx: index("place_country_idx").on(table.countryCode),

    locationRatingIdx: index("place_location_rating_idx").on(
      table.locationId,
      table.rating.desc(),
    ),

    featuredIdx: index("place_featured_idx")
      .on(table.isFeatured)
      .where(sql`${table.isFeatured} = true`),

    claimedByIdx: index("place_claimed_by_idx").on(table.claimedBy),
  }),
);

export const Image = pgTable(
  "image",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Cloudflare Images ID (this is what we get back from CF after upload)
    cfImageId: varchar("cf_image_id", { length: 255 }).notNull().unique(),

    // Original file info
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 50 }).notNull(),
    fileSize: integer("file_size").notNull(), // bytes

    // Dimensions (optional, can extract from CF Images API)
    width: integer("width"),
    height: integer("height"),

    // What type of image is this?
    imageType: imageTypeEnum("image_type").notNull(),

    // Who uploaded it?
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    uploadedByBusiness: uuid("uploaded_by_business").references(
      () => Business.id,
      { onDelete: "set null" },
    ),

    // Source tracking
    source: imageSourceEnum("source").notNull().default("user_upload"),

    // Alt text for accessibility
    altText: text("alt_text"),

    // Optional metadata (JSON)
    metadata: jsonb("metadata").$type<Record<string, any>>(),

    // Moderation (for user-uploaded content)
    isApproved: boolean("is_approved").default(true).notNull(),
    moderatedBy: text("moderated_by").references(() => user.id),
    moderatedAt: timestamp("moderated_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    cfImageIdIdx: index("image_cf_image_id_idx").on(table.cfImageId),
    uploadedByIdx: index("image_uploaded_by_idx").on(table.uploadedBy),
    imageTypeIdx: index("image_image_type_idx").on(table.imageType),
    approvalIdx: index("image_approval_idx").on(
      table.isApproved,
      table.imageType,
    ),
  }),
);

export const PlaceImage = pgTable(
  "place_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => Image.id, { onDelete: "cascade" }),

    // Is this the featured/hero image for the place?
    isPrimary: boolean("is_primary").default(false).notNull(),

    // Display order for gallery
    displayOrder: integer("display_order").default(0).notNull(),

    // Optional caption
    caption: text("caption"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    placeIdIdx: index("place_image_place_id_idx").on(table.placeId),
    imageIdIdx: index("place_image_image_id_idx").on(table.imageId),
    primaryIdx: index("place_image_primary_idx").on(
      table.placeId,
      table.isPrimary,
    ),
    displayOrderIdx: index("place_image_display_order_idx").on(
      table.placeId,
      table.displayOrder,
    ),
  }),
);

export const PlaceView = pgTable(
  "place_view",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    sessionId: text("session_id").notNull(),

    source: text("source"),
    referrer: text("referrer"),
    city: text("city"),
    region: text("region"),
    country: text("country").default("NZ"),
    deviceType: text("device_type"),

    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
    timeOnPage: integer("time_on_page"),
  },
  (table) => ({
    placeIdIdx: index("place_view_place_id_idx").on(table.placeId),
    viewedAtIdx: index("place_view_viewed_at_idx").on(table.viewedAt),
    placeViewedIdx: index("place_view_place_viewed_idx").on(
      table.placeId,
      table.viewedAt,
    ),
    sessionIdx: index("place_view_session_idx").on(table.sessionId),
  }),
);

export const Review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: uuid("business_id").references(() => Business.id),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    visitDate: timestamp("visit_date"),

    numDogs: integer("num_dogs"),
    dogBreeds: text("dog_breeds").array(),
    timeOfVisit: text("time_of_visit"),

    isFirstVisit: boolean("is_first_visit").default(true),
    likesCount: integer("likes_count").default(0),
    repliesCount: integer("replies_count").default(0),
    hasBusinessReply: boolean("has_business_reply").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userPlaceUnique: unique().on(table.userId, table.placeId),
    placeIdx: index("review_place_idx").on(table.placeId),
    userIdx: index("review_user_idx").on(table.userId),
    placeCreatedAtIdx: index("review_created_at_idx").on(
      table.placeId,
      table.createdAt.desc(),
    ),
    helpfulReviewsIdx: index("review_helpful_idx").on(
      table.placeId,
      table.likesCount.desc(),
    ),
  }),
);

export const ReviewImage = pgTable(
  "review_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    reviewId: uuid("review_id")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),
    imageId: uuid("image_id")
      .notNull()
      .references(() => Image.id, { onDelete: "cascade" }),

    // Display order for multiple images
    displayOrder: integer("display_order").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewIdIdx: index("review_image_review_id_idx").on(table.reviewId),
    imageIdIdx: index("review_image_image_id_idx").on(table.imageId),
    displayOrderIdx: index("review_image_display_order_idx").on(
      table.reviewId,
      table.displayOrder,
    ),
  }),
);

export const ReviewReply = pgTable(
  "review_reply",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Links to the original review
    reviewId: uuid("review_id")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),

    // Self-referential parent for threading
    // NULL means this is a top-level reply to the review
    parentReplyId: uuid("parent_reply_id").references(
      (): AnyPgColumn => ReviewReply.id,
      {
        onDelete: "cascade",
      },
    ),

    // Who wrote this reply? (either user OR business, not both)
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    businessId: uuid("business_id").references(() => Business.id, {
      onDelete: "cascade",
    }),

    // The reply content
    content: text("content").notNull(),

    // Threading metadata
    depth: integer("depth").default(0).notNull(), // 0 = reply to review, 1 = reply to reply, etc.

    // Engagement
    likesCount: integer("likes_count").default(0),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    editedAt: timestamp("edited_at"), // Track if reply was edited
  },
  (table) => ({
    reviewIdx: index("review_reply_review_idx").on(table.reviewId),
    parentIdx: index("review_reply_parent_idx").on(table.parentReplyId),
    userIdx: index("review_reply_user_idx").on(table.userId),
    businessIdx: index("review_reply_business_idx").on(table.businessId),

    // For efficient chronological ordering within a review
    reviewCreatedIdx: index("review_reply_review_created_idx").on(
      table.reviewId,
      table.createdAt.asc(),
    ),

    // For efficient tree traversal
    parentCreatedIdx: index("review_reply_parent_created_idx").on(
      table.parentReplyId,
      table.createdAt.asc(),
    ),
  }),
);

export const ReviewReplyLike = pgTable(
  "review_reply_like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    replyId: uuid("reply_id")
      .notNull()
      .references(() => ReviewReply.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: uuid("business_id").references(() => Business.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userReplyUnique: unique().on(table.userId, table.replyId),
    replyIdx: index("review_reply_like_reply_idx").on(table.replyId),
  }),
);

export const ReviewLike = pgTable(
  "review_like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: uuid("business_id").references(() => Business.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userReviewUnique: unique().on(table.userId, table.reviewId),
    reviewIdx: index("review_like_review_idx").on(table.reviewId),
  }),
);

export const ReviewReport = pgTable("review_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => Review.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => Business.id),
  reason: text("reason").notNull(),
  details: text("details"),
  status: reportStatusEnum("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Claim = pgTable(
  "claim",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: uuid("business_id")
      .notNull()
      .references(() => Business.id, { onDelete: "cascade" }),
    status: reportStatusEnum("status").notNull().default("pending"),

    businessEmail: varchar("business_email", { length: 255 }).notNull(),
    businessPhone: varchar("business_phone", { length: 50 }).notNull(),

    role: varchar("role", { length: 100 }).notNull(),

    verificationDocuments: jsonb("verification_documents").$type<string[]>(),

    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),

    claimedAt: timestamp("claimed_at").notNull().defaultNow(),
    approvedAt: timestamp("approved_at"),
    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessPlaceUnique: unique().on(table.businessId, table.placeId),
    statusIdx: index("claim_status_idx").on(table.status),
    businessIdx: index("claim_business_idx").on(table.businessId),
    placeIdx: index("claim_place_idx").on(table.placeId),
  }),
);

export const BusinessPlace = pgTable(
  "business_place",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => Business.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    claimId: uuid("claim_id")
      .notNull()
      .references(() => Claim.id),

    canEdit: boolean("can_edit").notNull().default(true),
    canRespond: boolean("can_respond").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniqueBusinessPlace: unique().on(table.businessId, table.placeId),
    businessIdx: index("business_places_business_idx").on(table.businessId),
    placeIdx: index("business_places_place_idx").on(table.placeId),
    claimIdx: index("business_places_claim_idx").on(table.claimId),
  }),
);

export const Notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    context: notificationContextEnum("context").notNull().default("personal"),

    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),

    relatedClaimId: uuid("related_claim_id").references(() => Claim.id, {
      onDelete: "cascade",
    }),
    relatedPlaceId: uuid("related_place_id").references(() => Place.id, {
      onDelete: "cascade",
    }),
    relatedReviewId: uuid("related_review_id").references(() => Review.id, {
      onDelete: "cascade",
    }),
    relatedReplyId: uuid("related_reply_id").references(() => ReviewReply.id, {
      onDelete: "cascade",
    }),

    data: jsonb("data").$type<Record<string, any>>(),

    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notification_user_id_idx").on(table.userId),
    userContextIdx: index("notification_user_context_idx").on(
      table.userId,
      table.context,
    ),
    userUnreadIdx: index("notification_user_unread_idx").on(
      table.userId,
      table.isRead,
      table.context,
    ),
    createdAtIdx: index("notification_created_at_idx").on(
      table.createdAt.desc(),
    ),
  }),
);

export const DogBreed = pgTable("dog_breed", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Collection = pgTable(
  "collection",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Collection details
    name: text("name").notNull(), // "Weekend Hikes", "Dog-Friendly Cafés"
    description: text("description"),

    // Display
    emoji: text("emoji"), // Optional emoji for visual flair: "🥾", "☕", "🏖️"
    color: text("color"), // Optional color hex: "#10b981", "#3b82f6"

    // Privacy
    isPublic: boolean("is_public").default(false).notNull(), // Can others see this collection?

    // Metadata
    itemCount: integer("item_count").default(0).notNull(), // Denormalized for performance

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("collection_user_id_idx").on(table.userId),
    userPublicIdx: index("collection_user_public_idx").on(
      table.userId,
      table.isPublic,
    ),
  }),
);

export const CollectionItem = pgTable(
  "collection_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => Collection.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),

    // Optional note about why they saved this place to this collection
    note: text("note"), // "Great for sunset walks with Max"

    // When they saved it
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // A place can only be in a collection once
    collectionPlaceUnique: unique().on(table.collectionId, table.placeId),

    collectionIdIdx: index("collection_item_collection_id_idx").on(
      table.collectionId,
    ),
    placeIdIdx: index("collection_item_place_id_idx").on(table.placeId),

    // For chronological ordering
    collectionCreatedIdx: index("collection_item_collection_created_idx").on(
      table.collectionId,
      table.createdAt.desc(),
    ),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================
export const userRelations = relations(user, ({ many, one }) => ({
  reviews: many(Review),
  collections: many(Collection),
  reviewHelpfuls: many(ReviewLike),
  ownedBusinesses: many(Business),
  activeBusiness: one(Business, {
    fields: [user.activeBusinessId],
    references: [Business.id],
  }),
  profileImage: one(Image, {
    fields: [user.profileImageId],
    references: [Image.id],
  }),
  uploadedImages: many(Image),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const businessRelations = relations(Business, ({ many, one }) => ({
  owner: one(user, {
    fields: [Business.ownerId],
    references: [user.id],
  }),
  places: many(BusinessPlace),
  collections: many(Collection),
  reviews: many(Review),
  placeClaims: many(Claim),
  logoImage: one(Image, {
    fields: [Business.logoImageId],
    references: [Image.id],
  }),
  uploadedImages: many(Image),
}));

export const businessPlaceRelations = relations(BusinessPlace, ({ one }) => ({
  business: one(Business, {
    fields: [BusinessPlace.businessId],
    references: [Business.id],
  }),
  place: one(Place, {
    fields: [BusinessPlace.placeId],
    references: [Place.id],
  }),
  claim: one(Claim, {
    fields: [BusinessPlace.claimId],
    references: [Claim.id],
  }),
}));

export const collectionRelations = relations(Collection, ({ one, many }) => ({
  user: one(user, {
    fields: [Collection.userId],
    references: [user.id],
  }),
  items: many(CollectionItem),
}));

export const collectionItemRelations = relations(CollectionItem, ({ one }) => ({
  collection: one(Collection, {
    fields: [CollectionItem.collectionId],
    references: [Collection.id],
  }),
  place: one(Place, {
    fields: [CollectionItem.placeId],
    references: [Place.id],
  }),
}));

export const placeRelations = relations(Place, ({ one, many }) => ({
  location: one(Location, {
    fields: [Place.locationId],
    references: [Location.id],
  }),
  images: many(PlaceImage),
  reviews: many(Review),
  collectionItems: many(CollectionItem),
  activeClaim: one(Claim, {
    fields: [Place.id],
    references: [Claim.placeId],
  }),
}));

export const imageRelations = relations(Image, ({ one, many }) => ({
  uploadedBy: one(user, {
    fields: [Image.uploadedBy],
    references: [user.id],
  }),
  uploadedByBusiness: one(Business, {
    fields: [Image.uploadedByBusiness],
    references: [Business.id],
  }),
  placeImages: many(PlaceImage),
  reviewImages: many(ReviewImage),
}));

export const placeImageRelations = relations(PlaceImage, ({ one }) => ({
  place: one(Place, {
    fields: [PlaceImage.placeId],
    references: [Place.id],
  }),
  image: one(Image, {
    fields: [PlaceImage.imageId],
    references: [Image.id],
  }),
}));

export const locationRelations = relations(Location, ({ one, many }) => ({
  // Parent location (e.g., Auckland → Auckland Region)
  parent: one(Location, {
    fields: [Location.parentId],
    references: [Location.id],
    relationName: "locationHierarchy",
  }),

  // Child locations (e.g., Auckland Region → [Auckland, North Shore, etc])
  children: many(Location, {
    relationName: "locationHierarchy",
  }),

  // Places in this location
  places: many(Place),
}));

export const reviewRelations = relations(Review, ({ one, many }) => ({
  place: one(Place, {
    fields: [Review.placeId],
    references: [Place.id],
  }),
  user: one(user, {
    fields: [Review.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [Review.businessId],
    references: [Business.id],
  }),
  images: many(ReviewImage),
  likes: many(ReviewLike),
  reports: many(ReviewReport),
  replies: many(ReviewReply),
}));

export const reviewImageRelations = relations(ReviewImage, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewImage.reviewId],
    references: [Review.id],
  }),
  image: one(Image, {
    fields: [ReviewImage.imageId],
    references: [Image.id],
  }),
}));

export const reviewReplyRelations = relations(ReviewReply, ({ one, many }) => ({
  review: one(Review, {
    fields: [ReviewReply.reviewId],
    references: [Review.id],
  }),
  user: one(user, {
    fields: [ReviewReply.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [ReviewReply.businessId],
    references: [Business.id],
  }),

  // Threading relations
  parentReply: one(ReviewReply, {
    fields: [ReviewReply.parentReplyId],
    references: [ReviewReply.id],
    relationName: "replyThread",
  }),
  childReplies: many(ReviewReply, {
    relationName: "replyThread",
  }),

  // Engagement
  likes: many(ReviewReplyLike),
}));

export const reviewReplyLikeRelations = relations(
  ReviewReplyLike,
  ({ one }) => ({
    reply: one(ReviewReply, {
      fields: [ReviewReplyLike.replyId],
      references: [ReviewReply.id],
    }),
    user: one(user, {
      fields: [ReviewReplyLike.userId],
      references: [user.id],
    }),
    business: one(Business, {
      fields: [ReviewReplyLike.businessId],
      references: [Business.id],
    }),
  }),
);

export const reviewLikeRelations = relations(ReviewLike, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewLike.reviewId],
    references: [Review.id],
  }),
  user: one(user, {
    fields: [ReviewLike.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [ReviewLike.businessId],
    references: [Business.id],
  }),
}));

export const reviewReportRelations = relations(ReviewReport, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewReport.reviewId],
    references: [Review.id],
  }),
  reporter: one(user, {
    fields: [ReviewReport.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [ReviewReport.businessId],
    references: [Business.id],
  }),
  reviewer: one(user, {
    fields: [ReviewReport.reviewedBy],
    references: [user.id],
  }),
}));

export const claimRelations = relations(Claim, ({ one }) => ({
  place: one(Place, {
    fields: [Claim.placeId],
    references: [Place.id],
  }),
  business: one(Business, {
    fields: [Claim.businessId],
    references: [Business.id],
  }),
  approver: one(user, {
    fields: [Claim.reviewedBy],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(Notification, ({ one }) => ({
  user: one(user, {
    fields: [Notification.userId],
    references: [user.id],
  }),
  relatedClaim: one(Claim, {
    fields: [Notification.relatedClaimId],
    references: [Claim.id],
  }),
  relatedPlace: one(Place, {
    fields: [Notification.relatedPlaceId],
    references: [Place.id],
  }),
  relatedReview: one(Review, {
    fields: [Notification.relatedReviewId],
    references: [Review.id],
  }),
  relatedReply: one(ReviewReply, {
    fields: [Notification.relatedReplyId],
    references: [ReviewReply.id],
  }),
}));

// User notification preferences (personal context)
export type UserNotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: boolean;
    replyToYourReply: boolean; // Someone replied to your reply
    reviewThreadActivity: boolean; // Activity in threads you're in
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;
    reportStatus: boolean;

    // Marketing
    marketing: boolean;
    newsletter: boolean;

    // Discovery
    nearbyPlaces: boolean;
  };
  push: {
    // Engagement
    reviewReplies: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;

    // Discovery
    nearbyPlaces: boolean;
  };
};

// Business notification preferences (business context)
export type BusinessNotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    reviewLikes: boolean;
    newReviewsOnPlaces: boolean;

    // Business/Admin
    placeUpdates: boolean;
    claimStatus: boolean;
    reportStatus: boolean;

    // Marketing
    marketing: boolean;
    newsletter: boolean;
  };
  push: {
    // Engagement
    reviewReplies: boolean;
    replyToYourReply: boolean;
    reviewThreadActivity: boolean;
    reviewLikes: boolean;
    newReviewsOnPlaces: boolean;
    reportStatus: boolean;

    // Discovery
    nearbyPlaces: boolean;

    // Business/Admin
    claimStatus: boolean;
  };
};
