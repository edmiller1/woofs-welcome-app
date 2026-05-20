<script lang="ts">
  import type { PlaceWithDetails } from "@woofs/types";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import ExplorePlacePopover from "$lib/components/explore-place-popover.svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { MapPin } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { mount, unmount, onDestroy } from "svelte";
  import type { ExplorePlaceItem } from "@woofs/types";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lat: number;
    lng: number;
    zoom?: number;
    place: PlaceWithDetails;
  }

  let { open, lat, lng, zoom = 13, place, onOpenChange }: Props = $props();

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<maplibregl.Map | undefined>(undefined);
  let bbox = $state<{ swLat: number; swLng: number; neLat: number; neLng: number } | null>(null);

  const markers = new Map<string, maplibregl.Marker>();
  let mainMarker: maplibregl.Marker | undefined;
  let activePopup: maplibregl.Popup | null = null;
  let activeMounted: ReturnType<typeof mount> | null = null;
  let activeMarkerId: string | null = null;

  const placesQuery = createQuery(() => ({
    queryKey: ["placeMapDialog", bbox],
    queryFn: () => api.place.explorePlaces({
      swLat: bbox!.swLat,
      swLng: bbox!.swLng,
      neLat: bbox!.neLat,
      neLng: bbox!.neLng,
    }),
    enabled: open && !!bbox,
  }));

  const mainPlace = $derived<ExplorePlaceItem>({
    id: place.id,
    name: place.name,
    slug: place.slug,
    types: place.types,
    rating: place.rating,
    reviewsCount: place.reviewsCount,
    lat,
    lng,
    imageId: place.images?.[0]?.imageId ?? "",
    locationPath: place.location.path,
    cityName: place.location.name,
    regionName: place.region?.name ?? place.location.name,
    countryCode: place.countryCode,
    dogAmenities: place.dogAmenities,
    isSaved: place.isSaved,
    isVerified: place.isVerified,
    memberFavourite: place.memberFavourite,
  });

  function updateBbox() {
    if (!map) return;
    const bounds = map.getBounds();
    bbox = {
      swLat: Math.max(-90, bounds.getSouthWest().lat),
      swLng: Math.max(-180, bounds.getSouthWest().lng),
      neLat: Math.min(90, bounds.getNorthEast().lat),
      neLng: Math.min(180, bounds.getNorthEast().lng),
    };
  }

  function makeMarkerEl(rating: string | number | null, highlighted: boolean) {
    const el = document.createElement("div");
    el.style.cssText = [
      `background:${highlighted ? "var(--primary)" : "white"}`,
      `color:${highlighted ? "white" : "#1a1a1a"}`,
      "border-radius:8px",
      "padding:5px 10px",
      "font-size:12px",
      "font-weight:700",
      "box-shadow:0 2px 8px rgba(0,0,0,0.18)",
      `border:1.5px solid ${highlighted ? "var(--primary)" : "#e5e7eb"}`,
      "cursor:pointer",
      "white-space:nowrap",
      "display:flex",
      "align-items:center",
      "gap:4px",
      "font-family:sans-serif",
      "transition:box-shadow 0.15s ease",
    ].join(";");
    const starColor = highlighted ? "white" : "#eab308";
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${starColor}" stroke="${starColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${rating ? Number(rating).toFixed(1) : "N/A"}`;
    return el;
  }

  function highlightMarker(id: string) {
    const el = markers.get(id)?.getElement();
    if (!el) return;
    el.style.background = "var(--primary)";
    el.style.color = "white";
    el.style.borderColor = "var(--primary)";
    el.style.zIndex = "10";
    const svg = el.querySelector("svg");
    if (svg) { svg.style.fill = "white"; svg.style.stroke = "white"; }
  }

  function unhighlightMarker(id: string) {
    const el = markers.get(id)?.getElement();
    if (!el) return;
    el.style.background = "white";
    el.style.color = "#1a1a1a";
    el.style.borderColor = "#e5e7eb";
    el.style.zIndex = "";
    const svg = el.querySelector("svg");
    if (svg) { svg.style.fill = "#eab308"; svg.style.stroke = "#eab308"; }
  }

  function openPopup(lnglat: [number, number], popupPlace: ExplorePlaceItem) {
    if (!map) return;
    if (activePopup) {
      activePopup.remove();
      if (activeMounted) { unmount(activeMounted); activeMounted = null; }
      activePopup = null;
    }
    const container = document.createElement("div");
    activeMounted = mount(ExplorePlacePopover, {
      target: container,
      props: {
        place: popupPlace,
        onclose: () => { activePopup?.remove(); activePopup = null; },
      },
    });
    activePopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      maxWidth: "none",
      className: "woofs-map-popup",
    })
      .setLngLat(lnglat)
      .setDOMContent(container)
      .addTo(map);
    activePopup.on("close", () => {
      if (activeMounted) { unmount(activeMounted); activeMounted = null; }
      if (activeMarkerId) { unhighlightMarker(activeMarkerId); activeMarkerId = null; }
      activePopup = null;
    });
  }

  function addPlacesLayer(mapInstance: maplibregl.Map) {
    mapInstance.addSource("dialog-places", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    mapInstance.addLayer({
      id: "dialog-clusters",
      type: "circle",
      source: "dialog-places",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#1a1a1a",
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 30],
      },
    });
    mapInstance.addLayer({
      id: "dialog-cluster-count",
      type: "symbol",
      source: "dialog-places",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: { "text-color": "#ffffff" },
    });
    mapInstance.on("click", "dialog-clusters", async (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ["dialog-clusters"] });
      const clusterId = features[0].properties?.cluster_id;
      const zoom = await (mapInstance.getSource("dialog-places") as maplibregl.GeoJSONSource)
        .getClusterExpansionZoom(clusterId);
      mapInstance.easeTo({
        center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
        zoom,
      });
    });
    mapInstance.on("mouseenter", "dialog-clusters", () => { mapInstance.getCanvas().style.cursor = "pointer"; });
    mapInstance.on("mouseleave", "dialog-clusters", () => { mapInstance.getCanvas().style.cursor = ""; });
  }

  function addMainMarker(mapInstance: maplibregl.Map) {
    mainMarker?.remove();
    mainMarker = undefined;
    const el = makeMarkerEl(place.rating, true);
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopup([lng, lat], mainPlace);
    });
    mainMarker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(mapInstance);
  }

  function syncMarkers(mapInstance: maplibregl.Map, places: ExplorePlaceItem[]) {
    const incoming = new Set(places.map((p) => p.id));

    // Remove stale markers (skip main place)
    for (const [id, marker] of markers) {
      if (!incoming.has(id)) { marker.remove(); markers.delete(id); }
    }

    // Add new markers
    for (const p of places) {
      if (p.id === place.id || placeMarkers.has(p.id) || !p.lat || !p.lng) continue;
      const lnglat: [number, number] = [p.lng, p.lat];
      const el = makeMarkerEl(p.rating, false);

      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.28)";
        el.style.zIndex = "10";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
        el.style.zIndex = "";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeMarkerId && activeMarkerId !== p.id) unhighlightMarker(activeMarkerId);
        activeMarkerId = p.id;
        highlightMarker(p.id);
        openPopup(lnglat, p);
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat(lnglat).addTo(mapInstance);
      markers.set(p.id, marker);
    }

    // Update GeoJSON source for clustering
    const source = mapInstance.getSource("dialog-places") as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: places
        .filter((p) => p.id !== place.id && p.lat != null && p.lng != null)
        .map((p) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
          properties: { id: p.id },
        })),
    });
  }

  // Hide DOM markers that are inside a cluster
  $effect(() => {
    if (!map) return;
    const onRender = () => {
      if (!map!.isSourceLoaded("dialog-places")) return;
      for (const [, marker] of markers) {
        const point = map!.project(marker.getLngLat());
        const clustered = map!.queryRenderedFeatures(point, { layers: ["dialog-clusters"] }).length > 0;
        marker.getElement().style.display = clustered ? "none" : "flex";
      }
    };
    map.on("render", onRender);
    return () => { map!.off("render", onRender); };
  });

  // Add main marker once map is ready
  $effect(() => {
    if (!map) return;
    addMainMarker(map);
  });

  // Sync markers + clusters when query data changes
  $effect(() => {
    const places = placesQuery.data?.places;
    if (!places || !map) return;
    syncMarkers(map, places);
  });

  // Init/destroy map when dialog opens/closes
  $effect(() => {
    if (open && mapContainer && !map) {
      const m = new maplibregl.Map({
        container: mapContainer,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
        center: [lng, lat],
        zoom,
        fadeDuration: 0,
      });
      m.addControl(new maplibregl.NavigationControl(), "top-right");
      m.on("moveend", updateBbox);
      m.on("click", () => { activePopup?.remove(); activePopup = null; });
      m.once("load", () => {
        addPlacesLayer(m);
        map = m;
        updateBbox();
      });
    }

    if (!open && map) {
      cleanup();
    }
  });

  // Dummy reference to satisfy the linter — markers is the same map used in syncMarkers
  const placeMarkers = markers;

  function cleanup() {
    activePopup?.remove();
    activePopup = null;
    if (activeMounted) { unmount(activeMounted); activeMounted = null; }
    mainMarker?.remove();
    mainMarker = undefined;
    markers.forEach((m) => m.remove());
    markers.clear();
    map?.remove();
    map = undefined;
    bbox = null;
  }

  onDestroy(cleanup);
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Content class="bg-white z-99 h-[95vh]! w-[95vw]! max-w-[95vw]! p-0">
    <div class="flex h-full flex-col p-4">
      <Dialog.Header class="shrink-0 pb-3">
        <Dialog.Title class="flex items-center gap-2">
          <MapPin class="size-5" />
          {place.name}
        </Dialog.Title>
      </Dialog.Header>

      <ErrorBoundary error={placesQuery.error}>
        <div class="relative flex-1 min-h-0">
          {#if placesQuery.isFetching}
            <div
              class="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-md"
            >
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          {/if}

          <div bind:this={mapContainer} class="w-full h-full rounded-lg"></div>
        </div>
      </ErrorBoundary>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 9999px;
    background: #184a14;
    animation: pulse 1.2s ease-in-out infinite;
  }
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }
    40% {
      opacity: 1;
    }
  }

  :global(.woofs-map-popup .maplibregl-popup-content) {
    padding: 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    margin: 1rem 0;
  }

  :global(.woofs-map-popup .maplibregl-popup-tip) {
    display: none;
  }
</style>
