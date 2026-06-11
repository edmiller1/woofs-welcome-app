import type { Load } from "@sveltejs/kit";
import { getUser } from "$lib/auth/guard";

export const ssr = false;

export const load: Load = async ({ params }) => {
  const user = await getUser();

  return {
    user,
    pathname: params.location,
  };
};
