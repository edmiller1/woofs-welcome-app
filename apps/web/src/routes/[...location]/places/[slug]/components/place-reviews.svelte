<script lang="ts">
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { cn } from "$lib/utils";
  import { Flag, Star, ThumbsUp } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import StarRating from "$lib/components/star-rating.svelte";
  import type { BAUser } from "@woofs/types";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { Badge } from "$lib/components/ui/badge";
  import * as Pagination from "$lib/components/ui/pagination/index.js";

  interface Props {
    placeId: string;
    placeName: string;
    user: BAUser | null;
    reviewCount: number;
  }

  const { placeId, placeName, user, reviewCount }: Props = $props();

  let page = $state<number>(1);
  const limit = $state<number>(10);

  const reviews = createQuery(() => ({
    queryKey: ["place-reviews", placeId, page, limit],
    queryFn: () => api.place.getPlaceReviews(placeId, page, limit),
  }));

  const handleChangePage = (newPage: number) => {
    page = newPage;
  };

  const handleNextPage = () => {
    page++;
  };

  const handlePreviousPage = () => {
    page--;
  };
</script>

<ErrorBoundary error={reviews.error}>
  {#if reviews.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if reviews.isSuccess && reviews.data.length > 0}
    <div class="space-y-6">
      {#each reviews.data as review}
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
              <div class="mt-2 flex gap-1">
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
        </div>
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
    <div>
      <p class="text-muted-foreground mb-6">
        Be the first to review {placeName}!
      </p>
    </div>
  {/if}
</ErrorBoundary>
