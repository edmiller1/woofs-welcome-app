import z from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(50, "Description must be less than 50 characters")
    .optional(),
});

export const savePlaceToCollectionSchema = z.object({
  placeId: z.string(),
  collectionId: z.string().optional(),
});

export const removePlaceFromCollectionSchema = z.object({
  placeId: z.string(),
  collectionId: z.string(),
});

export const placeIdSchema = z.object({
  placeId: z.string(),
});
