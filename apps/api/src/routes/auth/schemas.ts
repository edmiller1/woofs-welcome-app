import { z } from "zod";

// Welcome user
export const welcomeUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    ),
  image: z.file().optional(),
});

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  image: z.file().optional(),
});
