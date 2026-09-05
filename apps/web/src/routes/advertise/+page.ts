import { api } from "$lib/api-helper";
import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ fetch }) => {
  const user = await getUser(fetch);

  const appStats = await api.app.getAppStats().catch(() => null);

  return {
    user,
    appStats,
  };
};
