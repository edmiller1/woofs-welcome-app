import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  customSession,
  emailOTP,
  multiSession,
  oneTap,
} from "better-auth/plugins";
import { type Db } from "../db";
import { getResend } from "./resend";
import { eq } from "drizzle-orm";
import { user, UserSettings } from "../db/schema";
import * as schema from "../db/schema";
import { type Env } from "../config/env";
import { otpEmailHtml } from "../emails/otp-email";
import { welcomeEmail } from "../emails/welcome-email";
import { getUserAuthContext, type UserAuthContext } from "./helpers/auth";
import type { Redis } from "@upstash/redis/cloudflare";

let cachedAuth: ReturnType<typeof betterAuth> | null = null;

const AUTH_CONTEXT_CACHE_SECONDS = 300;

export function getAuth(env: Env, db: Db, redis: Redis) {
  const resend = getResend(env);
  if (cachedAuth) return cachedAuth;

  cachedAuth = betterAuth({
    baseURL: env.BETTER_AUTH_BASE_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain:
          env.NODE_ENV === "production" ? "woofswelcome.app" : "localhost",
      },
      defaultCookieAttributes: {
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        secure: env.NODE_ENV === "production",
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: env.GOOGLE_REDIRECT_URI,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: AUTH_CONTEXT_CACHE_SECONDS,
      },
    },
    plugins: [
      customSession(async ({ user, session }) => {
        const cacheKey = `auth-context:${user.id}`;
        const cached = await redis.get<UserAuthContext | null>(cacheKey);

        const authContext =
          cached ??
          (await getUserAuthContext(db, user.id).then(async (result) => {
            await redis.set(cacheKey, result, {
              ex: AUTH_CONTEXT_CACHE_SECONDS,
            });
            return result;
          }));

        return {
          user: {
            ...user,
            provider: authContext?.provider || "google",
            activeContext: authContext?.activeContext || "personal",
            isAdmin: authContext?.isAdmin ?? false,
            profileImageId: authContext?.profileImageId,
            altText: authContext?.altText,
          },
          session,
        };
      }),
      multiSession(),
      oneTap(),
      emailOTP({
        sendVerificationOnSignUp: true,
        otpLength: 6,
        expiresIn: 300, // 5 minutes
        async sendVerificationOTP({ email, otp, type }) {
          const subject = "Sign in to Woofs Welcome";

          const { error } = await resend.emails.send({
            from: "Woofs Welcome <hello@woofswelcome.app>",
            to: email,
            subject,
            html: otpEmailHtml(otp, "sign-in"),
          });

          if (error) {
            console.error("Failed to send OTP email");
            throw new Error("Failed to send verification email");
          }
        },
      }),
    ],
    basePath: "/api/auth",
    trustedOrigins: [
      env.FRONTEND_BASE_URL,
      env.FRONTEND_BASE_URL_WWW,
      env.MOBILE_BASE_URL,
    ],
    secret: env.BETTER_AUTH_SECRET,
    create: {
      after: async (newUser: User) => {
        if (newUser.image && newUser.image.includes("googleuser")) {
          await db
            .update(user)
            .set({ provider: "google" })
            .where(eq(user.id, newUser.id));
        } else {
          await db
            .update(user)
            .set({ provider: "email" })
            .where(eq(user.id, newUser.id));
        }
        // Create default user settings
        await db.insert(UserSettings).values({ userId: newUser.id });

        // Send welcome email
        const { error } = await resend.emails.send({
          from: "Woofs Welcome <hello@woofswelcome.app>",
          to: newUser.email!,
          subject: "Welcome",
          html: welcomeEmail(),
        });
        if (error) {
          console.error("Failed to send welcome email:", error);
        }
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
  });

  return cachedAuth;
}

type AuthInstance = NonNullable<ReturnType<typeof getAuth>>;

export type AuthType = {
  user: AuthInstance["$Infer"]["Session"]["user"] | null;
  session: AuthInstance["$Infer"]["Session"]["session"] | null;
};
