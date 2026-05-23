ALTER TABLE "location" ADD COLUMN "total_reviews" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "location" ADD COLUMN "average_rating" numeric(3, 2) DEFAULT '0' NOT NULL;