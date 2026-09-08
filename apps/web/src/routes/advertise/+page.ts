import { api } from "$lib/api-helper";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const { user } = await parent();

  const appStats = await api.app.getAppStats().catch(() => null);

  return {
    user,
    appStats,
  };
};
