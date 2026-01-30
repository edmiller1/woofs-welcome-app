import z from "zod";

export const locationPathSchema = z
  .string()
  .min(1, "Path is required")
  .max(200, "Path is too long")
  .regex(
    /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/,
    "Path can only contain lowercase letters, numbers, hyphens, and forward slashes",
  );

export const locationPlacesSortSchema = z.object({
  placeSort: z.enum(["popular", "new", "verified", "surprise"]).optional(),
});
