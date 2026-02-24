import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  image: z.file().optional(),
  currentCity: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  x: z.string().optional(),
  tiktok: z.string().optional(),
  // Dogs and settings are JSON strings due to multipart/form-data
  dogs: z.string().optional(), // JSON: Array<{ id?: string, name: string, breed: string }>
  removeDogIds: z.string().optional(), // JSON: string[]
  dogImages: z.file().array().optional(),
  showAbout: z.string().optional(), // "true" | "false"
  showDogs: z.string().optional(),
  showCheckIns: z.string().optional(),
  showReviews: z.string().optional(),
  showCollections: z.string().optional(),
});
