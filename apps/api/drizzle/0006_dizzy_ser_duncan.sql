CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"place_id" uuid,
	"address" text,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"organiser_id" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"max_attendees" integer,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendee" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_attendee_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_place_id_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."place"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organiser_id_user_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_starts_at_idx" ON "event" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "event_organiser_idx" ON "event" USING btree ("organiser_id");--> statement-breakpoint
CREATE INDEX "event_place_idx" ON "event" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "event_attendee_event_id_idx" ON "event_attendee" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendee_user_id_idx" ON "event_attendee" USING btree ("user_id");