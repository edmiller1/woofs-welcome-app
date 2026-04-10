<script lang="ts">
  import { Flag, PenLine, Trash2 } from "@lucide/svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import StarRating from "$lib/components/star-rating.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import ReviewImageDialog from "$lib/components/review-image-dialog.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";
  import LikeReviewButton from "../../routes/[...location]/places/[slug]/components/like-review-button.svelte";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import { cn } from "$lib/utils";
  import type { PlaceReview, ReviewImage, UpdateReviewData } from "@woofs/types";

  interface Props {
    review: PlaceReview;
    placeId: string;
    placeName: string;
    currentPage?: number;
    limit?: number;
    /** When true, renders with the highlighted (bordered) variant */
    highlighted?: boolean;
    onReport?: (reviewId: string, hasReported: boolean) => void;
  }

  let {
    review,
    placeId,
    placeName,
    currentPage = 1,
    limit = 10,
    highlighted = false,
    onReport,
  }: Props = $props();

  let imageDialogOpen = $state(false);
  let currentImage = $state<ReviewImage | undefined>(undefined);
  let deleteDialogOpen = $state(false);
  let editDialogOpen = $state(false);

  const reviewUserImage = $derived(
    review.user?.image
      ? review.user.image
      : buildImageUrl(review.user?.profileImageId ?? "", "thumbnail"),
  );

  const editReviewData = $derived<UpdateReviewData>({
    reviewId: review.id,
    title: review.title,
    content: review.content,
    rating: review.rating,
    numDogs: review.numDogs,
    dogBreeds: review.dogBreeds,
    visitDate: review.visitDate,
    images: review.images,
  });

  const openImageDialog = (image: ReviewImage) => {
    currentImage = image;
    imageDialogOpen = true;
  };
</script>

<div
  class={cn(
    "rounded-lg p-6 shadow-xs",
    highlighted ? "border border-primary bg-primary/5" : "bg-[#f7f3f0]",
  )}
>
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
            <span class="text-sm text-muted-foreground">
              {formatDate(review.visitDate.toString())} &middot;
              {review.numDogs}
              {review.numDogs === 1 ? "dog" : "dogs"}
            </span>
          </div>
        </div>

        {#if review.isOwner}
          <div class="flex items-center gap-2">
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button
                  variant="outline"
                  class="rounded-full p-1"
                  onclick={() => (editDialogOpen = true)}
                >
                  <PenLine class="size-4 text-muted-foreground" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Edit review</p>
              </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button
                  variant="outline"
                  class="rounded-full p-1"
                  onclick={() => (deleteDialogOpen = true)}
                >
                  <Trash2 class="size-4 text-muted-foreground" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Delete review</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        {:else}
          <div class="flex items-center gap-2">
            <LikeReviewButton
              reviewId={review.id}
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
                  onclick={() => onReport?.(review.id, review.hasReported)}
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
                  {review.hasReported ? "Already reported" : "Report this review"}
                </p>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        {/if}
      </div>

      <div class="mt-2 flex flex-wrap gap-1">
        {#each review.dogBreeds as breed}
          <Badge
            variant="secondary"
            class="rounded-full px-2 py-1 text-xs font-medium"
          >
            {breed}
          </Badge>
        {/each}
      </div>
    </div>
  </div>

  <p class="mb-1 font-semibold leading-tight italic font-headline text-xl">
    {review.title}
  </p>
  <p class="mb-4 text-sm text-muted-foreground leading-relaxed">
    {review.content}
  </p>

  {#if review.images.length > 0}
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
  {/if}
</div>

<!-- Review Image Dialog -->
<ReviewImageDialog
  open={imageDialogOpen}
  onOpenChange={(open) => (imageDialogOpen = open)}
  images={review.images}
  image={currentImage}
  reviewUserName={review.user.name}
/>

<!-- Delete Review Dialog -->
<DeleteReviewDialog bind:open={deleteDialogOpen} reviewId={review.id} />

<!-- Edit Review Dialog -->
<EditReviewDialog
  open={editDialogOpen}
  onOpenChange={(open) => (editDialogOpen = open)}
  reviewData={editReviewData}
  {placeName}
/>
