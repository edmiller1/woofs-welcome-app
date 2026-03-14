<script lang="ts">
  import { api } from "$lib/api-helper";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import {
    Dog,
    ImageIcon,
    MessageCircle,
    Star,
    ThumbsUp,
    UserStar,
  } from "@lucide/svelte";
  import { createQuery, createInfiniteQuery } from "@tanstack/svelte-query";
  import type { ProfileReviewStats, UpdateReviewData } from "@woofs/types";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Separator } from "$lib/components/ui/separator";
  import { format } from "date-fns";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";

  interface Props {
    data: {
      userId: string;
      userName: string;
      initialProfileReviewStats: ProfileReviewStats;
    };
  }

  const { data }: Props = $props();
  const { userId, userName, initialProfileReviewStats } = $derived(data);

  let selectedRating = $state<number | undefined>(undefined);
  let sortBy = $state<string>("createdAt_desc");
  let cursor = $state<string | null | undefined>(undefined);
  let isSticky = $state<boolean>(false);
  let expandedReviews = $state(new Set<string>());
  let sentinel = $state<HTMLDivElement>();
  let deleteOpen = $state<boolean>(false);
  let deleteReviewId = $state<string>("");
  let editOpen = $state<boolean>(false);
  let editReviewData = $state<UpdateReviewData>({
    reviewId: "",
    title: "",
    content: "",
    rating: 0,
    dogBreeds: [],
    numDogs: 0,
    visitDate: new Date(),
    images: [],
  });
  let editPlaceName = $state<string>("");

  const profileReviewStats = createQuery(() => ({
    queryKey: ["profileReviewStats", userId],
    queryFn: () => api.profile.getProfileReviewStats(userId),
    initialData: initialProfileReviewStats,
  }));

  const profileReviews = createInfiniteQuery(() => ({
    queryKey: ["profileReviews", userId, selectedRating, sortBy],
    queryFn: ({ pageParam }) =>
      api.profile.getProfileReviews(
        userId,
        12,
        sortBy,
        selectedRating,
        pageParam,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  }));

  $effect(() => {
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSticky = !entry.isIntersecting;
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  });

  const openDeleteDialog = (reviewId: string) => {
    deleteReviewId = reviewId;
    deleteOpen = true;
  };

  const openEditDialog = (reviewData: UpdateReviewData, placeName: string) => {
    editReviewData = reviewData;
    editPlaceName = placeName;
    editOpen = true;
  };

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedReviews);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    expandedReviews = next;
  };

  const getSelectContent = () => {
    switch (sortBy) {
      case "createdAt_desc":
        return "Newest";
      case "createdAt_asc":
        return "Oldest";
      case "rating_desc":
        return "Highest Rated";
      case "likes_desc":
        return "Most Liked";
      default:
        return "Newest";
    }
  };

  const selectContent = $derived(getSelectContent());
  const allReviews = $derived(
    profileReviews.data?.pages.flatMap((page) => page.reviews) ?? [],
  );
</script>

