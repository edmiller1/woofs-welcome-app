CREATE TYPE "public"."notification_context" AS ENUM('personal', 'business');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('claim_submitted', 'claim_approved', 'claim_rejected', 'review_reply', 'review_like', 'new_review_on_favourite', 'place_update');--> statement-breakpoint
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
	"logo_url" text,
	"logo_public_id" text,
	"verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"subscription_tier" text DEFAULT 'free',
	"subscription_expires_at" timestamp,
	"notification_preferences" jsonb DEFAULT '{"email":{"reviewReplies":true,"reviewLikes":true,"newReviewsOnFavourites":true,"placeUpdates":true,"claimStatus":true,"reportStatus":true,"marketing":false,"newsletter":false},"push":{"reviewReplies":true,"reviewLikes":true,"newReviewsOnPlaces":true,"nearbyPlaces":false,"claimStatus":true}}'::jsonb,
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
CREATE TABLE "dog_breed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
	"display_order" integer DEFAULT 0,
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
	"public_id" text NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"alt_text" text,
	"is_primary" boolean DEFAULT false,
	"source" text NOT NULL,
	"uploaded_by" uuid,
	"is_approved" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
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
	"is_first_visit" boolean DEFAULT true,
	"likes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_user_id_place_id_unique" UNIQUE("user_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "review_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"public_id" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
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
	"image_public_id" text,
	"provider" varchar(255),
	"is_admin" boolean DEFAULT false,
	"active_context" text DEFAULT 'personal',
	"active_business_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp,
	"notification_preferences" jsonb DEFAULT '{"email":{"reviewReplies":true,"reviewLikes":true,"newReviewsOnFavourites":true,"marketing":false,"newsletter":false,"nearbyPlaces":false,"reportStatus":true},"push":{"reviewReplies":true,"reviewLikes":true,"newReviewsOnFavourites":true,"nearbyPlaces":false}}'::jsonb,
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
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_place" ADD CONSTRAINT "business_place_claim_id_claim_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claim"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim" ADD CONSTRAINT "claim_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location" ADD CONSTRAINT "location_parent_id_location_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_claim_id_claim_id_fk" FOREIGN KEY ("related_claim_id") REFERENCES "public"."claim"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_place_id_place_id_fk" FOREIGN KEY ("related_place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_related_review_id_review_id_fk" FOREIGN KEY ("related_review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_location_id_location_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place" ADD CONSTRAINT "place_claimed_by_business_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_uploaded_by_business_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_view" ADD CONSTRAINT "place_view_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_view" ADD CONSTRAINT "place_view_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_report" ADD CONSTRAINT "review_report_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_active_business_id_business_id_fk" FOREIGN KEY ("active_business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_owner_idx" ON "business" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "business_email_idx" ON "business" USING btree ("email");--> statement-breakpoint
CREATE INDEX "business_places_business_idx" ON "business_place" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "business_places_place_idx" ON "business_place" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "business_places_claim_idx" ON "business_place" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claim_status_idx" ON "claim" USING btree ("status");--> statement-breakpoint
CREATE INDEX "claim_business_idx" ON "claim" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "claim_place_idx" ON "claim" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "collection_user_id_idx" ON "collection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collection_user_public_idx" ON "collection" USING btree ("user_id","is_public");--> statement-breakpoint
CREATE INDEX "collection_item_collection_id_idx" ON "collection_item" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "collection_item_place_id_idx" ON "collection_item" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "collection_item_collection_created_idx" ON "collection_item" USING btree ("collection_id","created_at" DESC NULLS LAST);--> statement-breakpoint
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
CREATE INDEX "place_image_display_order_idx" ON "place_image" USING btree ("place_id","display_order");--> statement-breakpoint
CREATE INDEX "place_image_is_primary_idx" ON "place_image" USING btree ("place_id","is_primary");--> statement-breakpoint
CREATE INDEX "place_view_place_id_idx" ON "place_view" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_view_viewed_at_idx" ON "place_view" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "place_view_place_viewed_idx" ON "place_view" USING btree ("place_id","viewed_at");--> statement-breakpoint
CREATE INDEX "place_view_session_idx" ON "place_view" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "review_place_idx" ON "review" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_created_at_idx" ON "review" USING btree ("place_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "review_helpful_idx" ON "review" USING btree ("place_id","likes_count" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "review_image_place_idx" ON "review_image" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_like_review_idx" ON "review_like" USING btree ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "user" USING btree ("email");