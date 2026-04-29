<script lang="ts">
  import { api } from "$lib/api-helper";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { ArrowRight, Bookmark } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import OptimizedImage from "./optimized-image.svelte";
  import { Separator } from "./ui/separator";
  import type { BAUser } from "@woofs/types";

  interface Props {
    user: BAUser;
  }

  const { user }: Props = $props();

  const collections = createQuery(() => ({
    queryKey: ["collections-limit"],
    queryFn: () => api.collection.getCollectionsOnly(),
  }));
</script>

<Sheet.Root>
  <Sheet.Trigger>
    <button
      class="cursor-pointer p-2 text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
    >
      <Bookmark />
    </button></Sheet.Trigger
  >
  <Sheet.Content side="right" class="bg-white">
    <Sheet.Header class="mb-0">
      <Sheet.Title class="text-2xl font-headline italic text-primary"
        >My Collections</Sheet.Title
      >
      <Sheet.Description class="text-sm text-muted-foreground font-sans"
        >Curated memories and planned journeys</Sheet.Description
      >
    </Sheet.Header>
    <div class="px-2">
      <Separator />
    </div>

    <div class="flex-1 overflow-y-auto px-6 py-8 space-y-6">
      {#if collections.isLoading}
        {#each Array(4) as _}
          <div class="space-y-3">
            <div
              class="h-48 w-full rounded-xl bg-stone-200 animate-pulse"
            ></div>
            <div class="h-5 w-2/3 rounded-md bg-stone-200 animate-pulse"></div>
            <div class="h-4 w-1/4 rounded-md bg-stone-200 animate-pulse"></div>
          </div>
        {/each}
      {:else if collections.isError}
        <p>Error loading collections.</p>
      {:else if collections.data && collections.data.length === 0}
        <p>No collections found.</p>
      {:else}
        {#each collections.data as collection}
          <div class="group cursor-pointer">
            <div
              class="h-48 w-full rounded-xl overflow-hidden mb-3 relative surface-nesting"
            >
              <OptimizedImage
                imageId={collection.items[0].place.images[0].imageId}
                alt={collection.name}
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-bold text-on-surface">
                  {collection.name}
                </h3>
                <p class="text-sm text-secondary font-medium">
                  {collection.itemCount} Places
                </p>
              </div>
            </div>
          </div>
        {/each}
        <div class="pt-4 text-center">
          <a
            href={`/profile/${user.id}/${user.name.split(" ").join("-").toLowerCase()}/collections`}
            class="w-full bg-primary text-white cursor-pointer py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container shadow-md transition-all duration-300 group"
          >
            <span>Show more</span>
            <ArrowRight
              class="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>
        </div>
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>
