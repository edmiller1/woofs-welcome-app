import { getUser } from "$lib/auth/guard";
import type { Load } from "@sveltejs/kit";
import { api } from "$lib/api-helper";
import { QueryClient, dehydrate } from "@tanstack/svelte-query";

export const load: Load = async () => {
  const user = await getUser();

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["trendingPlaces"],
      queryFn: () => api.place.getTrendingPlaces(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["communityStats"],
      queryFn: () => api.place.getCommunityStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["communityReviews", { page: 1, limit: 10 }],
      queryFn: () => api.review.getCommunityReviews({ page: 1, limit: 10 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["upcomingEvents", { limit: 10 }],
      queryFn: () => api.event.getUpcomingEvents({ limit: 10 }),
    }),
  ]);

  return {
    user,
    dehydratedState: dehydrate(queryClient),
  };
};
