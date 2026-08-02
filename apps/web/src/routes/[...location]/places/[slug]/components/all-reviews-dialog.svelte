<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { onMount } from "svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Flag, LoaderCircle, X } from "@lucide/svelte";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import StarRating from "$lib/components/star-rating.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import ReviewImageDialog from "$lib/components/review-image-dialog.svelte";
  import LikeReviewButton from "./like-review-button.svelte";
  import { cn } from "$lib/utils";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import type { BAUser, ReviewImage } from "@woofs/types";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    placeId: string;
    total: number;
    user: BAUser | null;
  }

  let { open, onOpenChange, placeId, total, user }: Props = $props();

  const LIMIT = 10;

  const reviewsQuery = createInfiniteQuery(() => ({
    queryKey: ["place-reviews-all", placeId],
    queryFn: ({ pageParam = 1 }) =>
      api.place.getPlaceReviews(placeId, pageParam as number, LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.reviews.length, 0);
      return fetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: open,
  }));

  const allReviews = $derived(
    reviewsQuery.data?.pages.flatMap((p) => p.reviews) ?? [],
  );

  let sentinel = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!sentinel || !open) return;
    const currentSentinel = sentinel;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          reviewsQuery.hasNextPage &&
          !reviewsQuery.isFetchingNextPage
        ) {
          reviewsQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(currentSentinel);
    return () => observer.disconnect();
  });

  let imageDialogOpen = $state(false);
  let currentImage = $state<ReviewImage | undefined>();

  const openImageDialog = (image: ReviewImage) => {
    currentImage = image;
    imageDialogOpen = true;
  };

  const handleOpenReportDialog = (_reviewId: string, _hasReported: boolean) => {
    // Report dialog can be wired up later — same pattern as place-reviews.svelte
  };

  let isDesktop = $state(false);
  onMount(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    isDesktop = mq.matches;
    mq.addEventListener("change", (e) => (isDesktop = e.matches));
  });
</script>

{#snippet reviewCard(review: (typeof allReviews)[number])}
  {@const reviewId = review.id}
  {@const reviewUserImage =
    review.user && review.user.image
      ? review.user.image
      : buildImageUrl(review.user?.profileImageId ?? "", "thumbnail")}
  <div class="rounded-lg p-5 bg-white shadow-sm">
    <div class="mb-4 flex items-start gap-4">
      <Avatar.Root class="size-11 shrink-0">
        <Avatar.Image
          src={reviewUserImage}
          alt="review user avatar"
          referrerpolicy="no-referrer"
        />
        <Avatar.Fallback>{getUserInitials(review.user.name)}</Avatar.Fallback>
      </Avatar.Root>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <div>
            <h4 class="font-semibold">{review.user.name}</h4>
            <div class="mt-0.5 flex items-center gap-2">
              <StarRating rating={review.rating} />
              <span class="text-xs text-muted-foreground">
                {formatDate(review.visitDate.toString())} &middot; {review.numDogs}
                {review.numDogs === 1 ? "dog" : "dogs"}
              </span>
            </div>
          </div>
          {#if !review.isOwner}
            <div class="flex items-center gap-1 shrink-0">
              <LikeReviewButton
                {reviewId}
                hasLiked={review.hasLiked}
                likesCount={review.likesCount}
                {placeId}
                currentPage={1}
                limit={LIMIT}
              />
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <Button
                    variant="outline"
                    class="rounded-full p-1"
                    onclick={() =>
                      handleOpenReportDialog(review.id, review.hasReported)}
                  >
                    <Flag
                      class={cn(
                        "size-4",
                        review.hasReported
                          ? "fill-primary text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content
                  class="border border-muted-foreground/20 bg-white"
                >
                  <p>
                    {review.hasReported
                      ? "Already reported"
                      : "Report this review"}
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
          {/if}
        </div>
        <div class="mt-1.5 flex flex-wrap gap-1">
          {#each review.dogBreeds as breed}
            <Badge
              variant="secondary"
              class="rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {breed}
            </Badge>
          {/each}
        </div>
      </div>
    </div>
    <p class="mb-1 font-semibold leading-tight font-headline text-lg">
      {review.title}
    </p>
    <p class="mb-3 text-sm text-muted-foreground leading-relaxed">
      {review.content}
    </p>
    {#if review.images?.length}
      <div class="flex flex-wrap gap-2">
        {#each review.images as image}
          <button
            class="appearance-none group cursor-pointer overflow-hidden rounded-xl"
            onclick={() => openImageDialog(image)}
          >
            <OptimizedImage
              imageId={image.imageId}
              alt="review image"
              variant="thumbnail"
              class="group-hover:brightness-80 size-20 object-cover object-center transition-all duration-200"
              width="80"
              height="80"
            />
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet content()}
  <!-- Header -->
  <div class="shrink-0 flex items-center justify-between px-5 py-4 border-b">
    <h2 class="font-headline font-semibold text-xl">
      All {total} reviews
    </h2>
    <button
      onclick={() => onOpenChange(false)}
      aria-label="Close"
      class="cursor-pointer rounded-full p-1.5 hover:bg-muted transition-colors"
    >
      <X class="size-5" />
    </button>
  </div>

  <!-- Scrollable review list -->
  <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
    {#if reviewsQuery.isLoading}
      {#each Array(3) as _}
        <div class="rounded-lg p-5 bg-white shadow-sm space-y-3">
          <div class="flex items-start gap-3">
            <Skeleton class="size-11 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-3 w-44" />
            </div>
          </div>
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-4/5" />
        </div>
      {/each}
    {:else}
      {#each allReviews as review (review.id)}
        {@render reviewCard(review)}
      {/each}
    {/if}

    <!-- Sentinel for infinite scroll -->
    <div bind:this={sentinel} class="h-4"></div>

    {#if reviewsQuery.isFetchingNextPage}
      <div class="flex justify-center py-4">
        <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
      </div>
    {/if}

    {#if !reviewsQuery.hasNextPage && allReviews.length > 0}
      <p class="text-center text-sm text-muted-foreground py-4">
        All {total} reviews loaded
      </p>
    {/if}
  </div>
{/snippet}

<!-- Desktop: side-panel dialog -->
{#if isDesktop}
  <DialogPrimitive.Root {open} {onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        class="fixed left-1/2 top-1/2 z-50 flex flex-col w-full max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background shadow-xl outline-none"
      >
        {@render content()}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
{:else}
  <!-- Mobile: fullscreen bottom sheet -->
  <DialogPrimitive.Root {open} {onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black/40" />
      <DialogPrimitive.Content
        class="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[90dvh] rounded-t-2xl bg-background outline-none"
      >
        <!-- Drag handle -->
        <div class="shrink-0 flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-muted-foreground/30"></div>
        </div>
        {@render content()}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
{/if}

<!-- Review image lightbox -->
{#if currentImage}
  <ReviewImageDialog
    open={imageDialogOpen}
    onOpenChange={(o) => (imageDialogOpen = o)}
    images={allReviews.find((r) =>
      r.images?.some((i) => i.id === currentImage?.id),
    )?.images ?? []}
    image={currentImage}
    reviewUserName={allReviews.find((r) =>
      r.images?.some((i) => i.id === currentImage?.id),
    )?.user.name ?? ""}
    dogs={allReviews.find((r) =>
      r.images?.some((i) => i.id === currentImage?.id),
    )?.dogs ?? []}
  />
{/if}
