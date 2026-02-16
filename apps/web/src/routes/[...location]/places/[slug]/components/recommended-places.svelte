<script lang="ts">
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import { Spinner } from "$lib/components/ui/spinner";
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
  {#if similarPlaces.isLoading}
    <div class="flex min-h-64 items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if similarPlaces.isSuccess && similarPlaces.data.length > 0}
    <div class="space-y-6 my-6">
      <h3 class="text-2xl font-semibold">Other places you might like</h3>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4"
      >
        {#each similarPlaces.data as place}
          <PlaceCard
            id={place.id}
            name={place.name}
            rating={place.rating.toString()}
            slug={place.slug}
            cityName={place.location.name}
            regionName={place.parentLocationName!}
            types={place.types}
            isSaved={place.isSaved}
            imageIds={place.images.map((i) => i.imageId)}
            {user}
            locationPath={place.location.path}
            isVerified={place.isVerified}
          />
        {/each}
      </div>
    </div>
  {/if}
</ErrorBoundary>
