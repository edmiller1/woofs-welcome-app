<script lang="ts">
  import { onMount, mount, unmount } from "svelte";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import type { CollectionPlace } from "@woofs/types";
  import MapPopup from "./map-popup.svelte";
  import { selectedPlaceId as selectedPlaceIdStore } from "$lib/stores/collectionStore";

  interface Props {
    places: CollectionPlace[];
    selectedPlaceId: string | null;
    collectionId?: string;
  }

  const { places, selectedPlaceId: selectedId, collectionId }: Props = $props();

  const mapboxAccessToken = PUBLIC_MAPBOX_API_KEY;

  let mapContainer = $state<HTMLDivElement>();
  let map: mapboxgl.Map | undefined;
  let mapReady = $state(false);
  let markers = new Map<string, mapboxgl.Marker>();
  let activePopup: mapboxgl.Popup | null = null;
  let activeSveltePopup: Record<string, any> | null = null;

  function openPopup(place: CollectionPlace) {
    // Tear down previous popup
    if (activeSveltePopup) {
      unmount(activeSveltePopup);
      activeSveltePopup = null;
    }
    activePopup?.remove();
    activePopup = null;

    if (!place.lat || !place.lng || !map) return;

    const container = document.createElement("div");

    activeSveltePopup = mount(MapPopup, {
      target: container,
      props: {
        activePlace: {
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
        },
        collectionId,
        closePopup: () => selectedPlaceIdStore.set(null),
      },
    });

    activePopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      maxWidth: "none",
    })
      .setDOMContent(container)
      .setLngLat([place.lng, place.lat])
      .addTo(map);
  }

  $effect(() => {
    if (!mapReady) return;

    if (!selectedId) {
      if (activeSveltePopup) {
        unmount(activeSveltePopup);
        activeSveltePopup = null;
      }
      activePopup?.remove();
      activePopup = null;
      return;
    }

    const place = places.find((p) => p.id === selectedId);
    if (!place || !place.lat || !place.lng) return;

    // Reset all markers
    markers.forEach((marker) => {
      const el = marker.getElement();
      el.style.zIndex = "0";
      el.querySelector("div")!.style.backgroundColor = "white";
      el.querySelector("div")!.style.color = "black";
    });

    // Highlight selected marker
    const selectedMarker = markers.get(selectedId);
    if (selectedMarker) {
      const el = selectedMarker.getElement();
      el.style.zIndex = "1";
      el.querySelector("div")!.style.backgroundColor = "#3d8463";
      el.querySelector("div")!.style.color = "white";
    }

    map!.panTo([place.lng, place.lat]);
    openPopup(place);
  });

  onMount(() => {
    if (!mapContainer) return;

    mapboxgl.accessToken = mapboxAccessToken;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      interactive: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );

    map.on("click", () => {
      selectedPlaceIdStore.set(null);
    });

    map.on("load", () => {
      mapReady = true;

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
        markerElement.style.cursor = "pointer";
        markerElement.innerHTML = `
          <div style="background:white;border-radius:9999px;padding:2px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:0.75rem;font-weight:600;border:1px solid #e5e7eb;">
            ★ ${place.rating ? Number(place.rating).toFixed(1) : "N/A"}
          </div>
        `;

        markers.set(
          place.id,
          new mapboxgl.Marker(markerElement)
            .setLngLat([place.lng!, place.lat!])
            .addTo(map!),
        );

        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          selectedPlaceIdStore.set(place.id);
        });
      });
    });
  });
</script>

<div bind:this={mapContainer} class="h-full xl:rounded-lg"></div>
