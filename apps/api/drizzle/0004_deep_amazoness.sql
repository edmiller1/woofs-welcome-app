ALTER TYPE "public"."notification_type" ADD VALUE 'reply_to_reply';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'review_author_reply';--> statement-breakpoint
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
ALTER TABLE "review" ADD COLUMN "replies_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "review" ADD COLUMN "has_business_reply" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_parent_reply_id_review_reply_id_fk" FOREIGN KEY ("parent_reply_id") REFERENCES "public"."review_reply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply" ADD CONSTRAINT "review_reply_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_reply_id_review_reply_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."review_reply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reply_like" ADD CONSTRAINT "review_reply_like_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_reply_review_idx" ON "review_reply" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reply_parent_idx" ON "review_reply" USING btree ("parent_reply_id");--> statement-breakpoint
CREATE INDEX "review_reply_user_idx" ON "review_reply" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "review_reply_business_idx" ON "review_reply" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "review_reply_review_created_idx" ON "review_reply" USING btree ("review_id","created_at");--> statement-breakpoint
CREATE INDEX "review_reply_parent_created_idx" ON "review_reply" USING btree ("parent_reply_id","created_at");--> statement-breakpoint
CREATE INDEX "review_reply_like_reply_idx" ON "review_reply_like" USING btree ("reply_id");