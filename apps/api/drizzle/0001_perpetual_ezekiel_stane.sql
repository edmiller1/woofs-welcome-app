CREATE TYPE "public"."image_source" AS ENUM('user_upload', 'business_upload', 'admin_upload', 'import');--> statement-breakpoint
CREATE TYPE "public"."image_type" AS ENUM('place_hero', 'place_gallery', 'review_photo', 'user_avatar', 'business_logo');--> statement-breakpoint
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
ALTER TABLE "place_image" DROP CONSTRAINT "place_image_uploaded_by_business_id_fk";
--> statement-breakpoint
DROP INDEX "place_image_is_primary_idx";--> statement-breakpoint
DROP INDEX "review_image_place_idx";--> statement-breakpoint
ALTER TABLE "place_image" ALTER COLUMN "is_primary" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "place_image" ALTER COLUMN "display_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "business" ADD COLUMN "logo_image_id" uuid;--> statement-breakpoint
ALTER TABLE "place_image" ADD COLUMN "image_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "review_image" ADD COLUMN "image_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "review_image" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profile_image_id" uuid;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_uploaded_by_business_business_id_fk" FOREIGN KEY ("uploaded_by_business") REFERENCES "public"."business"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_moderated_by_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "image_cf_image_id_idx" ON "image" USING btree ("cf_image_id");--> statement-breakpoint
CREATE INDEX "image_uploaded_by_idx" ON "image" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "image_image_type_idx" ON "image" USING btree ("image_type");--> statement-breakpoint
CREATE INDEX "image_approval_idx" ON "image" USING btree ("is_approved","image_type");--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_logo_image_id_image_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_image" ADD CONSTRAINT "place_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_image_id_image_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_profile_image_id_image_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_logo_image_idx" ON "business" USING btree ("logo_image_id");--> statement-breakpoint
CREATE INDEX "place_image_place_id_idx" ON "place_image" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_image_image_id_idx" ON "place_image" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "place_image_primary_idx" ON "place_image" USING btree ("place_id","is_primary");--> statement-breakpoint
CREATE INDEX "review_image_review_id_idx" ON "review_image" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_image_image_id_idx" ON "review_image" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "review_image_display_order_idx" ON "review_image" USING btree ("review_id","display_order");--> statement-breakpoint
CREATE INDEX "user_profile_image_idx" ON "user" USING btree ("profile_image_id");--> statement-breakpoint
ALTER TABLE "business" DROP COLUMN "logo_url";--> statement-breakpoint
ALTER TABLE "business" DROP COLUMN "logo_public_id";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "public_id";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "alt_text";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "source";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "uploaded_by";--> statement-breakpoint
ALTER TABLE "place_image" DROP COLUMN "is_approved";--> statement-breakpoint
ALTER TABLE "review_image" DROP COLUMN "public_id";--> statement-breakpoint
ALTER TABLE "review_image" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "review_image" DROP COLUMN "alt_text";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image_public_id";