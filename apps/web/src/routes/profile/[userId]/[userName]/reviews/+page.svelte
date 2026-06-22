<script lang="ts">
  import { api } from "$lib/api-helper";
  import { createQuery, createInfiniteQuery } from "@tanstack/svelte-query";
  import type {
    Profile,
    ProfileReviewStats,
    UpdateReviewData,
    UserReview,
  } from "@woofs/types";
  import { formatDistanceToNow } from "date-fns";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";
  import Footer from "$lib/components/footer.svelte";
  import StarRating from "$lib/components/star-rating.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Dog, Lock, Star, ThumbsUp } from "@lucide/svelte";

  interface Props {
    data: {
      userId: string;
      userName: string;
      initialProfileReviewStats: ProfileReviewStats;
      initialProfileReviews: UserReview;
      initialProfile: Profile;
    };
  }

  const { data }: Props = $props();
  const { userId, userName, initialProfileReviewStats, initialProfileReviews, initialProfile } =
    $derived(data);

  const profile = $derived(initialProfile);

  let selectedRating = $state<number | undefined>(undefined);
  let sortBy = $state<string>("createdAt_desc");
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
    initialData: selectedRating === undefined && sortBy === "createdAt_desc"
      ? { pages: [initialProfileReviews], pageParams: [undefined] }
      : undefined,
  }));

  $effect(() => {
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          profileReviews.hasNextPage &&
          !profileReviews.isFetchingNextPage
        ) {
          profileReviews.fetchNextPage();
        }
      },
      { threshold: 0.1 },
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
  const isPrivate = $derived(profileReviews.data?.pages[0]?.isPrivate ?? false);
</script>

<div class="min-h-100">
  {#if profileReviews.isLoading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <div
          class="bg-white p-6 rounded-3xl border border-secondary/10 flex flex-col gap-3"
        >
          <div class="flex items-start justify-between w-full">
            <div class="flex flex-col gap-2 flex-1">
              <Skeleton class="h-5 w-3/4" />
              <Skeleton class="h-4 w-1/3" />
              <Skeleton class="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton class="h-4 w-2/3" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-6 w-1/4 rounded-full" />
        </div>
      {/each}
    </div>
  {:else if isPrivate}
    <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Lock class="size-12 text-muted-foreground" />
      <p class="font-medium">Reviews are private</p>
      <p class="text-sm text-muted-foreground">This user hasn't made their reviews public</p>
    </div>
  {:else if profileReviews.isSuccess && allReviews.length === 0}
    <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Star class="size-12 text-muted-foreground" />
      <p class="font-medium">No reviews yet</p>
      <p class="text-sm text-muted-foreground">Reviews will appear here once written</p>
    </div>
  {:else if profileReviews.isSuccess}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each allReviews as review}
        <div
          class="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-secondary/10 flex flex-col gap-3"
        >
          <div>
            <div class="flex flex-col gap-3 flex-1">
              <div class="flex items-start justify-between w-full">
                <div>
                  <a
                    href={`/location/${review.place.location.path}/places/${review.place.slug}?reviewId=${review.id}`}
                    class="hover:underline"
                  >
                    <h3 class="text-on-surface text-[18px]">
                      {review.place.name}
                    </h3>
                  </a>
                  <div class="flex gap-1 text-[#FFB800]">
                    <StarRating rating={review.rating} />
                  </div>
                  <span class="text-xs text-primary-tint block mt-1"
                    >{review.place.location.name}, {review.place.location.parent
                      .name} • {formatDistanceToNow(review.visitDate)} ago
                  </span>
                </div>
                {#if isOwner}
                  <div class="flex items-center gap-2 mt-1">
                    <button
                      class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
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
                        )}>Edit</button
                    >
                    <button
                      class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
                      onclick={() => openDeleteDialog(review.id)}>Delete</button
                    >
                  </div>
                {/if}
              </div>
              <p class="text-sm font-semibold">{review.title}</p>
              <p class="text-xs line-clamp-2">
                {review.content}
              </p>
              <div
                class="flex items-center text-xs gap-2 text-muted-foreground"
              >
                {#if review.numDogs && review.numDogs > 0}
                  <span class="flex items-center gap-1">
                    <Dog class="size-3.5" />
                    {review.numDogs}
                    {review.numDogs === 1 ? "dog" : "dogs"}
                  </span>
                {/if}
                •
                {#if review.likesCount && review.likesCount > 0}
                  <span class="flex items-center gap-1">
                    <ThumbsUp class="size-3.5" />
                    {review.likesCount}
                    {review.likesCount === 1 ? "like" : "likes"}
                  </span>
                {/if}
              </div>
              <div class="mt-auto flex items-center gap-2">
                {#each review.dogBreeds.slice(0, 2) as breed}
                  <Badge variant="breed" class="rounded-full text-xs">
                    {breed}
                  </Badge>
                {/each}
                {#if review.dogBreeds.length > 2}
                  <Badge variant="secondary" class="rounded-full text-xs">
                    +{review.dogBreeds.length - 2}
                  </Badge>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    {#if profileReviews.isFetchingNextPage}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {#each Array(3) as _}
          <div
            class="bg-white p-6 rounded-3xl border border-secondary/10 flex flex-col gap-3"
          >
            <div class="flex items-start justify-between w-full">
              <div class="flex flex-col gap-2 flex-1">
                <Skeleton class="h-5 w-3/4" />
                <Skeleton class="h-4 w-1/3" />
                <Skeleton class="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-6 w-1/4 rounded-full" />
          </div>
        {/each}
      </div>
    {/if}

    <div bind:this={sentinel} class="h-1"></div>

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
</div>
