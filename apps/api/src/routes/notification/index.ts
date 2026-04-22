import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { UnauthorizedError } from "../../lib/errors";
import { NotificationService } from "../../services/notification.service";
import { zValidator } from "@hono/zod-validator";
import {
  notificationIdSchema,
  userPartialNotificationPreferencesSchema,
} from "./schemas";
import { ImageUploadService } from "../../services/image-upload.service";
import { not } from "drizzle-orm";

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

notificationRouter.get("/user/notifications", authMiddleware, async (c) => {
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

  const result = await notificationService.getNotifications(auth.id);

  return c.json(result, 200);
});

notificationRouter.put(
  "/user/notifications/:notificationId/read",
  zValidator("param", notificationIdSchema),
  authMiddleware,
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

    const { notificationId } = c.req.valid("param");

    const result = await notificationService.markAsRead(
      notificationId,
      auth.id,
    );

    return c.json(result, 200);
  },
);

notificationRouter.put(
  "/user/notifications/:notificationId/unread",
  zValidator("param", notificationIdSchema),
  authMiddleware,
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

    const { notificationId } = c.req.valid("param");

    const result = await notificationService.markAsUnread(
      notificationId,
      auth.id,
    );

    return c.json(result, 200);
  },
);

notificationRouter.put(
  "/user/notifications/read",
  authMiddleware,
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

    const result = await notificationService.markAllAsRead(auth.id);

    return c.json(result, 200);
  },
);

notificationRouter.delete(
  "/user/notifications/:notificationId",
  zValidator("param", notificationIdSchema),
  authMiddleware,
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

    const { notificationId } = c.req.valid("param");

    const result = await notificationService.markAsUnread(
      notificationId,
      auth.id,
    );

    return c.json(result, 200);
  },
);
