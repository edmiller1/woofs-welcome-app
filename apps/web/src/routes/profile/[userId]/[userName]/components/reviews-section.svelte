<script lang="ts">
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Star, Telescope } from "@lucide/svelte";
  import type { ProfileReview } from "@woofs/types";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { cn } from "$lib/utils";
  import { Badge } from "$lib/components/ui/badge";
  import PrivacyTooltip from "./privacy-tooltip.svelte";

  interface Props {
    reviews: ProfileReview[];
    isOwner: boolean;
    showReviews: boolean;
    profileName: string;
  }

  const { reviews, isOwner, showReviews, profileName }: Props = $props();

  let showAll = $state<boolean>(false);
  const displayed = $derived(showAll ? reviews : reviews.slice(0, 4));
</script>

<section>
  <div class="flex items-center gap-3">
    <h2 class="text-2xl font-bold text-foreground">Recent reviews</h2>
    <PrivacyTooltip {isOwner} privacyValue={showReviews} />
  </div>

  {#if !isOwner && !showReviews}
    <!-- Section hidden by user settings -->
    <div class="mt-4">
      <p class="text-sm text-foreground">
        {profileName} has chosen to keep their reviews private.
      </p>
    </div>
  {:else if reviews.length > 0}
    <div class="mt-6 grid gap-6 md:grid-cols-2">
      {#each displayed as review}
        <div
          class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        >
          <div class="flex items-center gap-3">
            <OptimizedImage
              imageId="812ee3d9-064e-4395-fe07-fe1751192600"
              alt="review image"
              variant="avatar"
              class="w-10 h-10 rounded-full object-cover object-center"
              width="40"
              height="40"
            />
            <div>
              <p class="text-sm font-semibold text-foreground">
                {review.place.name}
              </p>
              <p class="text-xs text-muted-foreground">
                {review.place.location.name}, {review.place.location.parent
                  .name}
                {review.place.countryCode}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            {#each Array.from({ length: 5 }) as _, i}
              <Star
                class={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-muted text-muted"
                }`}
              />
            {/each}
          </div>
          <span class="text-sm font-semibold">{review.title}</span>
          <p class="text-sm leading-relaxed text-foreground">
            {review.content}
          </p>
          <span class="text-xs text-muted-foreground">{review.visitDate}</span>
        </div>
      {/each}
    </div>
    {#if reviews.length > 4}
      <Button
        variant="outline"
        class="mt-6"
        onclick={() => (showAll = !showAll)}
      >
        {showAll ? "Show less" : "Show more"}
      </Button>
    {/if}
  {:else if isOwner}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Star />
        </Empty.Media>
        <Empty.Title>No Reviews Yet</Empty.Title>
        <Empty.Description>
          You haven't reviewed any places yet. Get started by exploring
          dog-friendly places.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <a href="/explore" class={cn(buttonVariants({ variant: "default" }))}
          ><Telescope /> Explore Places</a
        >
      </Empty.Content>
    </Empty.Root>
  {:else}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Star />
        </Empty.Media>
        <Empty.Title>No Reviews Yet</Empty.Title>
        <Empty.Description>
          {profileName} hasn't reviewed any places yet.
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/if}
</section>
