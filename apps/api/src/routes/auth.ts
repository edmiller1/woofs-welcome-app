import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { welcomeUserSchema, type WelcomeUserInput } from "./schemas";
import { AuthService } from "../services/auth.service";
import { UnauthorizedError } from "../lib/errors";

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
