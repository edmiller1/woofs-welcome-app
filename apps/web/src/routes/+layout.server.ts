import { getSessionCookie } from "better-auth/cookies";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ request }) => {
  return {
    hasSessionCookie: getSessionCookie(request) !== null,
  };
};
