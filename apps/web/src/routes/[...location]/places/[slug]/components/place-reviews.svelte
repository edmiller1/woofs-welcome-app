<script lang="ts">
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { cn } from "$lib/utils";
  import { Flag, PenLine, X } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import StarRating from "$lib/components/star-rating.svelte";
  import type { BAUser, ReviewImage } from "@woofs/types";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import * as Pagination from "$lib/components/ui/pagination/index.js";
  import { Separator } from "$lib/components/ui/separator";
  import { page } from "$app/state";
  import { untrack } from "svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import ReviewImageDialog from "$lib/components/review-image-dialog.svelte";
  import ReportReviewDialog from "$lib/components/report-review-dialog.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";
  import LikeReviewButton from "./like-review-button.svelte";
  import type { UpdateReviewData } from "@woofs/types";
  import "@aejkatappaja/phantom-ui";

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
  let reviewsContainer = $state<HTMLElement | null | undefined>(null);

  let currentPage = $state<number>(1);
  const limit = $state<number>(5);
  let imageDialogOpen = $state<boolean>(false);
  let currentImage = $state<ReviewImage>();
  let showHighlighted = $state(true);
  let reportOpen = $state(false);
  let reportReviewId = $state<string>("");
  let deleteOpen = $state(false);
  let deleteReviewId = $state<string>("");
  let editOpen = $state(false);
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

  const openDeleteDialog = (id: string) => {
    deleteReviewId = id;
    deleteOpen = true;
  };

  const openEditDialog = (review: UpdateReviewData) => {
    editReviewData = review;
    editOpen = true;
  };

  const reviews = createQuery(() => ({
    queryKey: ["place-reviews", placeId, currentPage, limit],
    queryFn: () => api.place.getPlaceReviews(placeId, currentPage, limit),
  }));

  const highlightedReview = createQuery(() => ({
    queryKey: ["place-review", reviewId],
    queryFn: () => api.review.getReview(reviewId!),
    enabled: reviewId !== null,
    retry: false,
  }));

  const filteredReviews = $derived(
    reviews.data?.filter((rev) => rev.id !== reviewId) ?? [],
  );

  const handleOpenReportDialog = (reviewId: string, hasReported: boolean) => {
    if (hasReported) return;
    reportReviewId = reviewId;
    reportOpen = true;
  };

  $effect(() => {
    if (currentPage > 1) {
      untrack(() =>
        reviewsContainer?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  });

  $effect(() => {
    if (highlightedReview.data && showHighlighted) {
      untrack(() => {
        setTimeout(() => {
          reviewsContainer?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      });
    }
  });

  const openImageDialog = (image: ReviewImage) => {
    imageDialogOpen = true;
    currentImage = image;
  };
</script>

<Separator bind:ref={reviewsContainer} />
<phantom-ui loading={reviews.isLoading}>
  <ErrorBoundary error={reviews.error}>
    {#if reviews.isLoading}
      <div class="space-y-6 my-6">
        {#each Array(3) as _}
          <div class="rounded-lg p-6 bg-white shadow-sm space-y-4">
            <div class="flex items-start gap-4">
              <Skeleton class="size-12 rounded-full shrink-0" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
                <div class="flex gap-1 mt-2">
                  <Skeleton class="h-5 w-16 rounded-full" />
                  <Skeleton class="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-full" />
            <Skeleton class="h-3 w-5/6" />
          </div>
        {/each}
      </div>
    {/if}

    {#if reviews.isSuccess && reviews.data.length > 0}
      <ReportReviewDialog
        bind:open={reportOpen}
        reviewId={reportReviewId}
        {placeId}
        {currentPage}
        {limit}
      />
      <div class="space-y-6 my-6">
        {#if highlightedReview.data && showHighlighted}
          <!-- Highlighted Review -->
          {@const reviewId = highlightedReview.data.id}
          <div
            class="text-primary-tint bg-primary-tint/10 flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium"
          >
            <span>Showing review from profile</span>
            <button
              onclick={() => (showHighlighted = false)}
              class="rounded-full cursor-pointer p-1 hover:bg-primary/20 transition-colors"
            >
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
          <div
            class="rounded-lg bg-white border p-6 border-secondary shadow-sm"
          >
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
                    <h4 class="font-semibold text-lg">
                      {highlightedReview.data.user.name}
                    </h4>
                    <div class="mt-1 flex items-center gap-2">
                      <StarRating rating={highlightedReview.data.rating} />
                      <span class="text-muted-foreground text-sm">
                        {formatDate(
                          highlightedReview.data.visitDate.toString(),
                        )} &middot;
                        {highlightedReview.data.numDogs}
                        {highlightedReview.data.numDogs === 1 ? "dog" : "dogs"}
                      </span>
                    </div>
                  </div>
                  {#if !highlightedReview.data.isOwner}
                    <div class="flex items-center gap-2">
                      <LikeReviewButton
                        {reviewId}
                        hasLiked={highlightedReview.data.hasLiked}
                        likesCount={highlightedReview.data.likesCount}
                        {placeId}
                        {currentPage}
                        {limit}
                      />
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Button
                            variant="outline"
                            class="rounded-full p-1"
                            onclick={() =>
                              handleOpenReportDialog(
                                highlightedReview.data.id,
                                highlightedReview.data.hasReported,
                              )}
                          >
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
                              ? "Already reported"
                              : "Report this review"}
                          </p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>
                  {:else}
                    <div class="flex items-center gap-2">
                      <button
                        class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
                        onclick={() =>
                          openEditDialog({
                            reviewId: highlightedReview.data.id,
                            title: highlightedReview.data.title,
                            content: highlightedReview.data.content,
                            rating: highlightedReview.data.rating,
                            dogBreeds: highlightedReview.data.dogBreeds,
                            numDogs: highlightedReview.data.numDogs,
                            visitDate: highlightedReview.data.visitDate,
                            images: highlightedReview.data.images ?? [],
                          })}>Edit</button
                      >
                      <button
                        class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
                        onclick={() =>
                          openDeleteDialog(highlightedReview.data.id)}
                        >Delete</button
                      >
                    </div>
                  {/if}
                </div>
                <div class="mt-2 flex flex-wrap gap-1">
                  {#each highlightedReview.data.dogBreeds as breed}
                    <Badge
                      variant="breed"
                      class="rounded-full px-2 py-1 text-xs font-semibold"
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
            <div class="flex flex-wrap gap-2">
              {#each highlightedReview.data.images as image}
                <button
                  class="appearance-none group relative cursor-pointer overflow-hidden rounded-sm md:rounded-xl"
                  onclick={() => openImageDialog(image)}
                >
                  <OptimizedImage
                    imageId={image.imageId}
                    alt="review image"
                    variant="thumbnail"
                    class="group-hover:brightness-80 size-20 object-cover object-center transition-all duration-400"
                    width="80"
                    height="80"
                  />
                </button>
              {/each}
            </div>
          </div>
          <!-- Review Image Dialog/Drawer -->
          <ReviewImageDialog
            open={imageDialogOpen}
            onOpenChange={(open) => (imageDialogOpen = open)}
            images={highlightedReview.data.images}
            image={currentImage}
            reviewUserName={highlightedReview.data.user.name}
            dogs={highlightedReview.data.dogs}
          />
        {/if}
        {#each filteredReviews as review}
          {@const reviewId = review.id}
          {@const reviewUserId = review.user.id}
          {@const reviewUserImage =
            review.user && review.user.image
              ? review.user.image
              : buildImageUrl(review.user?.profileImageId ?? "", "thumbnail")}
          <div class="rounded-lg p-6 bg-white shadow-sm">
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
                    <h4 class="font-semibold text-lg">{review.user.name}</h4>
                    <div class="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span class="text-sm">
                        {formatDate(review.visitDate.toString())} &middot; {review.numDogs}
                        {review.numDogs === 1 ? "dog" : "dogs"}
                      </span>
                    </div>
                  </div>
                  {#if !review.isOwner}
                    <div class="flex items-center gap-2">
                      <LikeReviewButton
                        {reviewId}
                        hasLiked={review.hasLiked}
                        likesCount={review.likesCount}
                        {placeId}
                        {currentPage}
                        {limit}
                      />
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Button
                            variant="outline"
                            class="rounded-full p-1"
                            onclick={() =>
                              handleOpenReportDialog(
                                review.id,
                                review.hasReported,
                              )}
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
                        <Tooltip.Content>
                          <p>
                            {review.hasReported
                              ? "Update your report"
                              : "Report this review"}
                          </p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>
                  {:else}
                    <div class="flex items-center gap-2">
                      <button
                        class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
                        onclick={() =>
                          openEditDialog({
                            reviewId: review.id,
                            title: review.title,
                            content: review.content,
                            rating: review.rating,
                            dogBreeds: review.dogBreeds,
                            numDogs: review.numDogs,
                            visitDate: review.visitDate,
                            images: review.images ?? [],
                          })}>Edit</button
                      >
                      <button
                        class="text-xs cursor-pointer font-semibold text-primary-tint hover:underline"
                        onclick={() => openDeleteDialog(review.id)}
                        >Delete</button
                      >
                    </div>
                  {/if}
                </div>
                <div class="mt-2 flex flex-wrap gap-1">
                  {#each review.dogBreeds as breed}
                    <Badge
                      variant="breed"
                      class="rounded-full px-2 py-1 text-xs font-medium"
                    >
                      {breed}
                    </Badge>
                  {/each}
                </div>
              </div>
            </div>
            <p class="mb-1 font-semibold leading-tight font-headline text-xl">
              {review.title}
            </p>
            <p class="mb-4 text-sm text-muted-foreground leading-relaxed">
              {review.content}
            </p>
            <!-- Review Image Dialog -->
            <div class="flex flex-wrap gap-2">
              {#each review.images as image}
                <button
                  class="appearance-none group relative cursor-pointer overflow-hidden rounded-sm md:rounded-2xl"
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
          </div>
          <!-- Review Image Dialog/Drawer -->
          <ReviewImageDialog
            open={imageDialogOpen}
            onOpenChange={(open) => (imageDialogOpen = open)}
            images={review.images}
            image={currentImage}
            reviewUserName={review.user.name}
            dogs={review.dogs}
          />
        {/each}
      </div>
      {#if reviewCount > 5}
        <div class="py-8">
          <Pagination.Root
            count={reviewCount}
            perPage={5}
            bind:page={currentPage}
          >
            {#snippet children({ pages, currentPage })}
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.PrevButton />
                </Pagination.Item>
                <Pagination.Item class="flex items-center gap-2">
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
    {:else if !reviews.isLoading}
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
</phantom-ui>

<DeleteReviewDialog bind:open={deleteOpen} reviewId={deleteReviewId} />
<EditReviewDialog
  open={editOpen}
  onOpenChange={(o) => (editOpen = o)}
  reviewData={editReviewData}
  {placeName}
/>
