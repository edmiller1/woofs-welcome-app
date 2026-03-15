<script lang="ts">
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { cn } from "$lib/utils";
  import { Flag, ThumbsUp, PenLine, X } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import StarRating from "$lib/components/star-rating.svelte";
  import type { BAUser, PlaceReview, ReviewImage } from "@woofs/types";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import * as Pagination from "$lib/components/ui/pagination/index.js";
  import { Separator } from "$lib/components/ui/separator";
  import { page } from "$app/state";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import ReviewImageDialog from "$lib/components/review-image-dialog.svelte";

  interface Props {
    placeId: string;
    placeName: string;
    user: BAUser | null;
    reviewCount: number;
    reviewDrawerOpen: boolean;
    openReviewDrawer: (rating: number) => void;
    reviewId: string | null;
  }

  let {
    placeId,
    placeName,
    user,
    reviewCount,
    reviewDrawerOpen,
    openReviewDrawer,
    reviewId,
  }: Props = $props();

  let initialRating = $state(0);

  let currentPage = $state<number>(1);
  const limit = $state<number>(10);
  let imageDialogOpen = $state<boolean>(false);
  let currentImage = $state<ReviewImage>();
  let showHighlighted = $state(true);

  const reviews = createQuery(() => ({
    queryKey: ["place-reviews", placeId, currentPage, limit],
    queryFn: () => api.place.getPlaceReviews(placeId, currentPage, limit),
  }));

  const highlightedReview = createQuery(() => ({
    queryKey: ["place-review", reviewId],
    queryFn: () => api.review.getReview(reviewId!),
    enabled: reviewId !== null,
  }));

  const filteredReviews = $derived(
    reviews.data?.filter((rev) => rev.id !== reviewId) ?? [],
  );

  const handleChangePage = (newPage: number) => {
    currentPage = newPage;
  };

  const handleNextPage = () => {
    currentPage++;
  };

  const handlePreviousPage = () => {
    currentPage--;
  };

  const openImageDialog = (image: ReviewImage) => {
    imageDialogOpen = true;
    currentImage = image;
  };
</script>

<Separator />

