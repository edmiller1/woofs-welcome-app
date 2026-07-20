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
import { contactRouter } from "./routes/contact";
import { adminRouter } from "./routes/admin";
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

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://woofswelcome.app",
  "https://www.woofswelcome.app",
];

app.use("*", async (c, next) =>
  cors({
    origin: ALLOWED_ORIGINS,
    maxAge: 86400,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    allowHeaders: ["Content-Type", "Authorization", "X-User-Context"],
    credentials: true,
  })(c, next),
);

app.use("*", logger());
app.use("*", (c, next) => globalRateLimiter(c.get("redis"))(c as Context, next));

app.all("/api/auth/*", async (c) => {
  const auth = getAuth(c.get("env"), c.get("db"));
  const response = await auth.handler(c.req.raw);

  const origin = c.req.header("Origin") ?? "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Context");
    headers.set("Vary", "Origin");
    return new Response(response.body, { status: response.status, headers });
  }

  return response;
});

app.use("/api/auth/get-session", (c, next) => sessionRateLimiter(c.get("redis"))(c as Context, next));
app.use("/api/auth/email-otp/*", (c, next) => authRateLimiter(c.get("redis"))(c as Context, next));
app.use("/api/auth/sign-in/*", (c, next) => authRateLimiter(c.get("redis"))(c as Context, next));
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
app.route("/api/contact", contactRouter);
app.route("/api/admin", adminRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

showRoutes(app);

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
