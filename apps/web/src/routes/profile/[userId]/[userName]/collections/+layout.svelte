<script lang="ts">
  import { api } from "$lib/api-helper";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, UserCollection } from "@woofs/types";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import type { Snippet } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/state";
  import {
    hoveredPlaceId,
    collectionPlaces,
  } from "$lib/stores/collectionStore";
  import CollectionMap from "$lib/components/collection-map.svelte";
  import { BookMarked } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import CollectionSheet from "$lib/components/collection-sheet.svelte";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfileCollections: UserCollection;
    };
    children: Snippet<[]>;
  }

  const { data, children }: Props = $props();
  const { user, userName, userId, initialProfileCollections } = $derived(data);

  const profileCollections = createQuery(() => ({
    queryKey: ["profileCollections", userId],
    queryFn: () => api.collection.getProfileCollections(userId),
    initialData: initialProfileCollections,
  }));

  let sheetOpen = $state<boolean>(false);

  const isOwner = $derived(profileCollections.data?.isOwner ?? false);
  const selectedCollectionId = $derived(page.params.id);

  const handleSheetOpen = () => {
    sheetOpen = true;
  };

  const handleSelectCollection = (collectionId: string) => {
    sheetOpen = false;
    goto(`/profile/${userId}/${userName}/collections/${collectionId}`);
  };
</script>

<!-- Mobile map  -->
{#if selectedCollectionId}
  <div class="lg:hidden w-full h-100 relative">
    <Button
      onclick={handleSheetOpen}
      variant="outline"
      size="icon"
      class="absolute top-2 left-2 z-50"
      ><BookMarked />
    </Button>
    <CollectionMap
      hoveredPlaceId={$hoveredPlaceId}
      places={$collectionPlaces}
    />
  </div>
{/if}

<div
  class="mx-auto w-full max-w-full grow lg:flex xl:pl-2 h-[calc(100vh-8.5rem)] overflow-y-hidden"
>
  <CollectionSheet
    bind:open={sheetOpen}
    profileCollections={profileCollections.data}
    {isOwner}
    {selectedCollectionId}
    {handleSelectCollection}
  />
  <div class="flex-1 lg:flex h-full w-full">
    <!-- Sidebar -->
    <div
      class="border-gray-200 p-4 lg:pl-8 xl:w-96 xl:shrink-0 lg:border-r xl:border-b-0 xl:pl-6 h-full overflow-y-auto
    {selectedCollectionId ? 'hidden' : 'hidden lg:block'}"
    >
      <div>
        <h2 class="text-lg font-semibold">Collections</h2>
        {#if profileCollections.isLoading}
          <div class="flex items-center justify-center h-140">
            <Spinner />
          </div>
        {:else if profileCollections.data.isPrivate && !isOwner}
          <div
            class="flex flex-col items-center justify-center h-48 gap-3 text-center"
          >
            <p class="text-sm font-medium">Collections are private</p>
            <p class="text-xs text-muted-foreground">
              This user has chosen to keep their collections private
            </p>
          </div>
        {:else if !profileCollections.data?.collections?.length}
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
          <div class="flex flex-col gap-2 py-4">
            {#each profileCollections.data?.collections as collection}
              {@const images = collection.previewImages}
              <a
                href="/profile/{userId}/{userName}/collections/{collection.id}"
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
                        <div
                          class="bg-muted size-16 overflow-hidden rounded-md"
                        >
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
                      <div class="px-2 flex-1 min-w-0">
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
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="p-4 flex-1 overflow-y-auto">
      {@render children()}
    </div>
  </div>

  {#if selectedCollectionId}
    <div
      class="shrink-0 border-gray-200 xl:p-4 w-140 xl:w-160 2xl:w-180 sticky top-0 h-full overflow-hidden"
    >
      <CollectionMap
        hoveredPlaceId={$hoveredPlaceId}
        places={$collectionPlaces}
      />
    </div>
  {/if}
</div>
