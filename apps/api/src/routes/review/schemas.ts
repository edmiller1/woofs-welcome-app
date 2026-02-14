import { z } from "zod";

export const createReviewSchema = z.object({
  placeId: z.string(),
  title: z.string(),
  content: z.string(),
  rating: z.coerce.number(),
  numDogs: z.coerce.number(),
  dogBreeds: z.array(z.string()).or(z.string().transform((s) => [s])),
  visitDate: z.coerce.date(),
  images: z
    .array(z.instanceof(File))
    .or(z.instanceof(File).transform((f) => [f]))
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
