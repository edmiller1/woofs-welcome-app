ALTER TABLE "user" ALTER COLUMN "current_city" SET DATA TYPE jsonb
  USING CASE
    WHEN "current_city" IS NOT NULL AND "current_city" != ''
    THEN jsonb_build_object('city', "current_city", 'locality', '', 'country', '')
    ELSE NULL
  END;