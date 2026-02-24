import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { UnauthorizedError } from "../../lib/errors";
import { NotificationService } from "../../services/notification.service";
import { zValidator } from "@hono/zod-validator";
import { userPartialNotificationPreferencesSchema } from "./schemas";
import { ImageUploadService } from "../../services/image-upload.service";

export const notificationRouter = new Hono();

notificationRouter.get("user/preferences", authMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const notificationService = new NotificationService(db, imageUploadService);

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await notificationService.getPreferences(auth.id);

  return c.json(result, 200);
});

notificationRouter.patch(
  "/user/preferences",
  authMiddleware,
  zValidator("json", userPartialNotificationPreferencesSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const notificationService = new NotificationService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const updates = c.req.valid("json");

    const result = await notificationService.updateUserPreferences(
      auth.id,
      updates,
    );

    return c.json(result, 200);
  },
);

notificationRouter.delete("/user/preferences", authMiddleware, async (c) => {
  //Context
  const auth = c.get("user");
  const db = c.get("db");
  const env = c.get("env");

  // Services
  const imageUploadService = new ImageUploadService(db, env);
  const notificationService = new NotificationService(db, imageUploadService);

  if (!auth) {
    throw new UnauthorizedError("Unauthorized");
  }

  const result = await notificationService.resetUserPreferences(auth.id);

  return c.json(result, 200);
});
