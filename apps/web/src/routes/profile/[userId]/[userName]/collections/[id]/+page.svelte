<script lang="ts">
  import { api } from "$lib/api-helper";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, CollectionWithPlaces } from "@woofs/types";
  import {
    collectionPlaces,
    selectedPlaceId,
  } from "$lib/stores/collectionStore";
  import { ChevronRight, Search, Star } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import CollectionMap from "$lib/components/collection-map.svelte";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import { Drawer } from "$lib/components/ui/drawer";
  import { Drawer as DrawerPrimitive } from "vaul-svelte";

  interface Props {
    data: {
      initialCollectionWithPlaces: CollectionWithPlaces;
      userId: string;
      userName: string;
      id: string;
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { initialCollectionWithPlaces, userId, userName, id, user } =
    $derived(data);

  const collectionWithPlaces = createQuery(() => ({
    queryKey: ["collectionWithPlaces", userId, id],
    queryFn: () => api.collection.getCollectionWithPlaces(userId, id),
    initialData: initialCollectionWithPlaces,
  }));

  $effect(() => {
    if (collectionWithPlaces.data?.places) {
      collectionPlaces.set(collectionWithPlaces.data.places);
    }
  });

  const snapPoints = ["140px", 0.5, 1];
  let activeSnapPoint = $state<string | number>(snapPoints[0]);
</script>

<div>
  {#if collectionWithPlaces.isLoading}
    <div class="flex items-center justify-center h-140">
      <Spinner />
    </div>
  {:else if collectionWithPlaces.data.places.length === 0}
    <p class="text-center text-gray-500">No places in this collection.</p>
  {:else}
    <!-- Desktop layout -->
    <main class="hidden md:flex bg-[#fdf9f6] h-[90vh] flex-row overflow-hidden">
      <!-- Left: Collection List -->
      <section
        class="w-full md:w-112.5 lg:w-125 h-full flex flex-col bg-surface z-10"
      >
        <div class="p-8 pb-4">
          <nav
            class="flex items-center gap-2 text-label text-on-surface-variant mb-4"
          >
            <a
              class="text-muted-foreground hover:text-primary"
              href={`/profile/${userId}/${userName}`}>Profile</a
            >
            <ChevronRight class="size-4" />
            <a
              class="text-muted-foreground hover:text-primary"
              href={`/profile/${userId}/${userName}/collections`}>Collections</a
            >
            <ChevronRight class="size-4" />
            <span class="font-bold"
              >{collectionWithPlaces.data.collection.name}</span
            >
          </nav>
          <div class="flex items-end justify-between mb-2">
            <h1 class="serif-text italic text-4xl font-semibold text-primary">
              {collectionWithPlaces.data.collection.name}
            </h1>
            <span
              class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold mb-1"
              >{collectionWithPlaces.data.collection.itemCount} Places</span
            >
          </div>
          <p
            class="text-on-surface-variant font-body text-sm leading-relaxed max-w-sm"
          >
            {collectionWithPlaces.data.collection.description}
          </p>
          <div class="mt-6 relative w-full md:w-80 group">
            <div
              class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
            >
              <Search class="size-4 text-primary" />
            </div>
            <Input
              class="w-full pl-12 pr-4 py-3 bg-surface-raised border-none rounded-full focus:ring-2 focus:ring-primary font-body transition-all"
              placeholder="Search this collection..."
              type="text"
            />
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-8 pb-20 pt-5 space-y-4">
          {#each collectionWithPlaces.data.places as place}
            <div
              class="group relative bg-white cursor-pointer rounded-lg overflow-hidden ring-2 transition-all {$selectedPlaceId ===
              place.id
                ? 'ring-primary'
                : 'ring-transparent'}"
              onclick={() => selectedPlaceId.set(place.id)}
              role="button"
              tabindex="0"
              onkeydown={(e) =>
                e.key === "Enter" && selectedPlaceId.set(place.id)}
            >
              <div class="flex gap-4 p-4">
                <div class="size-24 rounded-lg overflow-hidden shrink-0">
                  <OptimizedImage
                    imageId={place.imageId}
                    alt={place.name}
                    class="w-full h-full object-cover object-center"
                    variant="card"
                    height="96"
                    width="96"
                  />
                </div>
                <div class="flex flex-col justify-between py-1 flex-1 min-w-0">
                  <div>
                    <div class="flex justify-between items-center">
                      <h3
                        class="font-headline font-bold text-lg text-primary leading-tight"
                      >
                        {place.name}
                      </h3>
                      <div class="flex items-center text-tertiary-fixed-dim">
                        <Star class="size-3 fill-yellow-400 text-yellow-400" />
                        <span class="text-xs font-bold text-on-surface ml-1"
                          >{place.rating}</span
                        >
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground font-body">
                      {place.cityName}, {place.regionName}
                      {place.countryCode}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    {#each place.types as type}
                      <Badge variant="secondary">{type}</Badge>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Right: Interactive Map -->
      <section class="flex-1 h-full p-4 relative overflow-hidden">
        <CollectionMap
          selectedPlaceId={$selectedPlaceId}
          places={$collectionPlaces}
        />
      </section>
    </main>

    <!-- Mobile layout: full-screen map + bottom drawer -->
    <div class="md:hidden relative h-dvh">
      <!-- Full screen map -->
      <div class="absolute inset-0">
        <CollectionMap
          selectedPlaceId={$selectedPlaceId}
          places={$collectionPlaces}
        />
      </div>

      <!-- Bottom drawer -->
      <Drawer
        direction="bottom"
        bind:activeSnapPoint
        {snapPoints}
        open={true}
        modal={false}
        shouldScaleBackground={false}
        dismissible={false}
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Content
            class="md:hidden fixed inset-x-0 bottom-0 z-60 flex h-full max-h-dvh flex-col rounded-t-lg bg-white border-0"
          >
            <div
              class="mx-auto mt-4 mb-1 h-2 w-25 shrink-0 rounded-full bg-muted"
            ></div>
            <!-- Header always visible at peek height -->
            <div class="px-6 pt-2 pb-4">
              <h1 class="serif-text italic text-2xl font-semibold text-primary">
                {collectionWithPlaces.data.collection.name}
              </h1>
              <div class="flex items-center justify-between mt-1">
                <p class="text-on-surface-variant text-sm">
                  {collectionWithPlaces.data.collection.description}
                </p>
                <span
                  class="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ml-2"
                  >{collectionWithPlaces.data.collection.itemCount} Places</span
                >
              </div>
              {#if activeSnapPoint !== "140px"}
                <div class="mt-3 relative w-full">
                  <div
                    class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
                  >
                    <Search class="size-4 text-primary" />
                  </div>
                  <Input
                    class="w-full pl-12 pr-4 py-2.5 bg-surface-raised border-none rounded-full focus:ring-2 focus:ring-primary font-body"
                    placeholder="Search this collection..."
                    type="text"
                  />
                </div>
              {/if}
            </div>

            <!-- Scrollable place list -->
            <div class="flex-1 overflow-y-auto px-6 pb-32 space-y-3">
              {#each collectionWithPlaces.data.places as place}
                <div
                  class="group relative bg-white cursor-pointer border rounded-lg overflow-hidden ring-2 transition-all {$selectedPlaceId ===
                  place.id
                    ? 'ring-primary'
                    : 'ring-transparent'}"
                  onclick={() => selectedPlaceId.set(place.id)}
                  role="button"
                  tabindex="0"
                  onkeydown={(e) =>
                    e.key === "Enter" && selectedPlaceId.set(place.id)}
                >
                  <div class="flex gap-4 p-4">
                    <div class="size-20 rounded-lg overflow-hidden shrink-0">
                      <OptimizedImage
                        imageId={place.imageId}
                        alt={place.name}
                        class="w-full h-full object-cover object-center"
                        variant="card"
                        height="80"
                        width="80"
                      />
                    </div>
                    <div
                      class="flex flex-col justify-between py-1 flex-1 min-w-0"
                    >
                      <div>
                        <div class="flex justify-between items-center">
                          <h3
                            class="font-headline font-bold text-base text-primary leading-tight truncate"
                          >
                            {place.name}
                          </h3>
                          <div class="flex items-center shrink-0 ml-2">
                            <Star
                              class="size-3 fill-yellow-400 text-yellow-400"
                            />
                            <span class="text-xs font-bold text-on-surface ml-1"
                              >{place.rating}</span
                            >
                          </div>
                        </div>
                        <p class="text-xs text-muted-foreground font-body">
                          {place.cityName}, {place.regionName}
                        </p>
                      </div>
                      <div class="flex gap-2 mt-1">
                        {#each place.types as type}
                          <Badge variant="secondary">{type}</Badge>
                        {/each}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </Drawer>
    </div>
  {/if}
  <div class="hidden sm:block">
    <Footer />
  </div>
  <MobileBottomNav {user} />
</div>
