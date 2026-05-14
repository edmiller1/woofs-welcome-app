<script lang="ts">
  import { onMount, onDestroy, mount, unmount } from "svelte";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { LocationPlace } from "@woofs/types";
  import MapPlaceCard from "./map-place-card.svelte";

  interface Props {
    places: LocationPlace[];
    class?: string;
  }

  const { places, class: className = "" }: Props = $props();

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<maplibregl.Map>();
  let activePopup: maplibregl.Popup | null = null;
  let activeMounted: Record<string, unknown> | null = null;
  const markers = new Map<string, maplibregl.Marker>();

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
      const validPlaces = places.filter((p) => p.lat !== null && p.lng !== null);
      if (validPlaces.length === 0) return;

      if (validPlaces.length === 1) {
        map!.flyTo({ center: [Number(validPlaces[0].lng), Number(validPlaces[0].lat)], zoom: 12 });
      } else {
        const bounds = new maplibregl.LngLatBounds();
        validPlaces.forEach((p) => bounds.extend([Number(p.lng), Number(p.lat)]));
        map!.fitBounds(bounds, { padding: 60 });
      }

      validPlaces.forEach((place) => {
        const el = document.createElement("div");
        el.style.cssText = "background:white;color:#1a1a1a;border-radius:9999px;padding:4px 10px;font-size:12px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.18);border:1.5px solid #e5e7eb;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;font-family:sans-serif;transition:box-shadow 0.15s ease;";
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
            if (activeMounted) { unmount(activeMounted); activeMounted = null; }
            activePopup = null;
          }

          const container = document.createElement("div");
          activeMounted = mount(MapPlaceCard, {
            target: container,
            props: {
              place,
              onclose: () => { activePopup?.remove(); activePopup = null; },
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
            if (activeMounted) { unmount(activeMounted); activeMounted = null; }
            activePopup = null;
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([Number(place.lng), Number(place.lat)])
          .addTo(map!);

        markers.set(place.id, marker);
      });

      map!.on("click", () => { activePopup?.remove(); });
    });
  });

  onDestroy(() => {
    activePopup?.remove();
    if (activeMounted) unmount(activeMounted);
    markers.forEach((m) => m.remove());
    map?.remove();
  });
</script>

<div class="relative w-full h-full {className}">
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>