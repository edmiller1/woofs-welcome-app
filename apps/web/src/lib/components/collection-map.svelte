<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import type { CollectionPlace } from "@woofs/types";

  interface Props {
    places: CollectionPlace[];
    hoveredPlaceId: string | null;
  }

  const { places, hoveredPlaceId }: Props = $props();

  const mapboxAccessToken = PUBLIC_MAPBOX_API_KEY;

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<mapboxgl.Map>();
  let markers = new Map<string, mapboxgl.Marker>();

  $effect(() => {
    if (!hoveredPlaceId || !map) return;
    const hoveredPlace = places.find((p) => p.id === hoveredPlaceId);
    if (hoveredPlace && map) {
      map.flyTo({
        center: [hoveredPlace.lng!, hoveredPlace.lat!],
        zoom: 15,
      });
    }

    // Reset all markers
    markers.forEach((marker, id) => {
      const el = marker.getElement();
      el.style.zIndex = "0";
      el.querySelector("div")!.style.backgroundColor = "white";
      el.querySelector("div")!.style.color = "black";
    });

    // Highlight hovered marker
    const hoveredMarker = markers.get(hoveredPlaceId);
    if (hoveredMarker) {
      const el = hoveredMarker.getElement();
      el.style.zIndex = "1";
      el.querySelector("div")!.style.backgroundColor = "#3d8463";
      el.querySelector("div")!.style.color = "white";
    }
  });

  onMount(() => {
    if (!mapContainer) return;

    mapboxgl.accessToken = mapboxAccessToken;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      interactive: true,
    });

    map.on("load", () => {
      const validPlaces = places.filter(
        (p) => p.lat !== null && p.lng !== null,
      );

      if (validPlaces.length === 0) return;

      if (validPlaces.length === 1) {
        map!.flyTo({
          center: [validPlaces[0].lng!, validPlaces[0].lat!],
          zoom: 9,
          speed: 2,
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        validPlaces.forEach((p) => bounds.extend([p.lng!, p.lat!]));
        map!.fitBounds(bounds, { padding: 60 });
      }

      places.forEach((place) => {
        if (!place.lat || !place.lng) return;

        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
    <div class="bg-white rounded-full px-2 py-1 shadow-md text-xs font-semibold border border-gray-200">
      ★ ${place.rating ? Number(place.rating).toFixed(1) : "N/A"}
    </div>
  `;

        markers.set(
          place.id,
          new mapboxgl.Marker(markerElement)
            .setLngLat([place.lng!, place.lat!])
            .addTo(map!),
        );
      });
    });
  });
</script>

<div bind:this={mapContainer} class="h-full xl:rounded-lg"></div>
