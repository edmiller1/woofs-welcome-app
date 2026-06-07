import { getUser } from "$lib/auth/guard";
import { redirect, type Load } from "@sveltejs/kit";
import { api } from "$lib/api-helper";
import { QueryClient, dehydrate } from "@tanstack/svelte-query";

export const load: Load = async () => {
  redirect(302, "/");

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
    queryClient.prefetchInfiniteQuery({
      queryKey: ["communityReviews"],
      queryFn: () => api.review.getCommunityReviews({ page: 1, limit: 10 }),
      initialPageParam: 1,
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
