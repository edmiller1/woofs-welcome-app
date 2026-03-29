<script lang="ts">
  import { onMount, onDestroy, mount, unmount } from "svelte";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import type { LocationPlace } from "@woofs/types";
  import MapPlaceCard from "./map-place-card.svelte";

  interface Props {
    places: LocationPlace[];
    class?: string;
  }

  const { places, class: className = "" }: Props = $props();

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<mapboxgl.Map>();
  let activePopup: mapboxgl.Popup | null = null;
  let activeMounted: Record<string, unknown> | null = null;
  const markers = new Map<string, mapboxgl.Marker>();

  onMount(() => {
    if (!mapContainer) return;

    mapboxgl.accessToken = PUBLIC_MAPBOX_API_KEY;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      const validPlaces = places.filter((p) => p.lat !== null && p.lng !== null);
      if (validPlaces.length === 0) return;

      if (validPlaces.length === 1) {
        map!.flyTo({ center: [Number(validPlaces[0].lng), Number(validPlaces[0].lat)], zoom: 12 });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        validPlaces.forEach((p) => bounds.extend([Number(p.lng), Number(p.lat)]));
        map!.fitBounds(bounds, { padding: 60 });
      }

      validPlaces.forEach((place) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="background:white;color:black;border-radius:9999px;padding:2px 8px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e5e7eb;cursor:pointer;white-space:nowrap;">
            ★ ${place.rating ? Number(place.rating).toFixed(1) : "N/A"}
          </div>
        `;

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

          activePopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 12,
            maxWidth: "none",
            className: "mapbox-svelte-popup",
          })
            .setLngLat([Number(place.lng), Number(place.lat)])
            .setDOMContent(container)
            .addTo(map!);

          activePopup.on("close", () => {
            if (activeMounted) { unmount(activeMounted); activeMounted = null; }
            activePopup = null;
          });
        });

        const marker = new mapboxgl.Marker(el)
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