import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { AuthService } from "../../services/auth.service";
import { UnauthorizedError } from "../../lib/errors";
import { welcomeUserSchema } from "./schemas";
import { ImageUploadService } from "../../services/image-upload.service";

export const authRouter = new Hono();

authRouter.post(
  "/welcome",
  authMiddleware,
  zValidator("form", welcomeUserSchema),
  async (c) => {
    //Context
    const auth = c.get("user");
    const db = c.get("db");
    const env = c.get("env");

    // Services
    const imageUploadService = new ImageUploadService(db, env);
    const authService = new AuthService(db, imageUploadService);

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, image } = c.req.valid("form");

    const result = await authService.welcomeUser(auth.id, name, image);

    return c.json(result, 200);
  },
);
