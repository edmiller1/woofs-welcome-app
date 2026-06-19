<script lang="ts">
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
  import Footer from "$lib/components/footer.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, LocationPhoto } from "@woofs/types";
  import { Camera } from "@lucide/svelte";

  interface Props {
    data: {
      pathname: string;
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { pathname, user } = $derived(data);

  const limit = 12;
  let page = $state(1);
  let accumulatedPhotos = $state<LocationPhoto[]>([]);
  let total = $state(0);

  const photosQuery = createQuery(() => ({
    queryKey: ["locationPhotos", pathname, page],
    queryFn: () => api.location.getLocationPhotos(pathname, page, limit),
  }));

  $effect(() => {
    if (photosQuery.isSuccess) {
      if (page === 1) {
        accumulatedPhotos = photosQuery.data.photos;
      } else {
        accumulatedPhotos = [...accumulatedPhotos, ...photosQuery.data.photos];
      }
      total = photosQuery.data.total;
    }
  });

  function loadMore() {
    page += 1;
  }

  const showing = $derived(accumulatedPhotos.length);
  const hasMore = $derived(accumulatedPhotos.length < total);

  const locationQuery = createQuery(() => ({
    queryKey: ["location", pathname],
    queryFn: () => api.location.getLocation(pathname),
  }));
</script>

<Navbar {user} />

<main class="min-h-screen bg-surface">
  <div class="max-w-7xl mx-auto px-8 py-12">
    <!-- Breadcrumbs -->
    {#if locationQuery.isSuccess}
      <div class="mb-6">
        <Breadcrumbs items={locationQuery.data.breadcrumbs} location={false} />
      </div>
    {/if}

    <!-- Header -->
    <div class="mb-12">
      <h1 class="font-serif text-5xl mb-3">
        Community Photos
        {#if locationQuery.isSuccess}
          in {locationQuery.data.name}
        {/if}
      </h1>
    </div>

    {#if photosQuery.isLoading && page === 1}
      <!-- Skeleton grid while first page loads -->
      <div class="masonry-grid">
        {#each Array(12) as _}
          <div class="masonry-item">
            <Skeleton
              class="w-full rounded-xl"
              style="height: {Math.floor(Math.random() * 120 + 200)}px;"
            />
          </div>
        {/each}
      </div>
    {:else if accumulatedPhotos.length > 0}
      <!-- Masonry grid -->
      <div class="masonry-grid">
        {#each accumulatedPhotos as photo (photo.cfImageId)}
          <div
            class="masonry-item group relative overflow-hidden rounded-xl shadow-md cursor-pointer"
          >
            <OptimizedImage
              imageId={photo.cfImageId}
              alt={photo.placeName}
              class="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              width="100%"
              height="auto"
              variant="large"
              responsive={false}
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5"
            >
              <span class="text-white font-serif text-xl mb-1 leading-tight"
                >{photo.placeName}</span
              >
              {#if photo.reviewerName}
                <span
                  class="text-white/70 text-xs tracking-widest uppercase mb-1"
                  >by {photo.reviewerName}</span
                >
              {/if}
              {#if photo.dogs.length > 0}
                <span class="text-white/60 text-xs">
                  {#each photo.dogs as dog, i}
                    {dog.name}{dog.breed ? ` · ${dog.breed}` : ""}{i <
                    photo.dogs.length - 1
                      ? ", "
                      : ""}
                  {/each}
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Show more -->
      <div class="mt-16 flex flex-col items-center gap-4">
        {#if hasMore}
          <button
            onclick={loadMore}
            disabled={photosQuery.isFetching}
            class="bg-primary text-white font-bold text-sm tracking-widest uppercase px-10 py-4 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {photosQuery.isFetching ? "Loading..." : "Show more photos"}
          </button>
        {/if}
        <p class="text-sm">
          Showing 1–{showing} of {total} photos
        </p>
      </div>
    {:else if photosQuery.isSuccess}
      <div class="flex flex-col items-center justify-center py-32 gap-6">
        <Camera class="size-16 text-outline" />
        <p class="text-lg">No photos yet for this location.</p>
      </div>
    {/if}
  </div>
</main>

<Footer />

<style>
  .masonry-grid {
    columns: 3;
    column-gap: 1.5rem;
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1024px) {
    .masonry-grid {
      columns: 2;
    }
  }

  @media (max-width: 640px) {
    .masonry-grid {
      columns: 1;
    }
  }
</style>
