import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params, url }) => {
  const user = await getUser();
  const { slug } = params;
  // Remove /location/ prefix and /places/[slug] suffix
  const locationPath = url.pathname
    .replace(/^\/location\//, "")
    .replace(/\/places\/[^/]+$/, "");

  return {
    user,
    slug,
    locationPath,
  };
};
