<script lang="ts">
  import { api } from "$lib/api-helper";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { BookMarked } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, UserCollection } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfileCollections: UserCollection;
    };
  }

  const { data }: Props = $props();
  const { user, userName, userId, initialProfileCollections } = $derived(data);

  const profileCollections = createQuery(() => ({
    queryKey: ["profileCollections", userId],
    queryFn: () => api.collection.getProfileCollections(userId),
    initialData: initialProfileCollections,
  }));
</script>

<!-- Large screens -->
<div class="hidden lg:block">
  {#if profileCollections.isLoading}
    <div class="min-h-64 sm:min-h-160 flex items-center justify-center">
      <Spinner />
    </div>
  {:else if profileCollections.data?.isPrivate && !profileCollections.data.isOwner}
    <div
      class="flex flex-col items-center justify-center h-48 gap-3 text-center"
    >
      <BookMarked class="size-12 text-muted-foreground" />
      <p class="font-medium">Collections are private</p>
      <p class="text-sm text-muted-foreground">
        This user has chosen to keep their collections private
      </p>
    </div>
  {:else}
    <div
      class="flex flex-col items-center justify-center h-48 gap-3 text-center"
    >
      <BookMarked class="size-12 text-muted-foreground" />
      <p class="font-medium">Select a collection</p>
      <p class="text-sm text-muted-foreground">
        Choose a collection from the sidebar to view its places
      </p>
    </div>
  {/if}
</div>

<!-- Small screens -->
<div class="lg:hidden block">
  {#if profileCollections.isLoading}
    <div class="min-h-64 sm:min-h-160 flex items-center justify-center">
      <Spinner />
    </div>
  {:else if profileCollections.data?.isPrivate && !profileCollections.data.isOwner}
    <div
      class="flex flex-col items-center justify-center h-48 gap-3 text-center"
    >
      <BookMarked class="size-12 text-muted-foreground" />
      <p class="font-medium">Collections are private</p>
      <p class="text-sm text-muted-foreground">
        This user has chosen to keep their collections private
      </p>
    </div>
  {:else if profileCollections.data.collections.length === 0}
    <div
      class="flex flex-col items-center justify-center h-full gap-3 text-center"
    >
      <BookMarked class="size-12 text-muted-foreground" />
      <p class="font-medium">Select a collection</p>
      <p class="text-sm text-muted-foreground">
        Choose a collection from the sidebar to view its places
      </p>
    </div>
  {:else}
    <div>
      <h2 class="text-lg font-semibold">Collections</h2>
      <div class="grid grid-cols-2 gap-4 py-4">
        {#each profileCollections.data?.collections as collection}
          {@const images = collection.previewImages}
          <a href="/profile/{userId}/{userName}/collections/{collection.id}">
            <div
              class="w-full border rounded-lg cursor-pointer p-1 transition-colors hover:bg-muted"
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
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
