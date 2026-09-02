import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ fetch }) => {
  const user = await getUser(fetch);
  return { user };
};
