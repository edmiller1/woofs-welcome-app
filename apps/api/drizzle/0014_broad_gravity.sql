CREATE TYPE "public"."suggested_edit_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "place_suggested_edit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"field" text NOT NULL,
	"current_value" jsonb,
	"suggested_value" jsonb NOT NULL,
	"notes" text,
	"status" "suggested_edit_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_suggested_edit" ADD CONSTRAINT "place_suggested_edit_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_suggested_edit" ADD CONSTRAINT "place_suggested_edit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_suggested_edit" ADD CONSTRAINT "place_suggested_edit_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "place_suggested_edit_place_id_idx" ON "place_suggested_edit" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "place_suggested_edit_user_id_idx" ON "place_suggested_edit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "place_suggested_edit_status_idx" ON "place_suggested_edit" USING btree ("status");