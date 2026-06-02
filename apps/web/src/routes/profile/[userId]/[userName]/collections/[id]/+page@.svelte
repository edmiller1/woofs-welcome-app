<script lang="ts">
  import { api } from "$lib/api-helper";
  import { Spinner } from "$lib/components/ui/spinner";
  import {
    createMutation,
    createQuery,
    keepPreviousData,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { BAUser, CollectionWithPlaces } from "@woofs/types";
  import {
    collectionPlaces,
    selectedPlaceId,
  } from "$lib/stores/collectionStore";
  import {
    ArrowLeft,
    ArrowUpDown,
    BookMarked,
    ChevronRight,
    Heart,
    Search,
    Share,
    SlidersHorizontal,
    Star,
    X,
  } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import CollectionMap from "$lib/components/collection-map.svelte";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import { Drawer } from "$lib/components/ui/drawer";
  import { Drawer as DrawerPrimitive } from "vaul-svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { toast } from "svelte-sonner";
  import Navbar from "$lib/components/navbar.svelte";

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

  const queryClient = useQueryClient();

  const LIMIT = 20;
  let searchInput = $state("");
  let debouncedSearch = $state("");
  let page = $state(1);
  let debounceTimer: ReturnType<typeof setTimeout>;
  let sortBy = $state("createdAt_desc");

  function handleSearchInput(value: string) {
    searchInput = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedSearch = value;
      page = 1;
    }, 300);
  }

  const collectionWithPlaces = createQuery(() => ({
    queryKey: [
      "collectionWithPlaces",
      userId,
      id,
      debouncedSearch,
      page,
      sortBy,
    ],
    queryFn: () =>
      api.collection.getCollectionWithPlaces(userId, id, {
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        sortBy,
      }),
    initialData:
      page === 1 && !debouncedSearch && sortBy === "createdAt_desc"
        ? initialCollectionWithPlaces
        : undefined,
    placeholderData: keepPreviousData,
  }));

  const removePlaceFromCollection = createMutation(() => ({
    mutationFn: ({
      placeId,
      collectionId,
    }: {
      placeId: string;
      collectionId: string;
    }) => api.collection.removePlaceFromCollection(placeId, collectionId),
    onSuccess: () => {
      toast.success("Place removed from collection!");
      queryClient.invalidateQueries({
        queryKey: ["collectionWithPlaces", userId, id, debouncedSearch, page],
      });
    },
  }));

  $effect(() => {
    if (collectionWithPlaces.data?.places) {
      collectionPlaces.set(collectionWithPlaces.data.places);
    }
  });

  const snapPoints = ["200px", 1];
  let activeSnapPoint = $state<string | number>(snapPoints[0]);
  const isDrawerFullyOpen = $derived(activeSnapPoint !== "200px");
  let hoveredPlaceId = $state<string | null>(null);
  let isMobile = $state(false);

  $effect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    isMobile = mq.matches;
    const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  });
</script>

<Navbar {user} />

<!-- Mobile back bar -->
<div class="lg:hidden sticky top-16 z-40 bg-white backdrop-blur-sm px-4 py-2.5">
  <a
    href={`/profile/${userId}/${userName}/collections`}
    class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-on-surface transition-colors"
  >
    <ArrowLeft class="size-4" />
    Collections
  </a>
</div>

