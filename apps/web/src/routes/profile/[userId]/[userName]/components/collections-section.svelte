<script lang="ts">
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import type { ProfileCollection } from "@woofs/types";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { BookmarkX, Telescope } from "@lucide/svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Badge } from "$lib/components/ui/badge";
  import PrivacyTooltip from "./privacy-tooltip.svelte";

  interface Props {
    collections: ProfileCollection[];
    isOwner: boolean;
    showCollections: boolean;
    profileName: string;
  }

  const { collections, isOwner, showCollections, profileName }: Props =
    $props();
</script>

<section>
  <div class="flex items-center gap-2">
    <h2 class="text-2xl font-bold text-foreground">Collections</h2>
    <PrivacyTooltip {isOwner} privacyValue={showCollections} />
  </div>
  {#if !isOwner && !showCollections}
    <!-- Section hidden by user settings -->
    <div class="mt-4">
      <p class="text-sm text-foreground">
        {profileName} has chosen to keep their collections private.
      </p>
    </div>
  {:else if collections.length > 0}
    <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {#each collections as collection}
        {@const images = collection.items.filter(
          (item) => item.place.images[0],
        )}
        <div
          class="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center"
        >
          {#if images.length === 1}
            <div class="bg-muted size-16 overflow-hidden rounded-md">
              <OptimizedImage
                imageId={images[0].place.images[0].imageId}
                alt={images[0].place.name}
                variant="thumbnail"
                class="size-full object-cover"
                responsive={false}
              />
            </div>
          {:else if images.length === 2}
            <div
              class="bg-muted grid size-16 grid-cols-2 gap-0.5 overflow-hidden rounded-md"
            >
              {#each images as item}
                <OptimizedImage
                  imageId={item.place.images[0].imageId}
                  alt={item.place.name}
                  variant="thumbnail"
                  class="size-full object-cover"
                  responsive={false}
                />
              {/each}
            </div>
          {:else if images.length === 3}
            <div
              class="bg-muted grid size-16 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md"
            >
              <OptimizedImage
                imageId={images[0].place.images[0].imageId}
                alt={images[0].place.name}
                variant="thumbnail"
                class="row-span-2 size-full object-cover"
                responsive={false}
              />
              <OptimizedImage
                imageId={images[1].place.images[0].imageId}
                alt={images[1].place.name}
                variant="thumbnail"
                class="size-full object-cover"
                responsive={false}
              />
              <OptimizedImage
                imageId={images[2].place.images[0].imageId}
                alt={images[2].place.name}
                variant="thumbnail"
                class="size-full object-cover"
                responsive={false}
              />
            </div>
          {:else if images.length >= 4}
            <div
              class="bg-muted grid size-16 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md"
            >
              {#each images.slice(0, 4) as item}
                <OptimizedImage
                  imageId={item.place.images[0].imageId}
                  alt={item.place.name}
                  variant="thumbnail"
                  class="size-full object-cover"
                  responsive={false}
                />
              {/each}
            </div>
          {/if}
          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold text-foreground">
              {collection.name}
            </h3>
            <span class="text-muted-foreground text-xs">
              {collection.itemCount}
              {collection.itemCount === 1 ? "place" : "places"}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {:else if isOwner}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <BookmarkX />
        </Empty.Media>
        <Empty.Title>No Collections Yet</Empty.Title>
        <Empty.Description>
          You haven't created any collections yet. Get started by exploring
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
          <BookmarkX />
        </Empty.Media>
        <Empty.Title>No Collections Yet</Empty.Title>
        <Empty.Description>
          {profileName} hasn't created any collections yet.
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/if}
</section>
