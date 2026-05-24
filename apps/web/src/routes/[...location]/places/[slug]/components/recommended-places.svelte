<script lang="ts">
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser } from "@woofs/types";

  interface Props {
    placeId: string;
    user: BAUser | null;
  }

  const { placeId, user }: Props = $props();

  const similarPlaces = createQuery(() => ({
    queryKey: ["similarPlaces", placeId],
    queryFn: () => api.place.getSimilarPlaces(placeId, 6),
  }));
</script>

<Separator />

<ErrorBoundary error={similarPlaces.error}>
  {#if similarPlaces.isLoading || similarPlaces.isFetching}
    <!-- Mobile -->
    <section class="mt-12 md:hidden">
      <Skeleton class="h-8 w-40 mb-6" />
      <div class="flex gap-4 overflow-x-hidden -mx-6 px-6">
        {#each Array(4) as _}
          <div class="shrink-0 w-65 space-y-2">
            <Skeleton class="aspect-[1.21] w-full rounded-lg" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
            <Skeleton class="h-5 w-16 rounded-full" />
          </div>
        {/each}
      </div>
    </section>
    <!-- Desktop -->
    <section class="my-16 hidden md:block">
      <Skeleton class="h-9 w-48 mb-8" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {#each Array(6) as _}
          <div class="space-y-2">
            <Skeleton class="aspect-[1.21] w-full rounded-lg" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
            <Skeleton class="h-5 w-16 rounded-full" />
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if similarPlaces.isSuccess && similarPlaces.data.length > 0}
    <section class="mt-12 md:hidden">
      <h2 class="font-headline font-bold text-2xl mb-6">Similar Places</h2>
      <div class="flex overflow-x-auto gap-4 pb-6 -mx-6 px-6 no-scrollbar">
        {#each similarPlaces.data as place}
          <PlaceCard
            id={place.id}
            name={place.name}
            rating={place.rating.toString()}
            slug={place.slug}
            cityName={place.location.name}
            regionName={place.parentLocationName!}
            countryCode={place.location.countryCode}
            types={place.types}
            isSaved={place.isSaved}
            imageIds={place.images.map((i) => i.imageId)}
            {user}
            locationPath={place.location.path}
            isVerified={place.isVerified}
            memberFavourite={place.memberFavourite}
            reviewCount={place.reviewsCount}
            dogAmenities={place.dogAmenities}
          />
        {/each}
      </div>
    </section>
  {/if}

  <!-- ===================== END MOBILE LAYOUT ===================== -->

  {#if similarPlaces.isSuccess && similarPlaces.data.length > 0}
    <section class="my-16 hidden md:block">
      <h3
        class="text-3xl text-primary md:text-foreground font-headline font-bold mb-8"
      >
        Similar Places
      </h3>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
      >
        {#each similarPlaces.data as place}
          <PlaceCard
            id={place.id}
            name={place.name}
            rating={place.rating.toString()}
            slug={place.slug}
            cityName={place.location.name}
            regionName={place.parentLocationName!}
            countryCode={place.location.countryCode}
            types={place.types}
            isSaved={place.isSaved}
            imageIds={place.images.map((i) => i.imageId)}
            {user}
            locationPath={place.location.path}
            isVerified={place.isVerified}
            memberFavourite={place.memberFavourite}
            reviewCount={place.reviewsCount}
            dogAmenities={place.dogAmenities}
          />
        {/each}
      </div>
    </section>
  {/if}
</ErrorBoundary>
