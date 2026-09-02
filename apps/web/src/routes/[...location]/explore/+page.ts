import type { Load } from "@sveltejs/kit";
import { getUser } from "$lib/auth/guard";

const ssr = false;

export const load: Load = async ({ params, fetch }) => {
  const user = await getUser(fetch);

  return {
    user,
    pathname: params.location,
  };
};
