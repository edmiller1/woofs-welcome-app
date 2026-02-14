import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { showRoutes } from "hono/dev";
import { env, validateEnv } from "./config/env";
import { auth } from "./lib/auth";
import {
  authRateLimiter,
  globalRateLimiter,
  sessionRateLimiter,
} from "./middleware/rate-limit";
import { authMiddleware } from "./middleware/auth";
import { authRouter } from "./routes/auth/auth";
import { imageRouter } from "./routes/image";
import { notificationRouter } from "./routes/notification";
import { locationRouter } from "./routes/location";
import { placeRouter } from "./routes/place";
import { collectionRouter } from "./routes/collection";
import { reviewRouter } from "./routes/review";

validateEnv();

const app = new Hono();

app.use(
  "*",
  cors({
    origin:
      env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://www.woofswelcome.app",
    maxAge: 86400,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    allowHeaders: ["Content-Type", "Authorization", "X-User-Context"],
    credentials: true,
  }),
);

app.use("*", logger());
app.use("*", globalRateLimiter); // (200 req / 15min total)

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use("/api/auth/get-session", sessionRateLimiter);
app.use("/api/auth/email-otp/*", authRateLimiter);
app.use("/api/auth/sign-in/*", authRateLimiter);
app.use("/api/user", authMiddleware);

// custom routes
app.route("/api/user", authRouter);
app.route("/api/image", imageRouter);
app.route("/api/notification", notificationRouter);
app.route("/api/location", locationRouter);
app.route("/api/place", placeRouter);
app.route("/api/collection", collectionRouter);
app.route("/api/review", reviewRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

showRoutes(app);

export default {
  port: env.PORT || 9000,
  fetch: app.fetch,
};