<main class="min-h-screen">
  <section class="w-full bg-surface-container-lowest pt-12 pb-16">
    <div
      class="max-w-360 mx-auto px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
    >
      <div class="space-y-6">
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href={`/profile/${userId}/${userName}`}
                class="capitalize"
              >
                {userName.split("-").join(" ").toLowerCase()}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href={`/profile/${userId}/${userName}/collections`}
                >Collections</Breadcrumb.Link
              >
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              {#if collectionWithPlaces.isLoading}
                <Skeleton class="h-4 w-28 rounded" />
              {:else}
                <Breadcrumb.Page class="font-semibold"
                  >{collectionWithPlaces.data?.collection.name}</Breadcrumb.Page
                >
              {/if}
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
        {#if collectionWithPlaces.isLoading}
          <div class="flex items-center gap-3">
            <Skeleton class="h-7 w-24 rounded-full" />
            <Skeleton class="h-4 w-48 rounded-full" />
          </div>
          <Skeleton class="h-10 w-72 rounded-lg" />
          <Skeleton class="h-16 w-full max-w-xl rounded-lg" />
          <Skeleton class="h-11 w-40 rounded-full mt-3" />
        {:else if collectionWithPlaces.isError}
          <p class="text-muted-foreground">Failed to load collection. Please try refreshing the page.</p>
        {:else}
          <!-- Breadcrumbs -->
          <div class="flex items-center gap-3">
            <Badge variant="secondary" class="rounded-full text-base"
              >Collection</Badge
            >
            <span class="text-on-surface-variant font-label-sm text-label-sm"
              >{collectionWithPlaces.data?.places.length} Places • Created by
              <span class="capitalize font-semibold"
                >{userName.split("-").join(" ").toLowerCase()}</span
              ></span
            >
          </div>
          <h1 class="font-bold text-4xl text-on-surface tracking-tight">
            {collectionWithPlaces.data?.collection.name}
          </h1>
          <p class="text-on-surface-variant max-w-xl">
            {collectionWithPlaces.data?.collection.description ||
              "No description provided for this collection."}
          </p>
          <div class="pt-3">
            <button
              class="bg-primary-container gap-2 cursor-pointer text-on-primary-container px-10 py-3 rounded-full font-bold flex items-center gap-xs hover:shadow-lg transition-all active:scale-95"
            >
              <Share class="size-4" />
              Share List
            </button>
          </div>
        {/if}
      </div>
      <div
        class="relative h-80 lg:h-full rounded-4xl overflow-hidden shadow-2xl"
      >
        {#if collectionWithPlaces.isLoading}
          <Skeleton class="w-full h-full rounded-xl lg:rounded-4xl" />
        {:else if collectionWithPlaces.data?.places[0]?.imageId}
          <OptimizedImage
            class="w-full h-full object-cover"
            alt="Places"
            imageId={collectionWithPlaces.data.places[0].imageId}
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"
          ></div>
          <div class="absolute bottom-6 left-6 text-white">
            <p class="opacity-80 uppercase tracking-widest">Featured Place</p>
            <p class="font-semibold text-2xl">
              {collectionWithPlaces.data.places[0].name}
            </p>
          </div>
        {:else}
          <div
            class="w-full h-full bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground"
          >
            <BookMarked class="size-12 opacity-40" />
            <p class="text-sm">No places added yet</p>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Desktop: side-by-side list + map -->
  <section class="hidden lg:block max-w-360 mx-auto px-12 py-16">
    <div class="flex gap-10">
      <div class="w-md shrink-0 space-y-6">
        <div class="flex justify-between items-center pb-6">
          <h2 class="font-semibold text-lg text-on-surface">
            {#if collectionWithPlaces.isLoading}
              <Skeleton class="h-6 w-24 rounded" />
            {:else}
              {collectionWithPlaces.data?.places.length} Places
            {/if}
          </h2>
          <Select.Root
            type="single"
            bind:value={sortBy}
            onValueChange={() => (page = 1)}
          >
            <Select.Trigger
              class="h-8 text-xs border-none shadow-none text-primary-tint gap-1.5 pl-2 pr-3 rounded-full hover:bg-gray-100 w-auto"
            >
              <ArrowUpDown class="size-3" />
              {#if sortBy === "name_asc"}Name A–Z
              {:else if sortBy === "name_desc"}Name Z–A
              {:else if sortBy === "rating_desc"}Highest Rated
              {:else if sortBy === "rating_asc"}Lowest Rated
              {:else if sortBy === "city_asc"}City A–Z
              {:else if sortBy === "city_desc"}City Z–A
              {:else}Recently Added{/if}
            </Select.Trigger>
            <Select.Content align="end">
              <Select.Item value="createdAt_desc">Recently Added</Select.Item>
              <Select.Item value="name_asc">Name A–Z</Select.Item>
              <Select.Item value="name_desc">Name Z–A</Select.Item>
              <Select.Item value="rating_desc">Highest Rated</Select.Item>
              <Select.Item value="rating_asc">Lowest Rated</Select.Item>
              <Select.Item value="city_asc">City A–Z</Select.Item>
              <Select.Item value="city_desc">City Z–A</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="space-y-4 py-4 overflow-y-auto max-h-200 no-scrollbar pr-2">
          {#if collectionWithPlaces.isLoading || collectionWithPlaces.isFetching}
            {#each { length: 5 } as _}
              <div
                class="bg-white rounded-2xl shadow-sm border border-secondary/5 overflow-hidden"
              >
                <div class="flex gap-4 p-3">
                  <Skeleton class="size-20 shrink-0 rounded-xl" />
                  <div class="flex flex-col justify-center flex-1 gap-2">
                    <div class="flex items-center justify-between gap-2">
                      <Skeleton class="h-5 w-20 rounded-full" />
                      <Skeleton class="h-4 w-10 rounded-full" />
                    </div>
                    <Skeleton class="h-5 w-3/4 rounded" />
                    <Skeleton class="h-3 w-1/2 rounded" />
                  </div>
                </div>
              </div>
            {/each}
          {:else if collectionWithPlaces.isError}
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p class="font-medium text-on-surface">Failed to load places</p>
              <p class="text-sm text-muted-foreground">Something went wrong. Please try refreshing the page.</p>
            </div>
          {:else if (collectionWithPlaces.data?.places ?? []).length === 0}
            <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <BookMarked class="size-10 text-muted-foreground opacity-40" />
              <p class="font-medium text-on-surface">
                {debouncedSearch ? `No places found for "${debouncedSearch}"` : "No places in this collection yet"}
              </p>
              {#if !debouncedSearch}
                <p class="text-sm text-muted-foreground">Save places to this collection to see them here</p>
              {/if}
            </div>
          {:else}
            {#each collectionWithPlaces.data?.places ?? [] as place}
              <div
                class="trail-card group bg-white rounded-2xl shadow-sm border border-secondary/5 cursor-pointer overflow-hidden"
                role="button"
                tabindex="0"
                onmouseenter={() => (hoveredPlaceId = place.id)}
                onmouseleave={() => (hoveredPlaceId = null)}
              >
                <div class="flex gap-4 p-3">
                  <div class="size-20 shrink-0 rounded-xl overflow-hidden">
                    <OptimizedImage
                      class="w-full h-full object-cover object-center"
                      imageId={place.imageId}
                      alt={place.name}
                      height="100%"
                    />
                  </div>
                  <div
                    class="flex flex-col justify-center flex-1 min-w-0 gap-1"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        class="text-xs rounded-full font-normal text-muted-foreground"
                        >{place.types[0]}</Badge
                      >
                      <div class="flex items-center gap-1 shrink-0">
                        <Star class="size-3 fill-primary text-primary" />
                        <span class="text-xs font-bold">{place.rating}</span>
                      </div>
                    </div>
                    <a
                      href={`/location/${place.locationPath}/places/${place.slug}`}
                    >
                      <h3
                        class="font-bold hover:text-secondary text-base text-on-surface leading-tight"
                      >
                        {place.name}
                      </h3>
                    </a>
                    <p class="text-xs text-muted-foreground">
                      {place.cityName}, {place.regionName}
                      {place.countryCode}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
      <div
        class="flex-1 sticky top-6 h-[calc(100vh-6rem)] rounded-3xl overflow-hidden shadow-sm"
      >
        <CollectionMap
          places={$collectionPlaces}
          collectionId={id}
          {hoveredPlaceId}
        />
      </div>
    </div>
  </section>

  <!-- Mobile: full-height map + bottom drawer -->
  <div class="lg:hidden relative h-[60vh] mb-10">
    <CollectionMap places={$collectionPlaces} collectionId={id} />
  </div>
</main>
<div class="hidden"><Footer /></div>

{#if isMobile}
  <div>
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
          class="fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[92dvh] flex-col rounded-t-2xl bg-white shadow-xl border-0"
        >
          <!-- Handle -->
          <div
            class="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-muted"
          ></div>

          <!-- Header: always visible -->
          <div class="px-5 pt-2 pb-3 shrink-0">
            <div class="flex items-center justify-between">
              <div>
                {#if collectionWithPlaces.isLoading}
                  <Skeleton class="h-5 w-40 rounded mb-1" />
                  <Skeleton class="h-3 w-24 rounded" />
                {:else}
                  <h2 class="font-bold text-base text-on-surface">
                    {collectionWithPlaces.data?.collection.name}
                  </h2>
                  <p class="text-xs text-muted-foreground">
                    {collectionWithPlaces.data?.places.length} Places
                  </p>
                {/if}
              </div>
              <Select.Root
                type="single"
                bind:value={sortBy}
                onValueChange={() => (page = 1)}
              >
                <Select.Trigger
                  class="h-8 text-xs border-none shadow-none text-primary-tint gap-1.5 pl-2 pr-3 rounded-full hover:bg-muted w-auto"
                >
                  <ArrowUpDown class="size-3" />
                  {#if sortBy === "name_asc"}Name A–Z
                  {:else if sortBy === "name_desc"}Name Z–A
                  {:else if sortBy === "rating_desc"}Highest Rated
                  {:else if sortBy === "rating_asc"}Lowest Rated
                  {:else if sortBy === "city_asc"}City A–Z
                  {:else if sortBy === "city_desc"}City Z–A
                  {:else}Recently Added{/if}
                </Select.Trigger>
                <Select.Content align="end">
                  <Select.Item value="createdAt_desc"
                    >Recently Added</Select.Item
                  >
                  <Select.Item value="name_asc">Name A–Z</Select.Item>
                  <Select.Item value="name_desc">Name Z–A</Select.Item>
                  <Select.Item value="rating_desc">Highest Rated</Select.Item>
                  <Select.Item value="rating_asc">Lowest Rated</Select.Item>
                  <Select.Item value="city_asc">City A–Z</Select.Item>
                  <Select.Item value="city_desc">City Z–A</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>

            <!-- Search: only shown when fully open -->
            {#if isDrawerFullyOpen}
              <div class="relative mt-3">
                <div
                  class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
                >
                  <Search class="size-4 text-primary" />
                </div>
                <Input
                  class="w-full pl-10 pr-10 bg-muted border-none rounded-full text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Search places…"
                  type="text"
                  value={searchInput}
                  oninput={(e) =>
                    handleSearchInput((e.target as HTMLInputElement).value)}
                />
                {#if searchInput}
                  <button
                    class="absolute inset-y-0 right-4 flex items-center text-muted-foreground"
                    onclick={() => handleSearchInput("")}
                    aria-label="Clear search"
                  >
                    <X class="size-4" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>

          <div class="h-px bg-border/50 shrink-0"></div>

          <!-- Places list: only scrollable when fully open -->
          <div
            class="flex-1 px-4 py-4 space-y-3 {isDrawerFullyOpen
              ? 'overflow-y-auto'
              : 'overflow-hidden'}"
          >
            {#if collectionWithPlaces.isLoading || collectionWithPlaces.isFetching}
              {#each { length: 5 } as _}
                <div
                  class="bg-white rounded-2xl shadow-sm border border-secondary/5 overflow-hidden"
                >
                  <div class="flex gap-3 p-3">
                    <Skeleton class="size-16 shrink-0 rounded-xl" />
                    <div class="flex flex-col justify-center flex-1 gap-2">
                      <div class="flex items-center justify-between gap-2">
                        <Skeleton class="h-4 w-16 rounded-full" />
                        <Skeleton class="h-4 w-8 rounded-full" />
                      </div>
                      <Skeleton class="h-4 w-3/4 rounded" />
                      <Skeleton class="h-3 w-1/2 rounded" />
                    </div>
                  </div>
                </div>
              {/each}
            {:else if collectionWithPlaces.isError}
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <p class="font-medium text-sm text-on-surface">Failed to load places</p>
                <p class="text-xs text-muted-foreground">Something went wrong. Please try refreshing the page.</p>
              </div>
            {:else if (collectionWithPlaces.data?.places ?? []).length === 0}
              <div class="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <BookMarked class="size-10 text-muted-foreground opacity-40" />
                <p class="font-medium text-sm text-on-surface">
                  {debouncedSearch ? `No places found for "${debouncedSearch}"` : "No places in this collection yet"}
                </p>
                {#if !debouncedSearch}
                  <p class="text-xs text-muted-foreground">Save places to this collection to see them here</p>
                {/if}
              </div>
            {:else}
              {#each collectionWithPlaces.data?.places ?? [] as place}
                <div
                  class="bg-white rounded-2xl shadow-sm border border-secondary/5 cursor-pointer overflow-hidden active:scale-[0.98] transition-transform"
                  role="button"
                  tabindex="0"
                  onkeydown={(e) =>
                    e.key === "Enter" && selectedPlaceId.set(place.id)}
                  onclick={() => selectedPlaceId.set(place.id)}
                >
                  <div class="flex gap-3 p-3">
                    <div class="size-16 shrink-0 rounded-xl overflow-hidden">
                      <OptimizedImage
                        class="w-full h-full object-cover object-center"
                        imageId={place.imageId}
                        alt={place.name}
                        height="100%"
                      />
                    </div>
                    <div
                      class="flex flex-col justify-center flex-1 min-w-0 gap-1"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          class="text-xs rounded-full font-normal text-muted-foreground"
                          >{place.types[0]}</Badge
                        >
                        <div class="flex items-center gap-1 shrink-0">
                          <Star class="size-3 fill-primary text-primary" />
                          <span class="text-xs font-bold">{place.rating}</span>
                        </div>
                      </div>
                      <a
                        href={`/location/${place.locationPath}/places/${place.slug}`}
                      >
                        <h3
                          class="font-bold text-sm text-on-surface leading-tight"
                        >
                          {place.name}
                        </h3>
                      </a>
                      <p class="text-xs text-muted-foreground">
                        {place.cityName}, {place.regionName}
                      </p>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </Drawer>
  </div>
{/if}

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .trail-card:hover {
    transform: translateY(-4px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
