import { Hono } from "hono";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { ProfileService } from "../../services/profile.service";
import { zValidator } from "@hono/zod-validator";
import { updateProfileSchema } from "./schemas";
import { UnauthorizedError } from "../../lib/errors";
import { ImageUploadService } from "../../services/image-upload.service";

export const profileRouter = new Hono();

profileRouter.get("/:profileId", optionalAuthMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const profileService = new ProfileService(db, imageUploadService);

  const profileId = c.req.param("profileId");

  const result = await profileService.getProfile(profileId, auth?.id);

  return c.json(result, 200);
});

profileRouter.patch(
  "/update",
  authMiddleware,
  zValidator("form", updateProfileSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const profileService = new ProfileService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const formData = c.req.valid("form");

    const result = await profileService.updateProfile(auth.id, formData);

    return c.json(result, 200);
  },
);

profileRouter.get("/dogs", authMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const profileService = new ProfileService(db, imageUploadService);

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await profileService.getProfileDogs(auth.id);

  return c.json(result, 200);
});
