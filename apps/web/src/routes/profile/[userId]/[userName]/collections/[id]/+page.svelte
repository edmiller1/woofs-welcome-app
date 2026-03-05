<script lang="ts">
  import { api } from "$lib/api-helper";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, CollectionWithPlaces } from "@woofs/types";
  import {
    collectionPlaces,
    hoveredPlaceId,
  } from "$lib/stores/collectionStore";

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
</script>

<div>
  {#if collectionWithPlaces.isLoading}
    <div class="flex items-center justify-center h-140">
      <Spinner />
    </div>
  {:else if collectionWithPlaces.data.places.length === 0}
    <p class="text-center text-gray-500">No places in this collection.</p>
  {:else}
    <div>
      <div class="flex items-center gap-2">
        <h2 class="font-semibold text-lg">
          {collectionWithPlaces.data.collection.name}
        </h2>
        <span class="text-sm text-muted-foreground"
          >({collectionWithPlaces.data.collection.itemCount} places)</span
        >
      </div>
      <p class="text-sm text-muted-foreground">
        {collectionWithPlaces.data.collection.description}
      </p>
      <div
        class="py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 items-start"
      >
        {#each collectionWithPlaces.data.places as place}
          <div
            class="w-full"
            onmouseenter={() => hoveredPlaceId.set(place.id)}
            onmouseleave={() => hoveredPlaceId.set(null)}
            aria-label="View place details"
            role="button"
            tabindex="0"
          >
            <PlaceCard
              id={place.id}
              name={place.name}
              rating={place.rating!}
              slug={place.slug}
              cityName={place.cityName}
              regionName={place.regionName}
              countryCode={place.countryCode}
              types={place.types}
              isSaved={place.isSaved}
              imageId={place.imageId}
              {user}
              locationPath={place.locationPath}
              isVerified={place.isVerified}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
