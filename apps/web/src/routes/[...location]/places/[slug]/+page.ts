import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const ssr = false;

export const load: Load = async ({ params, url }) => {
  const user = await getUser();
  const { slug } = params;
  const locationPath = url.pathname
    .replace(/^\/location\//, "")
    .replace(/\/places\/[^/]+$/, "");

  const reviewId = url.searchParams.get("reviewId");

  return {
    user,
    slug,
    locationPath,
    initialPlace: null,
    reviewId,
  };
};
