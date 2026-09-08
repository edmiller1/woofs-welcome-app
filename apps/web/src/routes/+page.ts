import { api } from "$lib/api-helper";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ parent }) => {
  const [{ user }, featuredLocations, popularPlaces, appStats] =
    await Promise.all([
      parent(),
      api.location.getFeaturedLocations().catch(() => []),
      api.place.getPopularPlaces().catch(() => []),
      api.app.getAppStats().catch(() => []),
    ]);

  return {
    user,
    featuredLocations,
    popularPlaces,
    appStats,
  };
};
