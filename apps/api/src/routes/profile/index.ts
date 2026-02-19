import { Hono } from "hono";
import { optionalAuthMiddleware } from "../../middleware/auth";
import { ProfileService } from "../../services/profile.service";

export const profileRouter = new Hono();

profileRouter.get("/:profileId", optionalAuthMiddleware, async (c) => {
  const auth = c.get("user");

  const profileId = c.req.param("profileId");

  const result = await ProfileService.getProfile(profileId, auth?.id);

  return c.json(result, 200);
});