<section>
  {#if profileReviewStats.isLoading}
    <div class="grid grid-cols-3 gap-4 p-4">
      {#each [0, 1, 2] as _}
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2">
            <div class="h-8 w-10 animate-pulse rounded bg-muted"></div>
            <div class="h-4 w-4 animate-pulse rounded bg-muted"></div>
          </div>
          <div class="mt-2 h-3 w-16 animate-pulse rounded bg-muted"></div>
        </div>
      {/each}
    </div>
    <div class="flex items-center gap-2 px-4 pb-4 flex-wrap">
      {#each [0, 1, 2, 3, 4, 5] as _}
        <div class="h-8 w-12 animate-pulse rounded-full bg-muted"></div>
      {/each}
      <div class="ml-auto h-8 w-32 animate-pulse rounded-md bg-muted"></div>
    </div>
  {:else if profileReviewStats.data?.isPrivate}
    <div
      class="flex flex-col items-center justify-center py-8 gap-3 text-center px-4"
    >
      <Star class="size-10 text-muted-foreground" />
      <p class="font-medium">Reviews are private</p>
      <p class="text-sm text-muted-foreground">
        This user has chosen to keep their reviews private
      </p>
    </div>
  {:else}
    <div bind:this={sentinel}></div>
    <div
      class="sticky top-0 z-10 bg-background transition-shadow {isSticky
        ? 'shadow-md'
        : ''}"
    >
      <div class="grid grid-cols-3 gap-4 p-4">
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2">
            <p class="text-2xl font-bold">
              {profileReviewStats.data.totalReviews}
            </p>
            <UserStar class="size-4 fill-foreground" />
          </div>
          <p class="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Reviews
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2">
            <p class="text-2xl font-bold">
              {profileReviewStats.data.averageRating.toFixed(1)}
            </p>
            <Star class="size-4 fill-foreground" />
          </div>
          <p class="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Avg Rating
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <div class="flex items-center gap-2">
            <p class="text-2xl font-bold">
              {profileReviewStats.data.totalLikes}
            </p>
            <ThumbsUp class="size-4 fill-foreground" />
          </div>
          <p class="text-xs text-muted-foreground uppercase tracking-wide mt-1">
            Total Likes
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-4 pb-4 flex-wrap">
        {#each [undefined, 5, 4, 3, 2, 1] as rating}
          <Button
            variant="outline"
            class="px-3 py-1.5 rounded-full cursor-pointer text-sm font-medium border transition-colors
        {selectedRating === rating
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-muted hover:text-gray-600'}"
            onclick={() => (selectedRating = rating)}
          >
            {#if rating}
              <div class="flex items-center gap-1">
                <Star class="size-3 fill-foreground" />
                {rating}
              </div>
            {:else}
              All
            {/if}
          </Button>
        {/each}
        <Select.Root bind:value={sortBy} type="single">
          <Select.Trigger class="w-32 ml-auto cursor-pointer"
            >{selectContent}</Select.Trigger
          >
          <Select.Content>
            <Select.Item value="createdAt_desc">Newest</Select.Item>
            <Select.Item value="createdAt_asc">Oldest</Select.Item>
            <Select.Item value="rating_desc">Highest Rated</Select.Item>
            <Select.Item value="likes_desc">Most Liked</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>
    <div class="px-4">
      <Separator />
    </div>
    {#if profileReviews.isLoading}
      <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
        {#each Array(6) as _}
          <div class="rounded-lg border p-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 animate-pulse rounded bg-muted"></div>
              <div class="flex flex-col gap-1.5 flex-1">
                <div class="h-3.5 w-28 animate-pulse rounded bg-muted"></div>
                <div class="h-3 w-20 animate-pulse rounded bg-muted"></div>
              </div>
              <div
                class="h-3 w-16 animate-pulse rounded bg-muted self-start"
              ></div>
            </div>
            <div class="flex gap-1">
              {#each Array(5) as _}
                <div class="h-3.5 w-3.5 animate-pulse rounded bg-muted"></div>
              {/each}
            </div>
            <div class="flex flex-col gap-2">
              <div class="h-3 w-full animate-pulse rounded bg-muted"></div>
              <div class="h-3 w-full animate-pulse rounded bg-muted"></div>
              <div class="h-3 w-2/3 animate-pulse rounded bg-muted"></div>
            </div>
            <div
              class="h-7 w-16 animate-pulse rounded-md bg-muted mt-auto"
            ></div>
          </div>
        {/each}
      </div>
    {:else if allReviews.length === 0 && !profileReviews.isFetching}
      <div
        class="flex flex-col items-center justify-center py-16 gap-3 text-center"
      >
        <Star class="size-12 text-muted-foreground" />
        {#if selectedRating !== undefined}
          <p class="font-medium">No {selectedRating} star reviews</p>
          <p class="text-sm text-muted-foreground">
            Try a different rating filter
          </p>
          <Button
            variant="outline"
            size="sm"
            onclick={() => (selectedRating = undefined)}
          >
            Clear filter
          </Button>
        {:else}
          <p class="font-medium">No reviews yet</p>
          <p class="text-sm text-muted-foreground">
            {profileReviews.data?.pages[0]?.isOwner
              ? "You haven't reviewed any places yet"
              : "This user hasn't reviewed any places yet"}
          </p>
        {/if}
      </div>
    {:else}
      <div class="relative">
        {#if profileReviews.isFetching}
          <div
            class="absolute top-24 inset-0 bg-white/50 z-10 flex items-center justify-center"
          >
            <Spinner />
          </div>
        {/if}
      </div>
      <div class="py-6 grid grid-cols-1 gap-4 p-2 sm:grid-cols-2">
        {#each allReviews as review}
          <div class="rounded-lg border p-4 flex">
            <div class="flex gap-2 items-stretch w-full">
              <div
                class="shrink-0 w-20 h-20 bg-muted rounded-lg flex items-center justify-center"
              >
                <OptimizedImage
                  imageId={review.place.images[0].imageId}
                  alt={review.place.name}
                  variant="thumbnail"
                  class="w-20 h-20 object-cover object-center rounded-sm"
                  height="80"
                  width="80"
                />
              </div>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <a
                        href={`/location/${review.place.location.path}/places/${review.place.slug}#review-${review.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h3 class="text-sm font-semibold text-primary">
                          {review.place.name}
                        </h3>
                      </a>
                      <p class="text-xs text-muted-foreground">
                        {review.place.location.name}, {review.place.location
                          .parent.name}
                        {review.place.countryCode}
                      </p>
                    </div>
                    {#if profileReviews.data?.pages[0]?.isOwner}
                      <div class="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          class="px-2 py-0.5"
                          onclick={() =>
                            openEditDialog(
                              {
                                reviewId: review.id,
                                title: review.title,
                                content: review.content!,
                                rating: review.rating,
                                numDogs: review.numDogs,
                                dogBreeds: review.dogBreeds,
                                visitDate: review.visitDate!,
                                images: review.images,
                              },
                              review.place.name,
                            )}>Edit</Button
                        >
                        <Button
                          variant="destructive"
                          size="sm"
                          class="px-2 py-0.5"
                          onclick={() => openDeleteDialog(review.id)}
                          >Delete</Button
                        >
                      </div>
                    {/if}
                  </div>
                  <!-- Rating -->
                  <div class="flex items-center gap-2 mt-1">
                    <div class="flex items-center">
                      {#each Array.from({ length: 5 }, (_, i) => i + 1) as star}
                        <Star
                          class={`size-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      {/each}
                    </div>
                    <span class="text-sm font-medium"
                      >{review.rating.toFixed(1)}</span
                    >
                  </div>

                  <!-- Review Content -->
                  <h4 class="font-semibold mt-3 text-foreground">
                    {review.title}
                  </h4>
                  <p
                    class="text-muted-foreground mt-1 text-sm leading-relaxed {expandedReviews.has(
                      review.id,
                    )
                      ? ''
                      : 'line-clamp-3'}"
                  >
                    {review.content}
                  </p>
                  {#if review.content && review.content.length > 300}
                    <button
                      class="text-xs text-primary mt-1 cursor-pointer hover:underline"
                      onclick={() => toggleExpanded(review.id)}
                    >
                      {expandedReviews.has(review.id)
                        ? "Show less"
                        : "Read more"}
                    </button>
                  {/if}
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between mt-auto pt-3">
                  <div
                    class="flex items-center gap-4 text-sm text-muted-foreground"
                  >
                    <div class="flex items-center gap-1">
                      <Dog class="h-4 w-4" />
                      <span>{review.dogBreeds.length} dogs</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <ThumbsUp class="h-4 w-4" />
                      <span>{review.likesCount}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <ImageIcon class="h-4 w-4" />
                      <span>{review.images.length}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <MessageCircle class="h-4 w-4" />
                      <span>{review.repliesCount}</span>
                    </div>
                  </div>
                  <span class="text-sm text-muted-foreground"
                    >{format(review.visitDate!, "LLLL, yyyy")}</span
                  >
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      {#if profileReviews.hasNextPage}
        <div class="flex items-center justify-center pb-6">
          <Button
            variant="outline"
            size="sm"
            class="mt-6"
            onclick={() => profileReviews.fetchNextPage()}
            disabled={profileReviews.isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      {/if}
    {/if}
  {/if}
</section>

{#if deleteOpen}
  <DeleteReviewDialog open={deleteOpen} reviewId={deleteReviewId} />
{/if}

{#if editOpen}
  <EditReviewDialog
    open={editOpen}
    onOpenChange={(open) => (editOpen = open)}
    reviewData={editReviewData}
    placeName={editPlaceName}
  />
{/if}
