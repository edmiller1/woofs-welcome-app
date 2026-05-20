<script lang="ts">
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import "maplibre-gl/dist/maplibre-gl.css";
  import maplibregl from "maplibre-gl";
  import type { CollectionPlace } from "@woofs/types";
  import ExplorePlacePopover from "./explore-place-popover.svelte";
  import { mount, unmount, onDestroy } from "svelte";
  import type { ExplorePlaceItem } from "@woofs/types";

  interface Props {
    places: CollectionPlace[];
    collectionId?: string;
  }

  const { places, collectionId }: Props = $props();

  let mapContainer = $state<HTMLDivElement>();
  let map = $state<maplibregl.Map | undefined>(undefined);

  const placeMarkers = new Map<string, maplibregl.Marker>();
  let activePopup: maplibregl.Popup | null = null;
  let activeMounted: ReturnType<typeof mount> | null = null;
  let activeMarkerId: string | null = null;

  const validPlaces = $derived(places.filter((p) => p.lat !== null && p.lng !== null));

  function toPopupPlace(p: CollectionPlace): ExplorePlaceItem {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      types: p.types,
      rating: Number(p.rating ?? 0),
      reviewsCount: p.reviewsCount,
      lat: p.lat!,
      lng: p.lng!,
      imageId: p.imageId,
      locationPath: p.locationPath,
      cityName: p.cityName,
      regionName: p.regionName,
      countryCode: p.countryCode,
      dogAmenities: [],
      isSaved: p.isSaved,
      isVerified: p.isVerified,
      memberFavourite: false,
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
    const el = placeMarkers.get(id)?.getElement();
    if (!el) return;
    el.style.background = "var(--primary)";
    el.style.color = "white";
    el.style.borderColor = "var(--primary)";
    el.style.zIndex = "10";
    const svg = el.querySelector("svg");
    if (svg) { svg.style.fill = "white"; svg.style.stroke = "white"; }
  }

  function unhighlightMarker(id: string) {
    const el = placeMarkers.get(id)?.getElement();
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
    mapInstance.addSource("collection-places", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    mapInstance.addLayer({
      id: "collection-clusters",
      type: "circle",
      source: "collection-places",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#1a1a1a",
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 30],
      },
    });
    mapInstance.addLayer({
      id: "collection-cluster-count",
      type: "symbol",
      source: "collection-places",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: { "text-color": "#ffffff" },
    });
    mapInstance.on("click", "collection-clusters", async (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ["collection-clusters"] });
      const clusterId = features[0].properties?.cluster_id;
      const zoom = await (mapInstance.getSource("collection-places") as maplibregl.GeoJSONSource)
        .getClusterExpansionZoom(clusterId);
      mapInstance.easeTo({
        center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
        zoom,
      });
    });
    mapInstance.on("mouseenter", "collection-clusters", () => { mapInstance.getCanvas().style.cursor = "pointer"; });
    mapInstance.on("mouseleave", "collection-clusters", () => { mapInstance.getCanvas().style.cursor = ""; });
  }

  function syncMarkers(mapInstance: maplibregl.Map) {
    // Remove all existing markers
    placeMarkers.forEach((m) => m.remove());
    placeMarkers.clear();

    for (const p of validPlaces) {
      const lnglat: [number, number] = [p.lng!, p.lat!];
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
        openPopup(lnglat, toPopupPlace(p));
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat(lnglat).addTo(mapInstance);
      placeMarkers.set(p.id, marker);
    }

    // Update GeoJSON source for clustering
    const source = mapInstance.getSource("collection-places") as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: validPlaces.map((p) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [p.lng!, p.lat!] },
        properties: { id: p.id },
      })),
    });
  }

  // Fit map to places on load
  function fitToBounds(mapInstance: maplibregl.Map) {
    if (validPlaces.length === 0) return;
    if (validPlaces.length === 1) {
      mapInstance.flyTo({ center: [validPlaces[0].lng!, validPlaces[0].lat!], zoom: 13 });
    } else {
      const bounds = new maplibregl.LngLatBounds();
      validPlaces.forEach((p) => bounds.extend([p.lng!, p.lat!]));
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }

  // Hide DOM markers absorbed into a cluster
  $effect(() => {
    if (!map) return;
    const onRender = () => {
      if (!map!.isSourceLoaded("collection-places")) return;
      for (const [, marker] of placeMarkers) {
        const point = map!.project(marker.getLngLat());
        const clustered = map!.queryRenderedFeatures(point, { layers: ["collection-clusters"] }).length > 0;
        marker.getElement().style.display = clustered ? "none" : "flex";
      }
    };
    map.on("render", onRender);
    return () => { map!.off("render", onRender); };
  });

  // Sync markers when places or map changes
  $effect(() => {
    if (!map || validPlaces.length === 0) return;
    syncMarkers(map);
  });

  // Init map when container is bound
  $effect(() => {
    if (!mapContainer || map) return;
    const m = new maplibregl.Map({
      container: mapContainer,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`,
      center: [0, 0],
      zoom: 1,
      fadeDuration: 0,
    });
    m.addControl(new maplibregl.NavigationControl(), "bottom-right");
    m.on("click", () => { activePopup?.remove(); activePopup = null; });
    m.once("load", () => {
      addPlacesLayer(m);
      map = m;
      fitToBounds(m);
    });
  });

  onDestroy(() => {
    activePopup?.remove();
    if (activeMounted) { unmount(activeMounted); activeMounted = null; }
    placeMarkers.forEach((m) => m.remove());
    placeMarkers.clear();
    map?.remove();
  });
</script>

<div bind:this={mapContainer} class="h-full xl:rounded-lg w-full"></div>

<style>
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
