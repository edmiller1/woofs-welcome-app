import { getUser } from "$lib/auth/guard";
import { api } from "$lib/api-helper";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params, url }) => {
  const user = await getUser();
  const { slug } = params;
  const locationPath = url.pathname
    .replace(/^\/location\//, "")
    .replace(/\/places\/[^/]+$/, "");

  const reviewId = url.searchParams.get("reviewId");

  const initialPlace = await api.place.getPlace(`${locationPath}/${slug}`);

  return {
    user,
    slug,
    locationPath,
    initialPlace,
    reviewId,
  };
};
