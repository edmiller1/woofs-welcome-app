import { initSentry } from "$lib/sentry-client";
import { handleErrorWithSentry } from "@sentry/sveltekit";
import type { HandleClientError } from "@sveltejs/kit";

try {
  initSentry();
} catch {
  // Sentry blocked by ad blocker or network — fail silently
}

export const handleError: HandleClientError = ({ error, event, status, message }) => {
  try {
    return handleErrorWithSentry()({ error, event, status, message });
  } catch {
    return { message: message ?? "An unexpected error occurred" };
  }
};

// Optional: If you want to add custom error handling
// export const handleError = handleErrorWithSentry((input) => {
//   console.error('Client error:', input.error);
//   return {
//     message: 'An unexpected error occurred',
//   };
// });
