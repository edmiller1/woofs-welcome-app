<script lang="ts">
  import type { BAUser } from "@woofs/types";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import { Flag, Map, Star, ThumbsUp } from "@lucide/svelte";
  import bonny from "$lib/assets/bonny.jpeg";
  import { api } from "$lib/api-helper";
  import { createQuery, createInfiniteQuery } from "@tanstack/svelte-query";
  import { Button } from "$lib/components/ui/button";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatRelative } from "date-fns";
  import { Skeleton } from "$lib/components/ui/skeleton";

  interface Props {
    data: { user: BAUser | null };
  }

  const { data }: Props = $props();
  const { user } = $derived(data);

  const trendingPlaces = createQuery(() => ({
    queryKey: ["trendingPlaces"],
    queryFn: () => api.place.getTrendingPlaces(),
  }));

  const communityStats = createQuery(() => ({
    queryKey: ["communityStats"],
    queryFn: () =>
      api.place.getCommunityStats().catch(() => ({
        totalReviews: 0,
        checkIns: 0,
        placesSaved: 0,
      })),
  }));

  const communityReviews = createInfiniteQuery(() => ({
    queryKey: ["communityReviews"],
    queryFn: ({ pageParam = 1 }) =>
      api.review.getCommunityReviews({ page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: Infinity,
  }));

  const allReviews = $derived(
    communityReviews.data?.pages.flatMap((p) => p.reviews) ?? [],
  );

  // IntersectionObserver sentinel
  let sentinel = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          communityReviews.hasNextPage &&
          !communityReviews.isFetchingNextPage
        ) {
          communityReviews.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });
</script>

