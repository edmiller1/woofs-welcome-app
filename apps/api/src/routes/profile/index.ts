import { Hono } from "hono";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { ProfileService } from "../../services/profile.service";
import { zValidator } from "@hono/zod-validator";
import { updateProfileSchema } from "./schemas";
import { UnauthorizedError } from "../../lib/errors";

export const profileRouter = new Hono();

profileRouter.get("/:profileId", optionalAuthMiddleware, async (c) => {
  const auth = c.get("user");

  const profileId = c.req.param("profileId");

  const result = await ProfileService.getProfile(profileId, auth?.id);

  return c.json(result, 200);
});

profileRouter.patch(
  "/update",
  authMiddleware,
  zValidator("form", updateProfileSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const formData = c.req.valid("form");

    const result = await ProfileService.updateProfile(auth.id, formData);

    return c.json(result, 200);
  },
);

profileRouter.get("/dogs", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await ProfileService.getProfileDogs(auth.id);

  return c.json(result, 200);
});
