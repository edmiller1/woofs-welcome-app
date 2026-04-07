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

export const getProfileCollectionsSchema = z.object({
  userId: z.string(),
});

export const getCollectionWithPlacesSchema = z.object({
  profileId: z.string(),
  id: z.string(),
});

export const getCollectionWithPlacesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
