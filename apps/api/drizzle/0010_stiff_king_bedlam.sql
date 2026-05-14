CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "off_lead_allowed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "water_available" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "distance_km" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "duration_mins" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "place" ADD COLUMN "difficulty" "difficulty" DEFAULT 'beginner';