<div class="bg-surface text-on-surface overflow-x-hidden">
  <HomeNavbar {user} />

  <!-- Hero -->
  <header class="relative w-full h-80 flex items-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img
        src={bonny}
        alt="dog running in water"
        class="w-full h-full object-cover hero-mask opacity-60"
      />
    </div>
    <div class="relative z-10 max-w-400 mx-auto px-5 md:px-12 w-full">
      <div class="max-w-2xl">
        <h1 class="text-6xl font-bold text-background mb-1 leading-tight">
          Community
        </h1>
      </div>
    </div>
  </header>

  <main class="max-w-400 mx-auto px-5 md:px-12 -mt-16 relative z-20">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:h-[calc(100vh-4rem)] lg:overflow-hidden items-start">
      <!-- Left Sidebar: Stats -->
      <aside class="lg:col-span-3 block space-y-6 pt-16 self-start lg:sticky lg:top-0">
        <div
          class="bg-surface-container-lowest rounded-xl p-6 border border-outline/10 shadow-sm"
        >
          {#if communityStats.isLoading}
            <div class="space-y-6">
              {#each [1, 2, 3] as _}
                <div class="flex items-center justify-between">
                  <Skeleton class="h-4 w-24" />
                  <Skeleton class="h-4 w-10" />
                </div>
              {/each}
            </div>
          {:else if communityStats.isSuccess}
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant">Check-ins</span>
                <span class="font-bold text-primary"
                  >{communityStats.data.checkIns}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant">Places saved</span>
                <span class="font-bold text-primary"
                  >{communityStats.data.placesSaved}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant">Reviews</span>
                <span class="font-bold text-primary"
                  >{communityStats.data.totalReviews}</span
                >
              </div>
            </div>
          {/if}
        </div>
      </aside>

      <!-- Main Feed -->
      <div class="feed-scroll lg:col-span-5 lg:h-full lg:overflow-y-auto pb-16 space-y-6 pt-16">
        {#if communityReviews.isLoading}
          {#each [1, 2, 3] as _}
            <div class="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline/10 shadow-sm">
              <div class="p-6 flex items-center gap-3">
                <Skeleton class="size-12 rounded-full shrink-0" />
                <div class="flex-1 space-y-2">
                  <Skeleton class="h-4 w-32" />
                  <Skeleton class="h-3 w-48" />
                  <Skeleton class="h-3 w-20" />
                </div>
              </div>
              <Skeleton class="w-full aspect-video" />
              <div class="p-6 space-y-3">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-4/5" />
                <Skeleton class="h-4 w-3/5" />
              </div>
            </div>
          {/each}
        {/if}

        {#each allReviews as review}
          {@const reviewUserImage =
            review.user && review.user.image
              ? review.user.image.replace(/=s\d+-c$/, "=s400-c")
              : buildImageUrl(review.user?.profileImageId ?? "", "thumbnail")}
          <article class="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline/10 shadow-sm">
            <div class="p-6 flex items-center gap-3">
              <img
                alt={review.user.name}
                class="size-12 rounded-full object-cover border-2 border-primary-container shrink-0"
                src={reviewUserImage}
              />
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-1 flex-wrap">
                  <h4 class="font-label-md text-on-surface">{review.user.name}</h4>
                  <span class="text-on-surface-variant/40">·</span>
                  <p class="text-[12px] text-on-surface-variant truncate">
                    {formatRelative(new Date(review.createdAt), new Date())} · {review.place.name}
                  </p>
                </div>
                <div class="flex text-primary">
                  {#each Array(review.rating) as _}
                    <Star class="size-3.5 fill-primary" />
                  {/each}
                </div>
              </div>
            </div>
            {#if review.images.length > 0 || review.place.images.length > 0}
              <div class="relative aspect-video">
                <OptimizedImage
                  alt={review.place.name}
                  class="w-full h-full object-cover"
                  height="100%"
                  imageId={review.images.length > 0
                    ? review.images[0].imageId
                    : review.place.images[0].imageId}
                />
              </div>
            {/if}
            <div class="p-6">
              <p class="mb-2 font-semibold text-on-surface">{review.title}</p>
              <p class="text-on-surface-variant text-sm mb-6">{review.content}</p>
              <div class="flex items-center gap-2 border-t border-outline/10 pt-4">
                <Button variant="outline" class="rounded-full p-1">
                  <ThumbsUp class="h-4 w-4 text-muted-foreground" />
                  <span class="text-xs">{review.likesCount}</span>
                </Button>
                <Button variant="outline" class="rounded-full p-1">
                  <Flag class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </article>
        {/each}

        <!-- Infinite scroll sentinel -->
        <div bind:this={sentinel} class="h-4">
          {#if communityReviews.isFetchingNextPage}
            <div class="space-y-6 pt-2">
              {#each [1, 2] as _}
                <div class="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline/10 shadow-sm">
                  <div class="p-6 flex items-center gap-3">
                    <Skeleton class="size-12 rounded-full shrink-0" />
                    <div class="flex-1 space-y-2">
                      <Skeleton class="h-4 w-32" />
                      <Skeleton class="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton class="w-full aspect-video" />
                  <div class="p-6 space-y-3">
                    <Skeleton class="h-4 w-full" />
                    <Skeleton class="h-4 w-3/5" />
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Right Sidebar: Trending -->
      <aside class="lg:col-span-4 space-y-6 pt-16 self-start lg:sticky lg:top-0">
        <div
          class="bg-surface-container-lowest rounded-xl p-6 border border-outline/10 shadow-sm"
        >
          <h3 class="font-semibold text-base text-on-surface mb-md">
            Trending Places
          </h3>
          <div class="space-y-6 mt-6">
            {#if trendingPlaces.isLoading}
              {#each [1, 2, 3, 4, 5] as _}
                <div class="flex items-center gap-3">
                  <Skeleton class="size-14 rounded-lg shrink-0" />
                  <div class="flex-1 space-y-2">
                    <Skeleton class="h-3.5 w-36" />
                    <Skeleton class="h-3 w-24" />
                    <Skeleton class="h-3 w-16" />
                  </div>
                </div>
              {/each}
            {:else if trendingPlaces.isSuccess}
              {#each trendingPlaces.data as place}
                <a
                  class="group block"
                  href={`/location/${place.location.path}/places/${place.slug}`}
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="size-14 rounded-lg overflow-hidden bg-surface-container shrink-0"
                    >
                      {#if place.imageId}
                        <OptimizedImage
                          alt={place.name}
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          imageId={place.imageId}
                          height="100%"
                          variant="thumbnail"
                        />
                      {/if}
                    </div>
                    <div>
                      <h5
                        class="truncate text-sm text-on-surface group-hover:text-primary w-40 transition-colors"
                      >
                        {place.name}
                      </h5>
                      <p class="text-[12px] text-on-surface-variant">
                        {place.location.name}, {place.countryCode}
                      </p>
                      <p class="text-[10px] text-primary font-bold">
                        {place.checkInCount} check-ins
                      </p>
                    </div>
                  </div>
                </a>
              {/each}
            {/if}
          </div>
          <Button class="mt-6 w-full"><Map />Explore More</Button>
        </div>
      </aside>
    </div>
  </main>

  <Footer />
  <MobileBottomNav {user} />
</div>

<style>
  .feed-scroll {
    scrollbar-width: none; /* Firefox */
  }
  .feed-scroll::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Edge */
  }
</style>
