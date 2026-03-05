<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import type { UserCollection } from "@woofs/types";
  import { Button } from "./ui/button";
  import OptimizedImage from "./optimized-image.svelte";
  import { BookMarked } from "@lucide/svelte";

  interface Props {
    open: boolean;
    profileCollections: UserCollection;
    isOwner: boolean;
    selectedCollectionId?: string;
    handleSelectCollection: (collectionId: string) => void;
  }

  let {
    open = $bindable(),
    profileCollections,
    isOwner,
    selectedCollectionId,
    handleSelectCollection,
  }: Props = $props();
</script>

<Sheet.Root {open} onOpenChange={(sheetOpen) => (open = sheetOpen)}>
  <Sheet.Content side="left">
    <Sheet.Header>
      <Sheet.Title class="text-lg font-semibold">Collections</Sheet.Title>
    </Sheet.Header>
    {#if profileCollections.isPrivate && !isOwner}
      <div
        class="flex flex-col items-center justify-center h-48 gap-3 text-center"
      >
        <BookMarked class="size-12 text-muted-foreground" />
        <p class="font-medium">Collections are private</p>
        <p class="text-sm text-muted-foreground">
          This user has chosen to keep their collections private
        </p>
      </div>
    {:else if !profileCollections.collections.length}
      <div
        class="flex flex-col items-center justify-center h-48 gap-3 text-center"
      >
        <p class="text-sm font-medium">No collections yet</p>
        {#if isOwner}
          <p class="text-xs text-muted-foreground">
            Create your first collection to start saving places
          </p>
          <Button size="sm">Create collection</Button>
        {:else}
          <p class="text-xs text-muted-foreground">
            This user hasn't created any public collections
          </p>
        {/if}
      </div>
    {:else}
      <div class="flex flex-col gap-2 p-4">
        {#each profileCollections.collections as collection}
          {@const images = collection.previewImages}
          <button
            aria-label={`Select collection: ${collection.name}`}
            class="appearance-none"
            onclick={() => handleSelectCollection(collection.id)}
          >
            <div
              class="w-full border rounded-lg cursor-pointer p-1 transition-colors
                    {selectedCollectionId === collection.id
                ? 'bg-muted border-primary'
                : 'hover:bg-muted'}"
            >
              <div class="p-1">
                <div class="flex">
                  {#if images.length === 1}
                    <div class="bg-muted size-16 overflow-hidden rounded-md">
                      <OptimizedImage
                        imageId={images[0]}
                        alt={collection.name}
                        variant="thumbnail"
                        class="size-full object-cover"
                        responsive={false}
                      />
                    </div>
                  {:else if images.length === 2}
                    <div
                      class="bg-muted grid size-16 grid-cols-2 gap-0.5 overflow-hidden rounded-md"
                    >
                      {#each images as image}
                        <OptimizedImage
                          imageId={image}
                          alt={collection.name}
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
                        imageId={images[0]}
                        alt={collection.name}
                        variant="thumbnail"
                        class="row-span-2 size-full object-cover"
                        responsive={false}
                      />
                      <OptimizedImage
                        imageId={images[1]}
                        alt={collection.name}
                        variant="thumbnail"
                        class="size-full object-cover"
                        responsive={false}
                      />
                      <OptimizedImage
                        imageId={images[2]}
                        alt={collection.name}
                        variant="thumbnail"
                        class="size-full object-cover"
                        responsive={false}
                      />
                    </div>
                  {:else if images.length >= 4}
                    <div
                      class="bg-muted grid size-16 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-sm"
                    >
                      {#each images.slice(0, 4) as image}
                        <OptimizedImage
                          imageId={image}
                          alt={collection.name}
                          variant="thumbnail"
                          class="size-full object-cover"
                          responsive={false}
                        />
                      {/each}
                    </div>
                  {/if}
                  <div class="px-2 flex flex-col min-w-0">
                    <div class="flex items-center gap-1">
                      <p class="text-sm font-medium truncate">
                        {collection.name}
                      </p>
                      <span class="text-xs text-muted-foreground shrink-0"
                        >({collection.itemCount})</span
                      >
                    </div>
                    {#if collection.description}
                      <p class="text-xs text-muted-foreground line-clamp-1">
                        {collection.description}
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </Sheet.Content>
</Sheet.Root>
