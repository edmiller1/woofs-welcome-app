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

export const updateReviewSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  rating: z.coerce.number().optional(),
  numDogs: z.coerce.number().optional(),
  dogBreeds: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional()
    .default([]),
  visitDate: z.coerce.date().optional(),
  images: z
    .array(z.instanceof(File))
    .or(z.instanceof(File).transform((f) => [f]))
    .optional(),
  deletedImages: z
    .array(z.string())
    .or(z.string().transform((s) => [s]))
    .optional(),
});

export const updateReviewParamsSchema = z.object({
  reviewId: z.string(),
});

export const deleteReviewSchema = z.object({
  reviewId: z.string(),
});

export const getReviewSchema = z.object({
  reviewId: z.string(),
});

export const reportReviewSchema = z.object({
  reason: z.enum([
    "sexuallyExplicit",
    "hateSpeech",
    "violence",
    "falseInformation",
    "notPersonal",
    "wrongPlace",
    "spam",
    "other",
  ]),
  details: z
    .string()
    .max(500, "Details must be less than 500 characters")
    .optional()
    .default(""),
});

export const communityReviewsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
