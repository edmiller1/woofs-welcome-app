ALTER TABLE "place" ADD COLUMN "dog_amenities" text[];--> statement-breakpoint
ALTER TABLE "place" DROP COLUMN "indoor_allowed";--> statement-breakpoint
ALTER TABLE "place" DROP COLUMN "outdoor_allowed";--> statement-breakpoint
ALTER TABLE "place" DROP COLUMN "has_dog_menu";