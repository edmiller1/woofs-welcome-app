import { z } from "zod";

export const uploadImageSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type,
        ),
      "File must be JPEG, PNG, WebP, or AVIF",
    ),
  imageType: z.string(),
  altText: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const uploadMultipleImagesSchema = z.object({
  files: z.array(z.instanceof(File)).min(1).max(20), // Max 20 images at once
  imageType: z.string(),
  altText: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const attachImageToPlaceSchema = z.object({
  imageId: z.string(),
  isPrimary: z.boolean().optional(),
  caption: z.string().optional(),
  displayOrder: z.number().optional(),
});

export const attachImageToReviewSchema = z.object({
  imageId: z.string(),
  displayOrder: z.number().optional(),
});

export const attachImageToUserProfileSchema = z.object({
  imageId: z.string(),
});
