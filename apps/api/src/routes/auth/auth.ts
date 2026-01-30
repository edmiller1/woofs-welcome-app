import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { AuthService } from "../../services/auth.service";
import { UnauthorizedError } from "../../lib/errors";
import { updateProfileSchema, welcomeUserSchema } from "./schemas";

export const authRouter = new Hono();

authRouter.post(
  "/welcome",
  authMiddleware,
  zValidator("form", welcomeUserSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, image } = c.req.valid("form");

    const result = await AuthService.welcomeUser(auth.id, name, image);

    return c.json(result, 200);
  },
);

authRouter.patch(
  "/update",
  authMiddleware,
  zValidator("form", updateProfileSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) {
      throw new UnauthorizedError("Unauthorized");
    }

    const { name, image } = c.req.valid("form");

    console.log("Update profile request:", { name, image });

    const result = await AuthService.updateProfile(auth.id, name, image);

    return c.json(result, 200);
  },
);
