import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ fetch, data }) => {
  const hasSessionCookie = (data as { hasSessionCookie?: boolean })
    ?.hasSessionCookie;

  const user = hasSessionCookie === false ? null : await getUser(fetch);

  return {
    user,
    hasSessionCookie,
  };
};
