ALTER TYPE "public"."notification_type" ADD VALUE 'marketing';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'newsletter';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'nearby_places';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'report_status';--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "url" text;