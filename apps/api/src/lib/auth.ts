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
import {
  getContext,
  getUserProfileImageId,
  getUserProvider,
  isUserAdmin,
} from "./helpers/auth";

let cachedAuth: ReturnType<typeof betterAuth> | null = null;

export function getAuth(env: Env, db: Db) {
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
      },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: env.GOOGLE_REDIRECT_URI,
      },
    },
    plugins: [
      customSession(async ({ user, session }) => {
        const provider = await getUserProvider(db, user.id);
        const context = await getContext(db, user.id);
        const isAdmin = await isUserAdmin(db, user.id);
        const imageData = await getUserProfileImageId(db, user.id);
        return {
          user: {
            ...user,
            provider: provider || "google",
            activeContext: context || "personal",
            isAdmin,
            profileImageId: imageData?.profileImageId,
            altText: imageData?.altText,
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
          console.log("Sending OTP:", {
            email,
            otp: otp.slice(0, 2) + "****",
            type,
          });
          const subject = "Sign in to Woofs Welcome";

          const { error } = await resend.emails.send({
            from: "Woofs Welcome <hello@woofswelcome.app>",
            to: email,
            subject,
            html: otpEmailHtml(otp, "sign-in"),
          });

          if (error) {
            console.error("Failed to send OTP email:", error);
            throw new Error("Failed to send verification email");
          }
          console.log("OTP email sent successfully");
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
