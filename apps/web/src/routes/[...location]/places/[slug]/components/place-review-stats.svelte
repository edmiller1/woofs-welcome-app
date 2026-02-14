<script lang="ts">
  import { page } from "$app/state";
  import StarRating from "$lib/components/star-rating.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { PenLine, Star } from "@lucide/svelte";
  import type { BAUser, PlaceReviewStats } from "@woofs/types";

  interface Props {
    placeId: string;
    placeSlug: string;
    reviewStats: PlaceReviewStats;
    reviewDrawerOpen: boolean;
    openReviewDrawer: (rating: number) => void;
    user: BAUser | null;
  }

  const {
    reviewStats,
    placeSlug,
    placeId,
    reviewDrawerOpen,
    openReviewDrawer,
    user,
  }: Props = $props();
</script>

<div class="mb-6 flex items-center justify-between">
  <div>
    <h3 class="text-2xl font-semibold">
      Reviews ({reviewStats.totalReviews})
    </h3>
    <div class="mt-2 flex items-center gap-2">
      <div class="flex items-center gap-2">
        <StarRating rating={reviewStats.averageRating} />
        <span class="text-muted-foreground text-sm"
          >{reviewStats.averageRating} out of 5
        </span>
      </div>
      &middot;
      <span class="text-muted-foreground text-sm"
        >Based on {reviewStats.totalReviews} dog owner reviews
      </span>
    </div>
  </div>
  {#if user}
    <Button variant="outline" onclick={() => openReviewDrawer(0)}>
      <PenLine class="size-4" /> Write a Review
    </Button>
  {:else}
    <a
      href={`/sign-in?redirect=${page.url.pathname}`}
      class={cn(buttonVariants({ variant: "outline" }))}
    >
      <PenLine class="size-4" /> Write a Review
    </a>
  {/if}
</div>

<div class="border-muted border shadow-xs mb-8 rounded-lg p-6">
  <div class="space-y-3">
    {#each reviewStats.reviewBreakdown as { rating, count, percentage }}
      <div class="flex items-center gap-3">
        <div class="flex w-16 items-center gap-1">
          <span class="text-sm">{rating}</span>
          <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
        <div class="h-2 flex-1 rounded-full bg-gray-200">
          <div
            class="h-2 rounded-full bg-yellow-400 transition-all duration-300"
            style={`width: ${percentage}%`}
          ></div>
        </div>
        <div class="text-muted-foreground w-12 text-right text-sm">
          {count > 0 ? `${percentage}%` : "0%"}
        </div>
      </div>
    {/each}
  </div>
</div>
