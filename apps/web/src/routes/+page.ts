import { getUser } from "$lib/auth/guard";
import { api } from "$lib/api-helper";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ fetch }) => {
  const [user, featuredLocations, popularPlaces] = await Promise.all([
    getUser(fetch),
    api.location.getFeaturedLocations().catch(() => []),
    api.place.getPopularPlaces().catch(() => []),
  ]);

  return {
    user,
    featuredLocations,
    popularPlaces,
  };
};
