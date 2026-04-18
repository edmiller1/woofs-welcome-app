<script lang="ts">
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import {
    MapLibre,
    Marker,
    Popup,
    NavigationControl,
  } from "svelte-maplibre-gl";
  import type { CollectionPlace } from "@woofs/types";
  import MapPopup from "./map-popup.svelte";
  import { selectedPlaceId as selectedPlaceIdStore } from "$lib/stores/collectionStore";

  interface Props {
    places: CollectionPlace[];
    selectedPlaceId: string | null;
    collectionId?: string;
  }

  const { places, selectedPlaceId: selectedId, collectionId }: Props = $props();

  let map = $state<maplibregl.Map | undefined>();

  const validPlaces = $derived(
    places.filter((p) => p.lat !== null && p.lng !== null),
  );

  const selectedPlace = $derived(
    selectedId ? (places.find((p) => p.id === selectedId) ?? null) : null,
  );

  $effect(() => {
    if (!map) return;
    if (validPlaces.length === 0) return;

    if (validPlaces.length === 1) {
      map.flyTo({
        center: [validPlaces[0].lng!, validPlaces[0].lat!],
        zoom: 9,
        speed: 2,
      });
    } else {
      const bounds = new maplibregl.LngLatBounds();
      validPlaces.forEach((p) => bounds.extend([p.lng!, p.lat!]));
      map.fitBounds(bounds, { padding: 60 });
    }
  });

  $effect(() => {
    if (!map || !selectedPlace?.lat || !selectedPlace?.lng) return;
    map.panTo([selectedPlace.lng, selectedPlace.lat]);
  });
</script>

<MapLibre
  style={`https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`}
  class="h-full xl:rounded-lg"
  bind:map
  onclick={() => selectedPlaceIdStore.set(null)}
>
  <NavigationControl position="bottom-right" showCompass={false} />

  {#each validPlaces as place (place.id)}
    {@const isSelected = selectedId === place.id}
    <Marker lnglat={[place.lng!, place.lat!]}>
      {#snippet content()}
        <div
          role="button"
          tabindex="0"
          onclick={(e) => {
            e.stopPropagation();
            selectedPlaceIdStore.set(place.id);
          }}
          onkeydown={(e) =>
            e.key === "Enter" && selectedPlaceIdStore.set(place.id)}
          style="cursor:pointer;background:{isSelected
            ? '#3d8463'
            : 'white'};color:{isSelected
            ? 'white'
            : 'black'};border-radius:9999px;padding:2px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:0.75rem;font-weight:600;border:1px solid #e5e7eb;z-index:{isSelected
            ? 1
            : 0};position:relative;"
        >
          ★ {place.rating ? Number(place.rating).toFixed(1) : "N/A"}
        </div>
      {/snippet}

      {#if isSelected}
        <Popup
          closeButton={false}
          closeOnClick={false}
          offset={12}
          maxWidth="none"
          open={true}
        >
          <MapPopup
            activePlace={{
              id: place.id,
              imageId: place.imageId,
              locationPath: place.locationPath,
              slug: place.slug,
              isSaved: place.isSaved,
              name: place.name,
              rating: place.rating ?? "0",
              cityName: place.cityName,
              regionName: place.regionName,
              countryCode: place.countryCode,
              types: place.types,
            }}
            {collectionId}
            closePopup={() => selectedPlaceIdStore.set(null)}
          />
        </Popup>
      {/if}
    </Marker>
  {/each}
</MapLibre>

<style>
  .map-container {
    height: 350px;
    width: 100%;
    border-radius: 0.75rem;
    z-index: 0;
    isolation: isolate;
  }

  :global(.custom-marker) {
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  :global(.custom-marker:hover) {
    transform: scale(1.1);
  }

  :global(.custom-popup .maplibregl-popup-content) {
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.custom-popup .maplibregl-popup-tip) {
    border-top-color: white;
  }
</style>
