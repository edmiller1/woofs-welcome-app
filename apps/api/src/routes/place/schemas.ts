import z from "zod";

export const placePathSchema = z
  .string()
  .min(1, "Path is required")
  .max(200, "Path is too long")
  .regex(
    /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/,
    "Path can only contain lowercase letters, numbers, hyphens, and forward slashes",
  );

export const placeSlugSchema = z
  .string()
  .min(1, "Place slug is required")
  .max(100, "Slug is too long")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );

export const placeReviewsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
  placeId: z.uuid(),
});
