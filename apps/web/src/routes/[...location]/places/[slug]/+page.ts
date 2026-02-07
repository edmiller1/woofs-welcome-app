import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";
import { api } from "$lib/api-helper";

export const load: Load = async ({ params, url }) => {
  const user = await getUser();
  const { slug } = params;
  // Remove /location/ prefix and /places/[slug] suffix
  const locationPath = url.pathname
    .replace(/^\/location\//, "")
    .replace(/\/places\/[^/]+$/, "");

  const initialPlace = await api.place.getPlace(`${locationPath}/${slug}`);

  return {
    user,
    slug,
    locationPath,
    initialPlace,
  };
};
