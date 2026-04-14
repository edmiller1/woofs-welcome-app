<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";

  interface Props {
    lng: number;
    lat: number;
    zoom?: number;
    markerLabel?: string;
    className?: string;
    interactive?: boolean;
    onMapReady?: (map: maplibregl.Map) => void;
  }

  let {
    lng,
    lat,
    zoom = 12,
    markerLabel = "hello",
    className = "",
    interactive = true,
    onMapReady,
  }: Props = $props();

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<maplibregl.Map>();
  let marker = $state<maplibregl.Marker>();

  $effect(() => {
    if (marker && lng !== undefined && lat !== undefined) {
      marker.setLngLat([lng, lat]);
      if (map) {
        map.flyTo({ center: [lng, lat], duration: 1000 });
      }
    }
  });

  $effect(() => {
    if (map && zoom !== undefined) {
      map.setZoom(zoom);
    }
  });

  onMount(() => {
    if (!mapContainer) return;

    map = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
      interactive: interactive,
    });

    const markerElement = document.createElement("div");
    markerElement.className = "custom-marker";
    markerElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#154b11" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    `;

    marker = new maplibregl.Marker(markerElement)
      .setLngLat([lng, lat])
      .addTo(map);

    if (markerLabel) {
      const popup = new maplibregl.Popup({
        offset: [0, 0],
        className: "custom-popup",
      }).setHTML(`<div class="p-2 font-medium">${markerLabel}</div>`);
      marker.setPopup(popup);
    }

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      onMapReady?.(map!);
    });
  });

  onDestroy(() => {
    marker?.remove();
    map?.remove();
  });

  const flyTo = (options: { center: [number, number]; zoom?: number }) => {
    if (map) {
      map.flyTo({ duration: 1000, ...options });
    }
  };

  const setMarkerLocation = (newLng: number, newLat: number) => {
    if (marker) {
      marker.setLngLat([newLng, newLat]);
    }
  };

  const getMapInstance = () => map;

  export { flyTo, setMarkerLocation, getMapInstance };
</script>

<div bind:this={mapContainer} class="map-container {className}"></div>

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