<ErrorBoundary error={reviews.error}>
  {#if reviews.isLoading}
    <div class="flex min-h-64 items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if reviews.isSuccess && reviews.data.length > 0}
    <div class="space-y-6 my-6">
      {#if highlightedReview.data && showHighlighted}
        <!-- Highlighted Review -->
        <div class="bg-primary/10 text-primary flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium">
          <span>Showing review from profile</span>
          <button onclick={() => (showHighlighted = false)} class="rounded-full p-1 hover:bg-primary/20 transition-colors">
            <X class="size-4" />
          </button>
        </div>
        {@const reviewUserImage =
          highlightedReview.data.user && highlightedReview.data?.user.image
            ? highlightedReview.data.user.image
            : buildImageUrl(
                highlightedReview.data.user?.profileImageId ?? "",
                "thumbnail",
              )}
        <div class="rounded-lg border-2 p-6 border-primary shadow-sm">
          <div class="mb-4 flex items-start gap-4">
            <Avatar.Root class="size-12">
              <Avatar.Image
                src={reviewUserImage}
                alt="review user avatar"
                referrerpolicy="no-referrer"
              />
              <Avatar.Fallback>
                {getUserInitials(highlightedReview.data.user.name)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold">{highlightedReview.data.user.name}</h4>
                  <div class="mt-1 flex items-center gap-2">
                    <StarRating rating={highlightedReview.data.rating} />
                    <span class="text-muted-foreground text-sm">
                      {formatDate(highlightedReview.data.visitDate.toString())} &middot; {highlightedReview.data.numDogs}
                      {highlightedReview.data.numDogs === 1 ? "dog" : "dogs"}
                    </span>
                  </div>
                </div>
                {#if !highlightedReview.data.isOwner}
                  <div class="flex items-center gap-2">
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button variant="outline" class="rounded-full p-1">
                          <ThumbsUp
                            class={cn(
                              "h-4 w-4",
                              highlightedReview.data.hasLiked
                                ? "fill-primary text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          {#if highlightedReview.data.likesCount > 0}
                            <span class="text-xs"
                              >{highlightedReview.data.likesCount}</span
                            >
                          {/if}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>
                          {highlightedReview.data.hasLiked
                            ? "Unlike this review"
                            : "This review is helpful"}
                        </p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button variant="outline" class="rounded-full p-1">
                          <Flag
                            class={cn(
                              "size-4",
                              highlightedReview.data.hasReported
                                ? "fill-primary text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>
                          {highlightedReview.data.hasReported
                            ? "Update your report"
                            : "Report this review"}
                        </p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <!-- Report dialog -->
                  </div>
                {:else}
                  <div class="flex items-center gap-2">
                    <!-- edit review dialog -->
                    <!-- Delete review dialog -->
                  </div>
                {/if}
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                {#each highlightedReview.data.dogBreeds as breed}
                  <Badge
                    variant="secondary"
                    class="rounded-full px-2 py-1 text-xs"
                  >
                    {breed}
                  </Badge>
                {/each}
              </div>
            </div>
          </div>
          <p class="mb-1 font-semibold leading-relaxed">
            {highlightedReview.data.title}
          </p>
          <p class="mb-4 leading-relaxed">{highlightedReview.data.content}</p>
          <!-- Review Image Dialog -->
          {#each highlightedReview.data.images as image}
            <button
              class="appearance-none group relative cursor-pointer overflow-hidden rounded-sm md:rounded-xl"
              onclick={() => openImageDialog(image)}
            >
              <OptimizedImage
                imageId={image.imageId}
                alt="review image"
                variant="thumbnail"
                class="group-hover:brightness-80 size-24 md:size-32 object-cover object-center transition-all duration-200"
                width="128"
                height="128"
              />
            </button>
          {/each}
        </div>
        <!-- Review Image Dialog/Drawer -->
        <ReviewImageDialog
          open={imageDialogOpen}
          onOpenChange={(open) => (imageDialogOpen = open)}
          images={highlightedReview.data.images}
          image={currentImage}
          reviewUserName={highlightedReview.data.user.name}
        />
      {/if}
      {#each filteredReviews as review}
        {@const reviewId = review.id}
        {@const reviewUserId = review.user.id}
        {@const reviewUserImage =
          review.user && review.user.image
            ? review.user.image
            : buildImageUrl(review.user?.profileImageId ?? "", "thumbnail")}
        <div class="rounded-lg border p-6 shadow-sm">
          <div class="mb-4 flex items-start gap-4">
            <Avatar.Root class="size-12">
              <Avatar.Image
                src={reviewUserImage}
                alt="review user avatar"
                referrerpolicy="no-referrer"
              />
              <Avatar.Fallback>
                {getUserInitials(review.user.name)}
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold">{review.user.name}</h4>
                  <div class="mt-1 flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span class="text-muted-foreground text-sm">
                      {formatDate(review.visitDate.toString())} &middot; {review.numDogs}
                      {review.numDogs === 1 ? "dog" : "dogs"}
                    </span>
                  </div>
                </div>
                {#if review.userId !== user?.id}
                  <div class="flex items-center gap-2">
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button variant="outline" class="rounded-full p-1">
                          <ThumbsUp
                            class={cn(
                              "h-4 w-4",
                              review.hasLiked
                                ? "fill-primary text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          {#if review.likesCount > 0}
                            <span class="text-xs">{review.likesCount}</span>
                          {/if}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>
                          {review.hasLiked
                            ? "Unlike this review"
                            : "This review is helpful"}
                        </p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button variant="outline" class="rounded-full p-1">
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
                      <Tooltip.Content>
                        <p>
                          {review.hasReported
                            ? "Update your report"
                            : "Report this review"}
                        </p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                    <!-- Report dialog -->
                  </div>
                {:else}
                  <div class="flex items-center gap-2">
                    <!-- edit review dialog -->
                    <!-- Delete review dialog -->
                  </div>
                {/if}
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                {#each review.dogBreeds as breed}
                  <Badge
                    variant="secondary"
                    class="rounded-full px-2 py-1 text-xs"
                  >
                    {breed}
                  </Badge>
                {/each}
              </div>
            </div>
          </div>
          <p class="mb-1 font-semibold leading-relaxed">{review.title}</p>
          <p class="mb-4 leading-relaxed">{review.content}</p>
          <!-- Review Image Dialog -->
          {#each review.images as image}
            <button
              class="appearance-none group relative cursor-pointer overflow-hidden rounded-sm md:rounded-xl"
              onclick={() => openImageDialog(image)}
            >
              <OptimizedImage
                imageId={image.imageId}
                alt="review image"
                variant="thumbnail"
                class="group-hover:brightness-80 size-24 md:size-32 object-cover object-center transition-all duration-200"
                width="128"
                height="128"
              />
            </button>
          {/each}
        </div>
        <!-- Review Image Dialog/Drawer -->
        <ReviewImageDialog
          open={imageDialogOpen}
          onOpenChange={(open) => (imageDialogOpen = open)}
          images={review.images}
          image={currentImage}
          reviewUserName={review.user.name}
        />
      {/each}
    </div>
    {#if reviewCount > 10}
      <div class="py-8">
        <Pagination.Root count={reviewCount} perPage={10}>
          {#snippet children({ pages, currentPage })}
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.PrevButton />
              </Pagination.Item>
              <Pagination.Item>
                {#each pages as page (page.key)}
                  {#if page.type === "ellipsis"}
                    <Pagination.Item>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  {:else}
                    <Pagination.Item>
                      <Pagination.Link
                        {page}
                        isActive={currentPage === page.value}
                      >
                        {page.value}
                      </Pagination.Link>
                    </Pagination.Item>
                  {/if}
                {/each}
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.NextButton />
              </Pagination.Item>
            </Pagination.Content>
          {/snippet}
        </Pagination.Root>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <p class="text-muted-foreground mb-4">
        Be the first to review {placeName}!
      </p>
      {#if user}
        <Button onclick={() => openReviewDrawer(0)}>
          <PenLine class="mr-2 size-4" />
          Write the first review
        </Button>
      {:else}
        <a
          href={`/sign-in?redirect=${page.url.pathname}`}
          class={cn(buttonVariants({ variant: "outline" }))}
        >
          <PenLine class="mr-2 size-4" />
          Write the first review
        </a>
      {/if}
    </div>
  {/if}
</ErrorBoundary>
