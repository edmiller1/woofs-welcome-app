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
      queryFn: () => api.place.getTrendingPlaces().catch(() => []),
    }),
    queryClient.prefetchQuery({
      queryKey: ["communityStats"],
      queryFn: () =>
        api.place.getCommunityStats().catch(() => ({
          totalReviews: 0,
          checkIns: 0,
          placesSaved: 0,
        })),
    }),
    queryClient.prefetchQuery({
      queryKey: ["communityReviews", { page: 1, limit: 10 }],
      queryFn: () => api.review.getCommunityReviews({ page: 1, limit: 10 }).catch(() => ({ reviews: [], total: 0, page: 1, pageSize: 10 })),
    }),
    queryClient.prefetchQuery({
      queryKey: ["upcomingEvents", { limit: 10 }],
      queryFn: () => api.event.getUpcomingEvents({ limit: 10 }).catch(() => []),
    }),
  ]);

  return {
    user,
    dehydratedState: dehydrate(queryClient),
  };
};
