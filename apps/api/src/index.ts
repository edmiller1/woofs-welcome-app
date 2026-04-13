import { Hono, type Context, type ExecutionContext } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { showRoutes } from "hono/dev";
import { validateEnv, type Env } from "./config/env";
import {
  authRateLimiter,
  globalRateLimiter,
  sessionRateLimiter,
} from "./middleware/rate-limit";
import { authMiddleware } from "./middleware/auth";
import { authRouter } from "./routes/auth/auth";
import { notificationRouter } from "./routes/notification";
import { locationRouter } from "./routes/location";
import { placeRouter } from "./routes/place";
import { collectionRouter } from "./routes/collection";
import { reviewRouter } from "./routes/review";
import { profileRouter } from "./routes/profile";
import { eventRouter } from "./routes/event";
import { createDb } from "./db";
import { Redis } from "@upstash/redis/cloudflare";
import { getAuth } from "./lib/auth";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  const env = validateEnv(c.env);
  const db = createDb(env);
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
  c.set("env", env);
  c.set("db", db);
  c.set("redis", redis);
  await next();
});

app.use("*", async (c, next) =>
  cors({
    origin:
      c.env.NODE_ENV === "development"
        ? ["http://localhost:5173"]
        : ["https://woofswelcome.app", "https://www.woofswelcome.app"],
    maxAge: 86400,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    allowHeaders: ["Content-Type", "Authorization", "X-User-Context"],
    credentials: true,
  })(c, next),
);

app.use("*", logger());
app.use("*", (c, next) =>
  globalRateLimiter(c.get("redis"))(c as Context, next),
); // (200 req / 15min total)

app.all("/api/auth/*", (c) => {
  const auth = getAuth(c.get("env"), c.get("db"));
  return auth.handler(c.req.raw);
});

app.use("/api/auth/get-session", (c, next) =>
  sessionRateLimiter(c.get("redis"))(c as Context, next),
);
app.use("/api/auth/email-otp/*", (c, next) =>
  authRateLimiter(c.get("redis"))(c as Context, next),
);
app.use("/api/auth/sign-in/*", (c, next) =>
  authRateLimiter(c.get("redis"))(c as Context, next),
);
app.use("/api/user", authMiddleware);

// custom routes
app.route("/api/user", authRouter);
app.route("/api/notification", notificationRouter);
app.route("/api/location", locationRouter);
app.route("/api/place", placeRouter);
app.route("/api/collection", collectionRouter);
app.route("/api/review", reviewRouter);
app.route("/api/profile", profileRouter);
app.route("/api/event", eventRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

showRoutes(app);

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});

export default app;
