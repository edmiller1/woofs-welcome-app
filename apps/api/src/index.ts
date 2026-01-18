import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env";

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

app.get("/", (c) => c.json({ status: "ok" }));

export default {
  port: 9000,
  fetch: app.fetch,
};
