<script lang="ts">
  import { onMount, onDestroy, mount, unmount } from "svelte";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { LocationPlace } from "@woofs/types";
  import MapPlaceCard from "./map-place-card.svelte";
  import { api } from "$lib/api-helper";

  interface Props {
    lat: number;
    lng: number;
    zoom?: number;
    places: LocationPlace[];
    pathname: string;
    class?: string;
  }

  const { lat, lng, places, pathname, class: className = "", zoom }: Props = $props();

  const MIN_ZOOM_FOR_FETCH = 8;

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<maplibregl.Map>();
  let isLoading = $state(false);
  let activePopup: maplibregl.Popup | null = null;
  let activeMounted: Record<string, unknown> | null = null;
  const markers = new Map<string, maplibregl.Marker>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function createMarkerEl(place: LocationPlace) {
    const el = document.createElement("div");
    el.style.cssText =
      "background:white;color:#1a1a1a;border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.18);border:1.5px solid #e5e7eb;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;font-family:sans-serif;transition:box-shadow 0.15s ease;";
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${place.rating ? Number(place.rating).toFixed(1) : "—"}`;

    el.addEventListener("mouseenter", () => {
      el.style.zIndex = "10";
      el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)";
    });
    el.addEventListener("mouseleave", () => {
      el.style.zIndex = "";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activePopup) {
        activePopup.remove();
        if (activeMounted) {
          unmount(activeMounted);
          activeMounted = null;
        }
        activePopup = null;
      }

      const container = document.createElement("div");
      activeMounted = mount(MapPlaceCard, {
        target: container,
        props: {
          place,
          onclose: () => {
            activePopup?.remove();
            activePopup = null;
          },
        },
      });

      activePopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        maxWidth: "none",
        className: "maplibre-svelte-popup",
      })
        .setLngLat([Number(place.lng), Number(place.lat)])
        .setDOMContent(container)
        .addTo(map!);

      activePopup.on("close", () => {
        if (activeMounted) {
          unmount(activeMounted);
          activeMounted = null;
        }
        activePopup = null;
      });
    });

    return el;
  }

  function syncMarkers(newPlaces: LocationPlace[]) {
    const newIds = new Set(newPlaces.map((p) => p.id));

    // Remove markers no longer in the set
    for (const [id, marker] of markers) {
      if (!newIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    // Add markers for new places
    for (const place of newPlaces) {
      if (place.lat === null || place.lng === null) continue;
      if (markers.has(place.id)) continue;

      const marker = new maplibregl.Marker({ element: createMarkerEl(place) })
        .setLngLat([Number(place.lng), Number(place.lat)])
        .addTo(map!);
      markers.set(place.id, marker);
    }
  }

  async function fetchPlacesForBounds() {
    if (!map) return;
    const currentZoom = map.getZoom();
    if (currentZoom < MIN_ZOOM_FOR_FETCH) return;

    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    isLoading = true;
    try {
      const result = await api.location.getExplorePlaces(pathname, {
        bbox: {
          swLat: sw.lat,
          swLng: sw.lng,
          neLat: ne.lat,
          neLng: ne.lng,
        },
        page: 1,
      });
      syncMarkers(result.places);
    } catch {
      // silently ignore — seeded places remain visible
    } finally {
      isLoading = false;
    }
  }

  function scheduleFetch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchPlacesForBounds, 400);
  }

  onMount(() => {
    if (!mapContainer) return;

    map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      interactive: true,
      attributionControl: { compact: true, customAttribution: "" },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map!.flyTo({ center: [lng, lat], zoom: zoom ?? 10 });

      // Seed with pre-loaded places
      syncMarkers(places.filter((p) => p.lat !== null && p.lng !== null));

      map!.on("click", () => activePopup?.remove());
      map!.on("moveend", scheduleFetch);
    });
  });

  onDestroy(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    activePopup?.remove();
    if (activeMounted) unmount(activeMounted);
    markers.forEach((m) => m.remove());
    map?.remove();
  });
</script>

<div class="relative w-full h-full {className}">
  <div bind:this={mapContainer} class="w-full h-full"></div>
  {#if isLoading}
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-md text-xs font-bold text-on-surface-variant tracking-wide pointer-events-none">
      <span class="flex gap-1">
        <span class="dot-pulse"></span>
        <span class="dot-pulse" style="animation-delay: 0.15s"></span>
        <span class="dot-pulse" style="animation-delay: 0.3s"></span>
      </span>
      Loading places
    </div>
  {/if}
</div>

<style>
  .dot-pulse {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 9999px;
    background: currentColor;
    animation: pulse-opacity 0.9s ease-in-out infinite;
  }

  @keyframes pulse-opacity {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
</style>
