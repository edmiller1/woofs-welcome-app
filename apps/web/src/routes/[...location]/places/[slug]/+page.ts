import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params, url }) => {
  const user = await getUser();
  const { slug } = params;
  const locationPath = url.pathname.split("/places")[0].replace("/location/", "");

  return {
    user,
    slug,
    locationPath,
  };
};
