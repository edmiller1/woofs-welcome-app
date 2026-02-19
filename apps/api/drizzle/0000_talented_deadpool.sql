CREATE TYPE "public"."image_source" AS ENUM('user_upload', 'business_upload', 'admin_upload', 'import');--> statement-breakpoint
CREATE TYPE "public"."image_type" AS ENUM('place_hero', 'place_gallery', 'review_photo', 'user_avatar', 'business_logo', 'checkin_photo');--> statement-breakpoint
CREATE TYPE "public"."notification_context" AS ENUM('personal', 'business');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('claim_submitted', 'claim_approved', 'claim_rejected', 'review_reply', 'review_like', 'new_review_on_favourite', 'place_update', 'reply_to_reply', 'review_author_reply');--> statement-breakpoint
CREATE TYPE "public"."place_type" AS ENUM('Park', 'Restaurant', 'Hotel', 'Motel', 'AirBnb', 'Store', 'Café', 'Bar', 'Dog Park', 'Beach', 'Walk', 'Hike', 'Service', 'Activity', 'Lake', 'River', 'Trail');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'approved', 'resolved', 'rejected', 'closed');--> statement-breakpoint
CREATE TABLE "business" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"website" text,
	"description" text,
	"logo_image_id" uuid,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"subscription_tier" text DEFAULT 'free',
	"subscription_expires_at" timestamp,
	"notification_preferences" jsonb DEFAULT '{"email":{"reviewReplies":true,"reviewLikes":true,"replyToYourReply":true,"reviewThreadActivity":true,"newReviewsOnFavourites":true,"placeUpdates":true,"claimStatus":true,"reportStatus":true,"marketing":false,"newsletter":false},"push":{"reviewReplies":true,"reviewLikes":true,"replyToYourReply":true,"reviewThreadActivity":true,"newReviewsOnPlaces":true,"nearbyPlaces":false,"claimStatus":true}}'::jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_place" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"claim_id" uuid NOT NULL,
	"can_edit" boolean DEFAULT true NOT NULL,
	"can_respond" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_place_business_id_place_id_unique" UNIQUE("business_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "check_in" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"place_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"image_id" uuid,
	"note" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "check_in_dog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_in_id" uuid NOT NULL,
	"dog_id" uuid NOT NULL,
	CONSTRAINT "check_in_dog_check_in_id_dog_id_unique" UNIQUE("check_in_id","dog_id")
);
--> statement-breakpoint
CREATE TABLE "claim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"business_email" varchar(255) NOT NULL,
	"business_phone" varchar(50) NOT NULL,
	"role" varchar(100) NOT NULL,
	"verification_documents" jsonb,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"claimed_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"additional_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "claim_business_id_place_id_unique" UNIQUE("business_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"emoji" text,
	"color" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_item_collection_id_place_id_unique" UNIQUE("collection_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "dog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"breed" text NOT NULL,
	"image_id" uuid,
	"created_at" timestamp,
	"updated_at" timestamp,
	"owner_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dog_breed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cf_image_id" varchar(255) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"image_type" "image_type" NOT NULL,
	"uploaded_by" text,
	"uploaded_by_business" uuid,
	"source" "image_source" DEFAULT 'user_upload' NOT NULL,
	"alt_text" text,
	"metadata" jsonb,
	"is_approved" boolean DEFAULT true NOT NULL,
	"moderated_by" text,
	"moderated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "image_cf_image_id_unique" UNIQUE("cf_image_id")
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"parent_id" uuid,
	"type" text NOT NULL,
	"country_code" text NOT NULL,
	"path" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"image" text,
	"is_popular" boolean DEFAULT false,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"context" "notification_context" DEFAULT 'personal' NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_claim_id" uuid,
	"related_place_id" uuid,
	"related_review_id" uuid,
	"related_reply_id" uuid,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"types" "place_type"[] NOT NULL,
	"description" text,
	"location_id" uuid NOT NULL,
	"country_code" text DEFAULT 'NZ' NOT NULL,
	"address" text,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"phone" text,
	"email" text,
	"website" text,
	"hours" jsonb,
	"dog_policy" text,
	"indoor_allowed" boolean DEFAULT false,
	"outdoor_allowed" boolean DEFAULT false,
	"has_dog_menu" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0',
	"reviews_count" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"claimed_by" uuid,
	"claimed_at" timestamp,
	"total_views" integer DEFAULT 0 NOT NULL,
	"views_this_month" integer DEFAULT 0 NOT NULL,
	"analytics_last_updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "place_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"caption" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "place_view" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"user_id" text,
	"session_id" text NOT NULL,
	"source" text,
	"referrer" text,
	"city" text,
	"region" text,
	"country" text DEFAULT 'NZ',
	"device_type" text,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"time_on_page" integer
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"visit_date" timestamp,
	"num_dogs" integer,
	"dog_breeds" text[],
	"time_of_visit" text,
	"likes_count" integer DEFAULT 0,
	"replies_count" integer DEFAULT 0,
	"has_business_reply" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_user_id_place_id_unique" UNIQUE("user_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "review_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"image_id" uuid NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_like" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_like_user_id_review_id_unique" UNIQUE("user_id","review_id")
);
--> statement-breakpoint
CREATE TABLE "review_reply" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"parent_reply_id" uuid,
	"user_id" text,
	"business_id" uuid,
	"content" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "review_reply_like" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reply_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_reply_like_user_id_reply_id_unique" UNIQUE("user_id","reply_id")
);
--> statement-breakpoint
CREATE TABLE "review_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"business_id" uuid,
	"reason" text NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"show_reviews" boolean DEFAULT true,
	"show_collections" boolean DEFAULT true,
	"show_about" boolean DEFAULT true,
	"show_check_ins" boolean DEFAULT true,
	"show_dogs" boolean DEFAULT true,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"profile_image_id" uuid,
	"current_city" text,
	"instagram" text,
	"facebook" text,
	"x" text,
	"tiktok" text,
	"provider" varchar(255),
	"is_admin" boolean DEFAULT false,
	"active_context" text DEFAULT 'personal',
	"active_business_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"notification_preferences" jsonb DEFAULT '{"email":{"reviewReplies":true,"reviewLikes":true,"replyToYourReply":true,"reviewThreadActivity":true,"newReviewsOnFavourites":true,"marketing":false,"newsletter":false,"nearbyPlaces":false,"reportStatus":true},"push":{"reviewReplies":true,"reviewLikes":true,"replyToYourReply":true,"reviewThreadActivity":true,"newReviewsOnFavourites":true,"nearbyPlaces":false,"replyToReply":true}}'::jsonb,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_logo_image_id_image_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_claim_id_claim_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claim"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_dog" ADD CONSTRAINT "check_in_dog_check_in_id_check_in_id_fk" FOREIGN KEY ("check_in_id") REFERENCES "public"."check_in"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in_dog" ADD CONSTRAINT "check_in_dog_dog_id_dog_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog" ADD CONSTRAINT "dog_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog" ADD CONSTRAINT "dog_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_business_business_id_fk" FOREIGN KEY ("uploaded_by_business") REFERENCES "public"."business"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_parent_id_location_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_claim_id_claim_id_fk" FOREIGN KEY ("related_claim_id") REFERENCES "public"."claim"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_place_id_place_id_fk" FOREIGN KEY ("related_place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_review_id_review_id_fk" FOREIGN KEY ("related_review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_reply_id_review_reply_id_fk" FOREIGN KEY ("related_reply_id") REFERENCES "public"."review_reply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_claimed_by_business_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_view" ADD CONSTRAINT "place_view_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_view" ADD CONSTRAINT "place_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_parent_reply_id_review_reply_id_fk" FOREIGN KEY ("parent_reply_id") REFERENCES "public"."review_reply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_reply_id_review_reply_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."review_reply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_profile_image_id_image_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_active_business_id_business_id_fk" FOREIGN KEY ("active_business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_owner_idx" ON "business" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "business_email_idx" ON "business" USING btree ("email");--> statement-breakpoint
CREATE INDEX "business_logo_image_idx" ON "business" USING btree ("logo_image_id");--> statement-breakpoint
CREATE INDEX "business_places_business_idx" ON "business_place" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_places_place_idx" ON "business_place" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "business_places_claim_idx" ON "business_place" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "check_in_dog_check_in_idx" ON "check_in_dog" USING btree ("check_in_id");--> statement-breakpoint
CREATE INDEX "check_in_dog_dog_idx" ON "check_in_dog" USING btree ("dog_id");--> statement-breakpoint
CREATE INDEX "claim_status_idx" ON "claim" USING btree ("status");--> statement-breakpoint
CREATE INDEX "claim_business_idx" ON "claim" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "claim_place_idx" ON "claim" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "collection_user_id_idx" ON "collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collection_user_public_idx" ON "collection" USING btree ("user_id","is_public");--> statement-breakpoint
CREATE INDEX "collection_item_collection_id_idx" ON "collection_item" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_item_place_id_idx" ON "collection_item" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "collection_item_collection_created_idx" ON "collection_item" USING btree ("collection_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "image_cf_image_id_idx" ON "image" USING btree ("cf_image_id");--> statement-breakpoint
CREATE INDEX "image_uploaded_by_idx" ON "image" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "image_image_type_idx" ON "image" USING btree ("image_type");--> statement-breakpoint
CREATE INDEX "image_approval_idx" ON "image" USING btree ("is_approved","image_type");--> statement-breakpoint
CREATE UNIQUE INDEX "location_slug_country_idx" ON "location" USING btree ("slug","country_code");--> statement-breakpoint
CREATE UNIQUE INDEX "location_path_idx" ON "location" USING btree ("path");--> statement-breakpoint
CREATE INDEX "location_parent_idx" ON "location" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "location_type_country_idx" ON "location" USING btree ("type","country_code");--> statement-breakpoint
CREATE INDEX "location_popular_idx" ON "location" USING btree ("country_code","is_popular") WHERE "location"."is_popular" = true;--> statement-breakpoint
CREATE INDEX "location_level_idx" ON "location" USING btree ("level","country_code");--> statement-breakpoint
CREATE INDEX "location_name_lower_idx" ON "location" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "notification_user_id_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_context_idx" ON "notification" USING btree ("user_id","context");--> statement-breakpoint
CREATE INDEX "notification_user_unread_idx" ON "notification" USING btree ("user_id","is_read","context");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "place_slug_country_idx" ON "place" USING btree ("slug","country_code");--> statement-breakpoint
CREATE INDEX "place_location_idx" ON "place" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "place_country_idx" ON "place" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "place_location_rating_idx" ON "place" USING btree ("location_id","rating" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "place_featured_idx" ON "place" USING btree ("is_featured") WHERE "place"."is_featured" = true;--> statement-breakpoint
CREATE INDEX "place_claimed_by_idx" ON "place" USING btree ("claimed_by");--> statement-breakpoint
CREATE INDEX "place_image_place_id_idx" ON "place_image" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_image_image_id_idx" ON "place_image" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "place_image_primary_idx" ON "place_image" USING btree ("place_id","is_primary");--> statement-breakpoint
CREATE INDEX "place_image_display_order_idx" ON "place_image" USING btree ("place_id","display_order");--> statement-breakpoint
CREATE INDEX "place_view_place_id_idx" ON "place_view" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_view_viewed_at_idx" ON "place_view" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "place_view_place_viewed_idx" ON "place_view" USING btree ("place_id","viewed_at");--> statement-breakpoint
CREATE INDEX "place_view_session_idx" ON "place_view" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "review_place_idx" ON "review" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_created_at_idx" ON "review" USING btree ("place_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "review_helpful_idx" ON "review" USING btree ("place_id","likes_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "review_image_review_id_idx" ON "review_image" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_image_image_id_idx" ON "review_image" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "review_image_display_order_idx" ON "review_image" USING btree ("review_id","display_order");--> statement-breakpoint
CREATE INDEX "review_like_review_idx" ON "review_like" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reply_review_idx" ON "review_reply" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reply_parent_idx" ON "review_reply" USING btree ("parent_reply_id");--> statement-breakpoint
CREATE INDEX "review_reply_user_idx" ON "review_reply" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_reply_business_idx" ON "review_reply" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_reply_review_created_idx" ON "review_reply" USING btree ("review_id","created_at");--> statement-breakpoint
CREATE INDEX "review_reply_parent_created_idx" ON "review_reply" USING btree ("parent_reply_id","created_at");--> statement-breakpoint
CREATE INDEX "review_reply_like_reply_idx" ON "review_reply_like" USING btree ("reply_id");--> statement-breakpoint
CREATE UNIQUE INDEX "userId_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_profile_image_idx" ON "user" USING btree ("profile_image_id");