<script lang="ts">
  import type { NearbyPlace, PlaceWithDetails } from "@woofs/types";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import "maplibre-gl/dist/maplibre-gl.css";
  import MapPopup from "$lib/components/map-popup.svelte";
  import { debounce } from "$lib/helpers";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { MapPin } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";
  import moodyDogData from "$lib/lottie/moody-dog.json";
  import { MapLibre, Marker, Popup, NavigationControl } from "svelte-maplibre-gl";
  import type maplibregl from "maplibre-gl";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lat: number;
    lng: number;
    zoom?: number;
    interactive?: boolean;
    place: PlaceWithDetails;
  }

  let {
    open,
    lat,
    lng,
    zoom = 13,
    interactive = true,
    place,
    onOpenChange,
  }: Props = $props();

  let map: maplibregl.Map | undefined = $state(undefined);
  let mainPopupOpen = $state(false);
  let mapCenter = $state<{ lat: number; lng: number }>({ lat, lng });

  const nearbyPlaces = createQuery(() => ({
    queryKey: ["nearbyPlaces", mapCenter.lng, mapCenter.lat],
    queryFn: () =>
      api.place.getNearbyPlaces({
        placeId: place.id,
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radius: 5,
        limit: 10,
      }),
    enabled: open,
  }));

  const handleMoveEnd = debounce(() => {
    if (map) {
      const center = map.getCenter();
      mapCenter = { lat: center.lat, lng: center.lng };
    }
  }, 800);

  $effect(() => {
    if (open) {
      // Show main popup shortly after dialog opens
      const t = setTimeout(() => (mainPopupOpen = true), 600);
      return () => clearTimeout(t);
    } else {
      mainPopupOpen = false;
      mapCenter = { lat, lng };
    }
  });

  const mainPlace = $derived({
    ...place,
    locationPath: place.location.path,
    cityName: place.location.name,
    regionName: place.region.name,
    rating: String(place.rating),
  });

  function toPopupPlace(p: NearbyPlace) {
    return {
      ...p,
      locationPath: p.location.path,
      cityName: p.location.name,
      regionName: p.location.name,
      rating: String(p.rating),
    };
  }
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="z-99 h-[95vh]! w-[95vw]! max-w-[95vw]! p-0">
    <div class="flex h-full flex-col p-4">
      <Dialog.Header class="shrink-0 pb-3">
        <Dialog.Title class="flex items-center gap-2">
          <MapPin class="size-5" />
          {place.name}
        </Dialog.Title>
      </Dialog.Header>
      <ErrorBoundary error={nearbyPlaces.error}>
        <div class="relative flex-1 flex flex-col">
          {#if nearbyPlaces.isFetching}
            <div
              class="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white rounded-full px-4 py-1 shadow-md text-xs font-semibold text-gray-700"
            >
              <div class="lottie-container size-14 overflow-hidden shrink-0">
                <DotLottieSvelte
                  data={JSON.stringify(moodyDogData)}
                  loop
                  autoplay
                />
              </div>
              <!-- Finding nearby places… -->
            </div>
          {/if}

          {#if open}
            <MapLibre
              bind:map
              style={`https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`}
              class="w-full h-full rounded-lg"
              center={[lng, lat]}
              {zoom}
              {interactive}
              onmoveend={handleMoveEnd}
            >
              <NavigationControl position="top-right" />

              <!-- Current place marker (highlighted) -->
              <Marker lnglat={[lng, lat]}>
                {#snippet content()}
                  <div
                    class="cursor-pointer transition-transform hover:scale-110"
                    style="background:#3d8463;color:white;border-radius:9999px;padding:2px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);font-size:0.75rem;font-weight:600;border:1px solid #3d8463;white-space:nowrap;"
                  >
                    ★ {Number(place.rating).toFixed(1)}
                  </div>
                {/snippet}
                <Popup
                  bind:open={mainPopupOpen}
                  offset={[0, -20]}
                  closeOnClick={true}
                  closeButton={false}
                >
                  <MapPopup
                    activePlace={mainPlace}
                    closePopup={() => (mainPopupOpen = false)}
                  />
                </Popup>
              </Marker>

              <!-- Nearby place markers (green) -->
              {#if nearbyPlaces.isSuccess}
                {#each nearbyPlaces.data.places as nearbyPlace (nearbyPlace.id)}
                  <Marker
                    lnglat={[
                      parseFloat(nearbyPlace.longitude),
                      parseFloat(nearbyPlace.latitude),
                    ]}
                  >
                    {#snippet content()}
                      <div
                        class="cursor-pointer transition-transform hover:scale-110"
                        style="background:white;color:black;border-radius:9999px;padding:2px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:0.75rem;font-weight:600;border:1px solid #e5e7eb;white-space:nowrap;"
                      >
                        ★ {Number(nearbyPlace.rating).toFixed(1)}
                      </div>
                    {/snippet}
                    <Popup
                      offset={[0, -20]}
                      closeOnClick={true}
                      closeButton={false}
                    >
                      <MapPopup
                        activePlace={toPopupPlace(nearbyPlace)}
                        closePopup={() => {}}
                      />
                    </Popup>
                  </Marker>
                {/each}
              {/if}
            </MapLibre>
          {/if}
        </div>
      </ErrorBoundary>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .lottie-container :global(canvas) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  :global(.maplibregl-popup-content) {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  :global(.maplibregl-popup-tip) {
    display: none !important;
  }
</style>
