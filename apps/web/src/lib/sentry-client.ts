import * as Sentry from "@sentry/sveltekit";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import { dev } from "$app/environment";

export function initSentry() {
  if (!PUBLIC_SENTRY_DSN) {
    console.warn("⚠️  Sentry DSN not configured - error tracking disabled");
    return;
  }

  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    environment: dev ? "development" : "production",

    // Performance monitoring
    tracesSampleRate: dev ? 1.0 : 0.1,

    // Session replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Don't send errors in development
    enabled: !dev,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send certain errors
      if (event.exception) {
        const error = hint.originalException;

        // Don't send auth errors
        if (error && typeof error === "object" && "statusCode" in error) {
          const statusCode = error.statusCode as number;
          if (statusCode === 401 || statusCode === 403) {
            return null;
          }
        }
      }

      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers["authorization"];
          delete event.request.headers["cookie"];
        }
      }

      return event;
    },
  });

  console.log("✅ Sentry (client) initialized");
}
