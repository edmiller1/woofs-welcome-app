<script lang="ts">
  import { api } from "$lib/api-helper";
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import {
    ChevronDown,
    Dog,
    Image,
    ImageIcon,
    MessageCircle,
    Pencil,
    Star,
    ThumbsUp,
    Trash2,
    UserStar,
  } from "@lucide/svelte";
  import { createQuery, createInfiniteQuery } from "@tanstack/svelte-query";
  import type {
    Profile,
    ProfileReviewStats,
    UpdateReviewData,
  } from "@woofs/types";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Separator } from "$lib/components/ui/separator";
  import { format, formatDistanceToNow } from "date-fns";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";
  import Footer from "$lib/components/footer.svelte";

  interface Props {
    data: {
      userId: string;
      userName: string;
      initialProfileReviewStats: ProfileReviewStats;
      initialProfile: Profile;
    };
  }

  const { data }: Props = $props();
  const { userId, userName, initialProfileReviewStats, initialProfile } =
    $derived(data);

  const profile = $derived(initialProfile);

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
    visitDate: new Date().toString(),
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
  const isOwner = $derived(profileReviews.data?.pages[0]?.isOwner ?? false);
</script>

{#if profileReviews.isLoading || profileReviewStats.isLoading}
  <div class="flex justify-center items-center min-h-screen">
    <Spinner size="lg" />
  </div>
{:else if profileReviews.isError || profileReviewStats.isError}
  <div class="text-center text-red-500">
    Failed to load reviews. Please try again later.
  </div>
{:else}
  <div bind:this={sentinel}></div>
  <section class="pt-16 pb-20 max-w-5xl mx-auto px-8">
    <header class="mb-12">
      <h1
        class="text-4xl md:text-5xl font-bold italic text-primary leading-tight"
      >
        All Reviews
      </h1>
      <span class="font-bold text-secondary"
        >({profile.reviewCount} total reviews)</span
      >
    </header>
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
    >
      <div class="flex flex-wrap gap-2">
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
      </div>
      <Select.Root bind:value={sortBy} type="single">
        <Select.Trigger
          class="w-40 ml-auto  flex items-center cursor-pointer text-primary bg-white hover:bg-muted"
          ><span
            class="text-xs text-gray-500 font-bold uppercase tracking-wider text-outline"
            >Sort By</span
          ><span
            class="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 p-0 cursor-pointer"
            >{selectContent}</span
          ></Select.Trigger
        >
        <Select.Content>
          <Select.Item value="createdAt_desc" class="hover:bg-muted"
            >Newest</Select.Item
          >
          <Select.Item value="createdAt_asc">Oldest</Select.Item>
          <Select.Item value="rating_desc">Highest Rated</Select.Item>
          <Select.Item value="likes_desc" class="hover:bg-muted"
            >Most Liked</Select.Item
          >
        </Select.Content>
      </Select.Root>
    </div>
    <!-- Review list -->
    <div class="space-y-8">
      {#if allReviews.length === 0 && !profileReviews.isFetching}
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
      {/if}
      {#each allReviews as review}
        <article
          class="bg-white p-6 rounded-2xl flex flex-col sm:flex-row gap-6 shadow-[0_4px_24px_rgba(28,28,25,0.04)]"
        >
          <OptimizedImage
            imageId={review.place.images[0].imageId}
            alt={review.place.name}
            class="w-full sm:w-32 h-32 object-cover object-center rounded-xl shrink-0"
            variant="thumbnail"
            width="128"
            height="128"
          />
          <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
              <div>
                <a
                  href={`/location/${review.place.location.path}/places/${review.place.slug}?reviewId=${review.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:underline"
                >
                  <h3 class="text-xl font-bold text-primary">
                    {review.place.name}
                  </h3>
                </a>
                <p class="text-sm text-muted-foreground font-body">
                  {review.place.location.name}, {review.place.location.parent
                    .name}
                  {review.place.countryCode} • {formatDistanceToNow(
                    review.visitDate,
                  )} ago
                </p>
              </div>
              <div class="flex">
                {#each Array(5) as _, i}
                  <Star
                    class={`size-3 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                {/each}
              </div>
            </div>
            <h4
              class="serif-headline text-base font-bold italic text-primary mb-2"
            >
              {review.title}
            </h4>
            <p class="text-on-surface/80 leading-relaxed text-sm">
              {review.content}
            </p>
            <div
              class="flex items-center gap-4 mt-3 text-xs text-muted-foreground"
            >
              {#if review.numDogs && review.numDogs > 0}
                <span class="flex items-center gap-1">
                  <Dog class="size-3.5" />
                  {review.numDogs}
                  {review.numDogs === 1 ? "dog" : "dogs"}
                </span>
              {/if}
              {#if review.imagesCount > 0}
                <span class="flex items-center gap-1">
                  <Image class="size-3.5" />
                  {review.imagesCount}
                  {review.imagesCount === 1 ? "image" : "images"}
                </span>
              {/if}
              {#if review.likesCount && review.likesCount > 0}
                <span class="flex items-center gap-1">
                  <ThumbsUp class="size-3.5" />
                  {review.likesCount}
                  {review.likesCount === 1 ? "like" : "likes"}
                </span>
              {/if}
              {#if review.repliesCount && review.repliesCount > 0}
                <span class="flex items-center gap-1">
                  <MessageCircle class="size-3.5" />
                  {review.repliesCount}
                  {review.repliesCount === 1 ? "reply" : "replies"}
                </span>
              {/if}
              {#if isOwner}
                <div class="ml-auto flex items-center gap-4">
                  <button
                    class="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    onclick={() =>
                      openEditDialog(
                        {
                          reviewId: review.id,
                          title: review.title,
                          content: review.content!,
                          rating: review.rating,
                          dogBreeds: review.dogBreeds,
                          numDogs: review.numDogs,
                          visitDate: review.visitDate,
                          images: review.images ?? [],
                        },
                        review.place.name,
                      )}
                  >
                    <Pencil class="size-3.5" />
                    Edit
                  </button>
                  <button
                    class="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    onclick={() => openDeleteDialog(review.id)}
                  >
                    <Trash2 class="size-3.5" />
                    Delete
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </article>
      {/each}
    </div>
    {#if profileReviews.hasNextPage}
      <div class="mt-16 flex justify-center">
        <Button
          variant="default"
          onclick={() => profileReviews.fetchNextPage()}
          disabled={profileReviews.isFetchingNextPage}
        >
          Load More Reports
          <ChevronDown class="size-4" />
        </Button>
      </div>
    {/if}
  </section>
  <Footer />

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
{/if}
