ALTER TABLE "place" RENAME COLUMN "dog_policy" TO "dog_rules";
ALTER TABLE "place" ALTER COLUMN "dog_rules" TYPE text[] USING CASE WHEN "dog_rules" IS NULL THEN NULL ELSE ARRAY["dog_rules"] END;