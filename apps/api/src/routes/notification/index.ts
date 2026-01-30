import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { UnauthorizedError } from "../../lib/errors";
import { NotificationService } from "../../services/notification.service";
import { zValidator } from "@hono/zod-validator";
import { userPartialNotificationPreferencesSchema } from "./schemas";

export const notificationRouter = new Hono();

notificationRouter.get("user/preferences", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await NotificationService.getPreferences(auth.id);

  return c.json(result, 200);
});

notificationRouter.patch(
  "/user/preferences",
  authMiddleware,
  zValidator("json", userPartialNotificationPreferencesSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const updates = c.req.valid("json");

    const result = await NotificationService.updateUserPreferences(
      auth.id,
      updates,
    );

    return c.json(result, 200);
  },
);

notificationRouter.delete("/user/preferences", authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await NotificationService.resetUserPreferences(auth.id);

  return c.json(result, 200);
});
