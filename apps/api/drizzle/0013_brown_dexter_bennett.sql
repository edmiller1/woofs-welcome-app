CREATE TABLE "review_dog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"dog_id" uuid NOT NULL,
	CONSTRAINT "review_dog_review_id_dog_id_unique" UNIQUE("review_id","dog_id")
);
--> statement-breakpoint
ALTER TABLE "review_dog" ADD CONSTRAINT "review_dog_review_id_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_dog" ADD CONSTRAINT "review_dog_dog_id_dog_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_dog_review_idx" ON "review_dog" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_dog_dog_idx" ON "review_dog" USING btree ("dog_id");