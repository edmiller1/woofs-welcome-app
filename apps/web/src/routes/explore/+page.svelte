<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import { MapLibre, NavigationControl } from "svelte-maplibre-gl";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import {
    ChevronDown,
    ChevronUp,
    Coffee,
    CupSoda,
    Footprints,
    Hotel,
    Kayak,
    List,
    MapIcon,
    MapPin,
    Navigation,
    Road,
    ShoppingBag,
    Star,
    Stethoscope,
    TentTree,
    Trees,
    Utensils,
    WavesHorizontal,
    Wine,
  } from "@lucide/svelte";
  import type { BAUser } from "@woofs/types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Separator } from "$lib/components/ui/separator";
  import * as Select from "$lib/components/ui/select/index.js";
  import maplibregl from "maplibre-gl";
  import { userLocation } from "$lib/stores/geolocationStore";
  import { cn } from "$lib/utils";
  import { Slider } from "$lib/components/ui/slider/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { Spinner } from "$lib/components/ui/spinner";
  import PlaceCard from "$lib/components/place-card.svelte";
  import ExplorePlacePopover from "$lib/components/explore-place-popover.svelte";
  import { mount, unmount, onDestroy } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import type { ExplorePlaceItem } from "@woofs/types";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  interface Props {
    data: {
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { user } = $derived(data);

  // NZ bounds fallback
  const NZ_CENTER: [number, number] = [172.5, -41.5];
  const NZ_ZOOM = 5;

  let map = $state<maplibregl.Map | undefined>();
  let listCollapsed = $state<boolean>(
    typeof window !== "undefined" && window.innerWidth < 768,
  );
  const placeMarkers = new Map<string, maplibregl.Marker>();
  let activePopup: maplibregl.Popup | null = null;
  let activeMounted: Record<string, unknown> | null = null;
  let activeMarkerId: string | null = null;
  let streetsMap = $state<boolean>(true);

  const highlightMarker = (id: string) => {
    const el = placeMarkers.get(id)?.getElement();
    if (!el) return;
    el.style.background = "var(--primary)";
    el.style.color = "white";
    el.style.borderColor = "var(--primary)";
    el.style.zIndex = "10";
    // Make the star yellow-on-dark
    const svg = el.querySelector("svg");
    if (svg) {
      svg.style.fill = "white";
      svg.style.stroke = "white";
    }
  };

  const unhighlightMarker = (id: string) => {
    const el = placeMarkers.get(id)?.getElement();
    if (!el) return;
    el.style.background = "white";
    el.style.color = "var(--foreground)";
    el.style.borderColor = "var(--border)";
    el.style.zIndex = "";
    const svg = el.querySelector("svg");
    if (svg) {
      svg.style.fill = "#eab308";
      svg.style.stroke = "#eab308";
    }
  };

  const openPopup = (place: ExplorePlaceItem) => {
    if (!map) return;
    if (activePopup) {
      activePopup.remove();
      if (activeMounted) {
        unmount(activeMounted);
        activeMounted = null;
      }
      activePopup = null;
    }
    const container = document.createElement("div");
    activeMounted = mount(ExplorePlacePopover, {
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
      .setLngLat([place.lng, place.lat])
      .setDOMContent(container)
      .addTo(map);
    activePopup.on("close", () => {
      if (activeMounted) {
        unmount(activeMounted);
        activeMounted = null;
      }
      if (activeMarkerId) {
        unhighlightMarker(activeMarkerId);
        activeMarkerId = null;
      }
      activePopup = null;
    });
  };

  // Initialise filters from URL params
  let ratingFilter = $state<string>(page.url.searchParams.get("rating") ?? "");
  let ratingOpen = $state(false);
  let typeFilters = $state<string[]>(
    page.url.searchParams.get("types")?.split(",").filter(Boolean) ?? [],
  );

  // Re-sync filters when URL changes (e.g. navigating from footer links while already on /explore)
  $effect(() => {
    typeFilters = page.url.searchParams.get("types")?.split(",").filter(Boolean) ?? [];
    ratingFilter = page.url.searchParams.get("rating") ?? "";
  });
  let typesOpen = $state(false);
  let distanceFilter = $state<number>(
    Number(page.url.searchParams.get("distance") ?? 50),
  );
  let appliedDistanceFilter = $state<number | null>(
    page.url.searchParams.get("distance")
      ? Number(page.url.searchParams.get("distance"))
      : null,
  );
  let distanceOpen = $state(false);
  let difficultyFilter = $state<string>(
    page.url.searchParams.get("difficulty") ?? "",
  );
  let difficultyOpen = $state(false);
  let lengthFilter = $state<number[]>([0, 100]);
  let lengthOpen = $state(false);
  let appliedLengthFilter = $state<[number, number] | null>(
    page.url.searchParams.get("minLength") &&
      page.url.searchParams.get("maxLength")
      ? [
          Number(page.url.searchParams.get("minLength")),
          Number(page.url.searchParams.get("maxLength")),
        ]
      : null,
  );

  let bbox = $state<{
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  } | null>(null);

  const updateBbox = () => {
    if (!map) return;
    const bounds = map.getBounds();
    bbox = {
      swLat: Math.max(-90, bounds.getSouthWest().lat),
      swLng: Math.max(-180, bounds.getSouthWest().lng),
      neLat: Math.min(90, bounds.getNorthEast().lat),
      neLng: Math.min(180, bounds.getNorthEast().lng),
    };
  };

  const explorePlacesQuery = createQuery(() => ({
    queryKey: [
      "explorePlaces",
      bbox,
      typeFilters,
      ratingFilter || null,
      appliedDistanceFilter,
      appliedLengthFilter,
      difficultyFilter || null,
    ],
    enabled: !!bbox,
    queryFn: () =>
      api.place.explorePlaces({
        swLat: bbox!.swLat,
        swLng: bbox!.swLng,
        neLat: bbox!.neLat,
        neLng: bbox!.neLng,
        types: typeFilters.length > 0 ? typeFilters : undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        distance: appliedDistanceFilter ?? undefined,
        minLength: appliedLengthFilter?.[0] ?? undefined,
        maxLength: appliedLengthFilter?.[1] ?? undefined,
        difficulty: difficultyFilter
          ? (difficultyFilter as "beginner" | "intermediate" | "advanced")
          : undefined,
      }),
  }));

  // Write all active filters + map position to URL
  const syncUrl = (overrides: Record<string, string | null> = {}) => {
    const params = new URLSearchParams(page.url.searchParams);
    const updates: Record<string, string | null> = {
      types: typeFilters.length > 0 ? typeFilters.join(",") : null,
      rating: ratingFilter || null,
      distance:
        appliedDistanceFilter !== null ? String(appliedDistanceFilter) : null,
      difficulty: difficultyFilter || null,
      minLength:
        appliedLengthFilter !== null ? String(appliedLengthFilter[0]) : null,
      maxLength:
        appliedLengthFilter !== null ? String(appliedLengthFilter[1]) : null,
      ...overrides,
    };
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    goto(`?${params.toString()}`, {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });
  };

  // Sync map position to URL on moveend (debounced)
  let moveendTimer: ReturnType<typeof setTimeout>;
  const onMapMoveend = () => {
    if (!map) return;
    updateBbox();
    clearTimeout(moveendTimer);
    moveendTimer = setTimeout(() => {
      const center = map!.getCenter();
      const zoom = map!.getZoom();
      syncUrl({
        lat: center.lat.toFixed(5),
        lng: center.lng.toFixed(5),
        zoom: zoom.toFixed(2),
      });
    }, 500);
  };

  const addPlacesLayer = () => {
    map!.addSource("places", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    map!.addLayer({
      id: "clusters",
      type: "circle",
      source: "places",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#3d7a6e",
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 30],
      },
    });
    map!.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "places",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      },
      paint: { "text-color": "#ffffff" },
    });
    map!.on("click", "clusters", async (e) => {
      const features = map!.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties?.cluster_id;
      const zoom = await (
        map!.getSource("places") as maplibregl.GeoJSONSource
      ).getClusterExpansionZoom(clusterId);
      map!.easeTo({
        center: (features[0].geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ],
        zoom,
      });
    });
    map!.on("mouseenter", "clusters", () => {
      map!.getCanvas().style.cursor = "pointer";
    });
    map!.on("mouseleave", "clusters", () => {
      map!.getCanvas().style.cursor = "";
    });
  };

  const toggleMapStyle = () => {
    if (!map) return;
    streetsMap = !streetsMap;
    const style = streetsMap
      ? `https://api.maptiler.com/maps/streets/style.json?key=${PUBLIC_MAPTILER_API_KEY}`
      : `https://api.maptiler.com/maps/outdoor/style.json?key=${PUBLIC_MAPTILER_API_KEY}`;
    map.setStyle(style);
    map.once("styledata", () => {
      addPlacesLayer();

      // Remove and re-add all DOM markers (style swap destroys them)
      for (const [, marker] of placeMarkers) marker.remove();
      placeMarkers.clear();

      if (explorePlacesQuery.data) {
        const source = map!.getSource("places") as maplibregl.GeoJSONSource;
        source.setData({
          type: "FeatureCollection",
          features: explorePlacesQuery.data.places
            .filter((p) => p.lat != null && p.lng != null)
            .map((p) => ({
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
              properties: { id: p.id },
            })),
        });
        // Re-trigger the markers effect by forcing a bbox update
        updateBbox();
      }
    });
  };

  // On map load: fly to URL position, then URL-less geolocation, then NZ fallback
  $effect(() => {
    if (!map) return;

    const onLoad = () => {
      const urlLat = page.url.searchParams.get("lat");
      const urlLng = page.url.searchParams.get("lng");
      const urlZoom = page.url.searchParams.get("zoom");

      const hasUrlPosition =
        !!(urlLat && urlLng) && !(urlLat === "0.00000" && urlLng === "0.00000");

      if (hasUrlPosition) {
        map!.flyTo({
          center: [parseFloat(urlLng!), parseFloat(urlLat!)],
          zoom: urlZoom ? parseFloat(urlZoom) : 11,
          speed: 2,
        });
      } else if ($userLocation) {
        map!.flyTo({ center: $userLocation, zoom: 9, speed: 1.5 });
      } else {
        map!.flyTo({ center: NZ_CENTER, zoom: NZ_ZOOM });
      }

      // Only start syncing URL position after the initial fly-to ends
      map!.once("moveend", () => {
        updateBbox();
        map!.on("moveend", onMapMoveend);
      });

      addPlacesLayer();

      // Click anywhere on the map (not a marker) → close popup
      map!.on("click", () => {
        activePopup?.remove();
        activePopup = null;
      });
    };

    map.once("load", onLoad);
  });

  // Fly to geolocation if it arrives after map load and no URL position set
  $effect(() => {
    if (!map || !$userLocation) return;
    if (
      page.url.searchParams.get("lat") &&
      page.url.searchParams.get("lat") !== "0.00000"
    )
      return;
    map.flyTo({ center: $userLocation, zoom: 11, speed: 1.5 });
  });

  // Sync DOM markers + GeoJSON source whenever query results change
  $effect(() => {
    if (!map || !explorePlacesQuery.data) return;

    const places = explorePlacesQuery.data.places;
    const incoming = new Set(places.map((p) => p.id));

    // Remove stale markers
    for (const [id, marker] of placeMarkers) {
      if (!incoming.has(id)) {
        marker.remove();
        placeMarkers.delete(id);
      }
    }

    // Add markers for new places
    for (const place of places) {
      if (!place.lat || !place.lng || placeMarkers.has(place.id)) continue;

      const el = document.createElement("div");
      el.style.cssText = [
        "background:white",
        "color:var(--foreground)",
        "border-radius:8px",
        "padding:5px 10px",
        "font-size:12px",
        "font-weight:700",
        "box-shadow:0 2px 8px rgba(0,0,0,0.18)",
        "border:1.5px solid var(--border)",
        "cursor:pointer",
        "white-space:nowrap",
        "display:flex",
        "align-items:center",
        "gap:4px",
        "font-family:sans-serif",
        "transition:box-shadow 0.15s ease",
      ].join(";");
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#eab308" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${Number(place.rating).toFixed(1)}`;

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
        if (activeMarkerId && activeMarkerId !== place.id)
          unhighlightMarker(activeMarkerId);
        activeMarkerId = place.id;
        highlightMarker(place.id);
        openPopup(place);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map!);

      placeMarkers.set(place.id, marker);
    }

    // Update GeoJSON source so native cluster circles reflect current results
    const source = map.getSource("places") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: places
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
          properties: { id: p.id },
        })),
    });
  });

  // On each render, hide DOM markers that are absorbed into a cluster
  $effect(() => {
    if (!map) return;
    const onRender = () => {
      if (!map!.getSource("places") || !map!.isSourceLoaded("places")) return;
      for (const [, marker] of placeMarkers) {
        const point = map!.project(marker.getLngLat());
        const clustered =
          map!.queryRenderedFeatures(point, { layers: ["clusters"] }).length >
          0;
        marker.getElement().style.display = clustered ? "none" : "flex";
      }
    };
    map.on("render", onRender);
    return () => {
      map!.off("render", onRender);
    };
  });

  const ratingTypes = ["1", "2", "3", "4", "5"];
  const difficulties = ["beginner", "intermediate", "advanced"];

  const filterTypes = [
    {
      name: "Activities",
      value: "Activity",
      href: "/explore?type=Activity",
      icon: MapPin,
    },
    {
      name: "Hotels",
      value: "Hotel",
      href: "/explore?type=Hotel",
      icon: Hotel,
    },
    {
      name: "Motels",
      value: "Motel",
      href: "/explore?type=Motel",
      icon: Hotel,
    },
    {
      name: "Airbnbs",
      value: "AirBnb",
      href: "/explore?type=AirBnb",
      icon: Hotel,
    },
    {
      name: "Stores",
      value: "Store",
      href: "/explore?type=Store",
      icon: ShoppingBag,
    },
    {
      name: "Restaurants",
      value: "Restaurant",
      href: "/explore?type=Restaurant",
      icon: Utensils,
    },
    {
      name: "Cafés",
      value: "Café",
      href: "/explore?type=Café",
      icon: Coffee,
    },
    {
      name: "Bars",
      value: "Bar",
      href: "/explore?type=Bar",
      icon: CupSoda,
    },
    {
      name: "Services",
      value: "Service",
      href: "/explore?type=Service",
      icon: Stethoscope,
    },
    {
      name: "Parks",
      value: "Park",
      href: "/explore?type=Park",
      icon: Trees,
    },
    {
      name: "Beaches",
      value: "Beach",
      href: "/explore?type=Beach",
      icon: WavesHorizontal,
    },
    {
      name: "Walks",
      value: "Walk",
      href: "/explore?type=Walk",
      icon: Footprints,
    },
    {
      name: "Hikes",
      value: "Hike",
      href: "/explore?type=Hike",
      icon: Footprints,
    },
    {
      name: "Trails",
      value: "Trail",
      href: "/explore?type=Trail",
      icon: Footprints,
    },
    {
      name: "Rivers",
      value: "River",
      href: "/explore?type=River",
      icon: Footprints,
    },
    {
      name: "Lakes",
      value: "Lake",
      href: "/explore?type=Lake",
      icon: Kayak,
    },
    {
      name: "Wineries",
      value: "Winery",
      href: "/explore?type=Winery",
      icon: Wine,
    },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          userLocation.set([lng, lat]);
          map?.flyTo({ center: [lng, lat], zoom: 11, speed: 1.5 });
          syncUrl({
            lat: lat.toFixed(5),
            lng: lng.toFixed(5),
            zoom: (11).toFixed(2),
          });
        },
        () => {},
      );
    }
  };

  const ratingContent = $derived(
    ratingTypes.find((r) => r === ratingFilter) ?? "Rating",
  );

  const typeContent = $derived(
    typeFilters.length === 0
      ? "Type"
      : typeFilters.length === 1
        ? (filterTypes.find((t) => t.value === typeFilters[0])?.name ??
          typeFilters[0])
        : `${filterTypes.find((t) => t.value === typeFilters[0])?.name ?? typeFilters[0]} +${typeFilters.length - 1}`,
  );

  const difficultyContent = $derived(
    difficulties.find((d) => d === difficultyFilter) ?? "Difficulty",
  );

  const hasActiveFilters = $derived(
    typeFilters.length > 0 ||
      !!ratingFilter ||
      appliedDistanceFilter !== null ||
      appliedLengthFilter !== null ||
      !!difficultyFilter,
  );

  const clearAllFilters = () => {
    typeFilters = [];
    ratingFilter = "";
    distanceFilter = 50;
    appliedDistanceFilter = null;
    difficultyFilter = "";
    lengthFilter = [0, 100];
    appliedLengthFilter = null;
    syncUrl();
  };

  onDestroy(() => {
    for (const [, marker] of placeMarkers) marker.remove();
    placeMarkers.clear();
    if (activeMounted) unmount(activeMounted);
    activePopup?.remove();
  });

  let mapKey = $state(0);
  afterNavigate(({ from }) => {
    if (from?.url.pathname !== "/explore") {
      mapKey++;
    }
  });
</script>

<svelte:head>
  <title>Explore Dog-Friendly Places in New Zealand | Woofs Welcome</title>
  <meta
    name="description"
    content="Explore dog-friendly cafes, restaurants, accommodation, walks and more across New Zealand on an interactive map. Find the perfect spot for you and your dog."
  />
  <meta property="og:title" content="Explore Dog-Friendly Places in New Zealand | Woofs Welcome" />
  <meta
    property="og:description"
    content="Explore dog-friendly cafes, restaurants, accommodation, walks and more across New Zealand on an interactive map. Find the perfect spot for you and your dog."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://woofswelcome.app/explore" />
  <link rel="canonical" href="https://woofswelcome.app/explore" />
</svelte:head>

<div class="flex flex-col h-screen overflow-hidden">
  <Navbar {user} />
  <div class="flex-1 relative">
    <!-- Mobile filter bar -->
    <div class="md:hidden absolute top-2 left-0 right-0 z-50 px-2">
      <div
        class="flex items-center gap-2 overflow-x-auto pb-1"
        style="scrollbar-width:none;-ms-overflow-style:none;"
      >
        <!-- Distance -->
        <Popover.Root bind:open={distanceOpen}>
          <Popover.Trigger
            class={cn(
              "shrink-0 cursor-pointer bg-white border-input flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap shadow-sm",
              appliedDistanceFilter !== null &&
                "bg-primary text-white border-primary",
            )}
          >
            {appliedDistanceFilter === null
              ? "Distance"
              : `Within ${appliedDistanceFilter} km`}
            <ChevronDown class="size-3 opacity-60" />
          </Popover.Trigger>
          <Popover.Content class="w-72 text-xs">
            <div
              class="text-sm flex items-center justify-between text-muted-foreground"
            >
              <span>Distance from map location:</span>
              <span>{distanceFilter} km</span>
            </div>
            <Separator class="my-5" />
            <div class="flex items-center gap-2">
              <span>0 km</span>
              <Slider
                type="single"
                bind:value={distanceFilter}
                max={100}
                min={1}
              />
              <span>100 km</span>
            </div>
            <Separator />
            <button
              class="w-full rounded-full mt-3 hover:bg-muted cursor-pointer text-xs flex items-center justify-center py-2 px-3"
              onclick={() => {
                appliedDistanceFilter = distanceFilter;
                distanceOpen = false;
              }}
            >
              Apply
            </button>
          </Popover.Content>
        </Popover.Root>
        <!-- Rating -->
        <Select.Root
          type="single"
          name="rating-mob"
          bind:value={ratingFilter}
          onValueChange={() => syncUrl()}
        >
          <Select.Trigger
            class={cn(
              "shrink-0 w-auto cursor-pointer bg-white border-input rounded-full border px-3 py-1.5 text-sm whitespace-nowrap shadow-sm",
              ratingFilter && "bg-primary text-white border-primary",
            )}
          >
            <div class="flex items-center gap-1">
              {#if ratingFilter}<Star
                  class="size-3 fill-yellow-400 text-yellow-400"
                />{/if}{ratingContent}
            </div>
          </Select.Trigger>
          <Select.Content>
            {#each ["1", "2", "3", "4", "5"] as r}
              <Select.Item value={r}
                >{#each Array(Number(r)) as _}<Star
                    class="size-3 fill-yellow-400 text-yellow-400 inline"
                  />{/each}</Select.Item
              >
            {/each}
            {#if ratingFilter}
              <Select.Separator />
              <button
                onclick={() => {
                  ratingFilter = "";
                }}
                class="w-full hover:bg-muted cursor-pointer text-xs py-2 px-3"
                >Clear</button
              >
            {/if}
          </Select.Content>
        </Select.Root>
        <!-- Types -->
        <Select.Root
          type="multiple"
          name="type-mob"
          bind:value={typeFilters}
          onValueChange={() => syncUrl()}
        >
          <Select.Trigger
            class={cn(
              "shrink-0 w-auto cursor-pointer bg-white border-input rounded-full border px-3 py-1.5 text-sm whitespace-nowrap shadow-sm",
              typeFilters.length > 0 && "bg-primary text-white border-primary",
            )}
          >
            {typeContent}
          </Select.Trigger>
          <Select.Content class="h-64">
            {#each filterTypes as filter}
              <Select.Item value={filter.value}>{filter.name}</Select.Item>
            {/each}
            {#if typeFilters.length > 0}
              <Select.Separator />
              <button
                onclick={() => {
                  typeFilters = [];
                }}
                class="w-full hover:bg-muted cursor-pointer text-xs py-2 px-3"
                >Clear</button
              >
            {/if}
          </Select.Content>
        </Select.Root>
        {#if typeFilters.includes("Walk") || typeFilters.includes("Hike") || typeFilters.includes("Trail")}
          <!-- Difficulty -->
          <Select.Root
            type="single"
            name="diff-mob"
            bind:value={difficultyFilter}
          >
            <Select.Trigger
              class={cn(
                "shrink-0 w-auto capitalize cursor-pointer bg-white border-input rounded-full border px-3 py-1.5 text-sm whitespace-nowrap shadow-sm",
                difficultyFilter && "bg-primary text-white border-primary",
              )}
            >
              {difficultyContent}
            </Select.Trigger>
            <Select.Content>
              {#each ["beginner", "intermediate", "advanced"] as d}
                <Select.Item value={d} class="capitalize">{d}</Select.Item>
              {/each}
              {#if difficultyFilter}
                <Select.Separator />
                <button
                  onclick={() => {
                    difficultyFilter = "";
                  }}
                  class="w-full hover:bg-muted cursor-pointer text-xs py-2 px-3"
                  >Clear</button
                >
              {/if}
            </Select.Content>
          </Select.Root>
          <!-- Length -->
          <Popover.Root bind:open={lengthOpen}>
            <Popover.Trigger
              class={cn(
                "shrink-0 cursor-pointer bg-white border-input flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap shadow-sm",
                appliedLengthFilter !== null &&
                  "bg-primary text-white border-primary",
              )}
            >
              {appliedLengthFilter === null
                ? "Length"
                : `${lengthFilter[0]}-${lengthFilter[1]} km`}
              <ChevronDown class="size-3 opacity-60" />
            </Popover.Trigger>
            <Popover.Content class="w-72 text-xs">
              <div class="text-sm text-muted-foreground mb-4">
                {lengthFilter[0]}-{lengthFilter[1]} km
              </div>
              <Separator class="my-5" />
              <div class="flex items-center gap-2">
                <span>0 km</span>
                <Slider
                  type="multiple"
                  bind:value={lengthFilter}
                  max={100}
                  min={0}
                />
                <span>100 km</span>
              </div>
              <Separator />
              <button
                class="w-full rounded-full mt-3 hover:bg-muted cursor-pointer text-xs flex items-center justify-center py-2 px-3"
                onclick={() => {
                  appliedLengthFilter = [lengthFilter[0], lengthFilter[1]];
                  lengthOpen = false;
                  syncUrl({
                    minLength: String(lengthFilter[0]),
                    maxLength: String(lengthFilter[1]),
                  });
                }}
              >
                Apply
              </button>
            </Popover.Content>
          </Popover.Root>
        {/if}
        {#if hasActiveFilters}
          <button
            onclick={clearAllFilters}
            class="shrink-0 cursor-pointer bg-muted rounded-full border border-input px-3 py-1.5 text-sm whitespace-nowrap shadow-sm"
          >
            Clear all
          </button>
        {/if}
      </div>
    </div>

    <!-- Desktop place list -->
    <div
      class="hidden md:block absolute top-4 left-4 bottom-4 shrink-0 z-50 rounded-lg bg-white overflow-hidden"
      style="
        max-height: {listCollapsed ? '75px' : 'calc(100% - 2rem)'};
        max-width: {listCollapsed ? 'calc(25% - 50px)' : '25%'};
        width: 25%;
        transition:
          max-height 300ms ease {listCollapsed ? '0ms' : '200ms'},
          max-width 200ms ease {listCollapsed ? '300ms' : '0ms'};
      "
    >
      <div class="flex flex-col h-full">
        <!-- Fixed header -->
        <div class="p-4 shrink-0 shadow-sm mb-4">
          <div class="flex items-center justify-between gap-4">
            <div class="text-lg font-semibold whitespace-nowrap">
              Explore places
            </div>
            <button
              onclick={() => (listCollapsed = !listCollapsed)}
              class="rounded-full border p-2 cursor-pointer bg-muted hover:bg-secondary shrink-0 ml-auto"
            >
              <ChevronUp
                class={cn(
                  "h-4 w-4 transition-transform duration-200",
                  listCollapsed && "rotate-180",
                )}
              />
            </button>
          </div>
          {#if explorePlacesQuery.isSuccess}
            <div class="text-sm text-muted-foreground">
              {explorePlacesQuery.data && explorePlacesQuery.data.total}
              {explorePlacesQuery.data && explorePlacesQuery.data.total === 1
                ? "place"
                : "places"}
            </div>
          {/if}
        </div>
        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-4 py-4 relative">
          {#if explorePlacesQuery.isFetching && !explorePlacesQuery.isLoading}
            <div class="absolute top-2 right-2 z-10">
              <Spinner class="size-4" />
            </div>
          {/if}
          {#if explorePlacesQuery.isLoading}
            <div class="h-24 flex items-center justify-center"><Spinner /></div>
          {:else if explorePlacesQuery.isError}
            <div
              class="h-24 flex flex-col items-center justify-center text-center px-2"
            >
              <p class="text-sm font-semibold">Something went wrong.</p>
              <p class="text-xs text-muted-foreground mt-1">
                Try moving the map or adjusting your filters.
              </p>
            </div>
          {:else if explorePlacesQuery.isSuccess && explorePlacesQuery.data.places.length === 0}
            <div class="h-24 flex flex-col items-center justify-center">
              <p class="text-lg font-semibold">No places found in this area.</p>
              <p class="text-sm text-muted-foreground">
                Zoom out or try a new search.
              </p>
            </div>
          {:else if explorePlacesQuery.isSuccess && explorePlacesQuery.data.places.length > 0}
            <div role="list" class="flex flex-col gap-6">
              {#each explorePlacesQuery.data.places as place (place.id)}
                <div
                  role="listitem"
                  onmouseenter={() => {
                    openPopup(place);
                    highlightMarker(place.id);
                  }}
                  onmouseleave={() => {
                    unhighlightMarker(place.id);
                  }}
                >
                  <PlaceCard
                    id={place.id}
                    name={place.name}
                    slug={place.slug}
                    types={place.types}
                    rating={String(place.rating)}
                    reviewCount={place.reviewsCount}
                    cityName={place.cityName}
                    regionName={place.regionName}
                    countryCode={place.countryCode}
                    locationPath={place.locationPath}
                    imageId={place.imageId}
                    isSaved={place.isSaved}
                    isVerified={place.isVerified}
                    memberFavourite={place.memberFavourite}
                    dogAmenities={place.dogAmenities}
                    {user}
                  />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mobile bottom sheet — slides up to fill screen below the filter bar -->
    <div
      class="md:hidden absolute left-0 right-0 bottom-0 z-40"
      style="
        top: {listCollapsed ? '100%' : '3.5rem'};
        transition: top 300ms ease;
      "
    >
      <div class="bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div
          class="px-4 pt-4 pb-6 shrink-0 border-b flex items-center justify-between"
        >
          <span class="font-semibold">Explore places</span>
          {#if explorePlacesQuery.isSuccess}
            <span class="text-sm text-primary">
              {explorePlacesQuery.data.total}
              {explorePlacesQuery.data.total === 1 ? "place" : "places"}
            </span>
          {/if}
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-4 relative">
          {#if explorePlacesQuery.isFetching && !explorePlacesQuery.isLoading}
            <div class="absolute top-2 right-2 z-10">
              <Spinner class="size-4" />
            </div>
          {/if}
          {#if explorePlacesQuery.isLoading}
            <div class="h-24 flex items-center justify-center"><Spinner /></div>
          {:else if explorePlacesQuery.isError}
            <div
              class="h-24 flex flex-col items-center justify-center text-center px-2"
            >
              <p class="text-sm font-semibold">Something went wrong.</p>
              <p class="text-xs text-muted-foreground mt-1">
                Try moving the map or adjusting your filters.
              </p>
            </div>
          {:else if explorePlacesQuery.isSuccess && explorePlacesQuery.data.places.length === 0}
            <div class="h-24 flex flex-col items-center justify-center">
              <p class="font-semibold">No places found in this area.</p>
              <p class="text-sm text-muted-foreground">
                Zoom out or try a new search.
              </p>
            </div>
          {:else if explorePlacesQuery.isSuccess}
            <div role="list" class="flex flex-col gap-6">
              {#each explorePlacesQuery.data.places as place (place.id)}
                <div role="listitem">
                  <PlaceCard
                    id={place.id}
                    name={place.name}
                    slug={place.slug}
                    types={place.types}
                    rating={String(place.rating)}
                    reviewCount={place.reviewsCount}
                    cityName={place.cityName}
                    regionName={place.regionName}
                    countryCode={place.countryCode}
                    locationPath={place.locationPath}
                    imageId={place.imageId}
                    isSaved={place.isSaved}
                    isVerified={place.isVerified}
                    memberFavourite={place.memberFavourite}
                    dogAmenities={place.dogAmenities}
                    {user}
                  />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mobile floating toggle pill — always visible at bottom -->
    <div class="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onclick={() => (listCollapsed = !listCollapsed)}
        class="flex items-center gap-2 bg-primary text-white rounded-full px-5 py-3 font-semibold shadow-xl cursor-pointer"
      >
        {#if listCollapsed}
          <List class="size-4" />
          List
        {:else}
          <MapIcon class="size-4" />
          Map
        {/if}
      </button>
    </div>

    <!-- Desktop filter bar -->
    <div
      class="hidden md:flex absolute top-4 right-4 z-50 items-center gap-2"
      style="
        left: {listCollapsed ? 'calc(25% - 50px + 2rem)' : 'calc(25% + 2rem)'};
        transition: left 200ms ease {listCollapsed ? '300ms' : '0ms'};
      "
    >
      <!-- Distance -->
      <Popover.Root bind:open={distanceOpen}>
        <Popover.Trigger
          class={cn(
            "w-48 cursor-pointer bg-white border-input [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 rounded-md border hover:bg-muted px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            distanceOpen && "text-accent-foreground",
          )}
          >{appliedDistanceFilter === null
            ? "Distance away"
            : `Within ${appliedDistanceFilter} km`}<ChevronDown
            class={cn(
              "size-4 opacity-50 transition-transform duration-200",
              distanceOpen && "rotate-180",
            )}
          />
        </Popover.Trigger>
        <Popover.Content class="ml-24 w-72 text-xs">
          <div
            class="text-sm flex items-center justify-between text-muted-foreground"
          >
            <span>Distance from map location:</span>
            <span>{distanceFilter} km</span>
          </div>
          <Separator class="my-5" />
          <div class="flex items-center gap-2">
            <span>0 km</span>
            <Slider
              type="single"
              bind:value={distanceFilter}
              max={100}
              min={1}
            />
            <span>100 km</span>
          </div>
          <Separator />
          <button
            class="w-full rounded-full mt-3 hover:bg-muted cursor-pointer text-xs flex items-center justify-center py-2 px-3"
            onclick={() => {
              appliedDistanceFilter = distanceFilter;
              distanceOpen = false;
            }}
          >
            Apply
          </button>
        </Popover.Content>
      </Popover.Root>
      <!-- Rating -->
      <Select.Root
        type="single"
        name="rating"
        bind:value={ratingFilter}
        bind:open={ratingOpen}
        onValueChange={() => syncUrl()}
      >
        <Select.Trigger class="w-36 bg-white cursor-pointer hover:bg-muted"
          ><div class="flex items-center gap-2">
            {#if ratingFilter}<Star
                class="size-4 fill-yellow-400 text-yellow-400"
              />{/if}{ratingContent}
          </div>
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="1">
            <Star class="size-4 fill-yellow-400 text-yellow-400" />
          </Select.Item>
          <Select.Item value="2">
            {#each Array(2) as _, i}
              <Star class="size-4 fill-yellow-400 text-yellow-400" />
            {/each}
          </Select.Item>
          <Select.Item value="3">
            {#each Array(3) as _, i}
              <Star class="size-4 fill-yellow-400 text-yellow-400" />
            {/each}
          </Select.Item>
          <Select.Item value="4">
            {#each Array(4) as _, i}
              <Star class="size-4 fill-yellow-400 text-yellow-400" />
            {/each}
          </Select.Item>
          <Select.Item value="5">
            {#each Array(5) as _, i}
              <Star class="size-4 fill-yellow-400 text-yellow-400" />
            {/each}
          </Select.Item>
          {#if ratingFilter}
            <Select.Separator class="flex items-center justify-center" />
            <button
              onclick={() => {
                ratingFilter = "";
                ratingOpen = false;
              }}
              class="w-full hover:bg-muted cursor-pointer text-xs fles items-center justify-center py-2 px-3"
            >
              Clear
            </button>
          {/if}
        </Select.Content>
      </Select.Root>
      <!-- Types -->
      <Select.Root
        type="multiple"
        name="type"
        bind:value={typeFilters}
        bind:open={typesOpen}
        onValueChange={() => syncUrl()}
      >
        <Select.Trigger class="w-36 bg-white cursor-pointer hover:bg-muted"
          >{typeContent}
        </Select.Trigger>
        <Select.Content class="h-64">
          {#each filterTypes as filter}
            <Select.Item value={filter.value}>
              {filter.name}
            </Select.Item>
          {/each}
          {#if typeFilters.length > 0}
            <Select.Separator class="flex items-center justify-center" />
            <button
              onclick={() => {
                typeFilters = [];
                typesOpen = false;
              }}
              class="w-full hover:bg-muted cursor-pointer text-xs fles items-center justify-center py-2 px-3"
            >
              Clear
            </button>
          {/if}
        </Select.Content>
      </Select.Root>
      {#if typeFilters.includes("Walk") || typeFilters.includes("Hike") || typeFilters.includes("Trail")}
        <!-- Difficulty -->
        <Select.Root
          type="single"
          bind:value={difficultyFilter}
          bind:open={difficultyOpen}
        >
          <Select.Trigger
            class="capitalize w-36 bg-white cursor-pointer hover:bg-muted"
            >{difficultyContent}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="beginner">
              <span class="text-sm text-muted-foreground">Beginner</span>
            </Select.Item>
            <Select.Item value="intermediate">
              <span class="text-sm text-muted-foreground">Intermediate</span>
            </Select.Item>
            <Select.Item value="advanced">
              <span class="text-sm text-muted-foreground">Advanced</span>
            </Select.Item>
            {#if difficultyFilter}
              <Select.Separator class="flex items-center justify-center" />
              <button
                onclick={() => {
                  difficultyFilter = "";
                  difficultyOpen = false;
                }}
                class="w-full hover:bg-muted cursor-pointer text-xs fles items-center justify-center py-2 px-3"
              >
                Clear
              </button>
            {/if}
          </Select.Content>
        </Select.Root>
        <!-- Trail length -->
        <Popover.Root bind:open={lengthOpen}>
          <Popover.Trigger
            class={cn(
              "w-48 cursor-pointer bg-white border-input [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 rounded-md border hover:bg-muted px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              lengthOpen && "text-accent-foreground",
            )}
            >{appliedLengthFilter === null
              ? "Length"
              : `${lengthFilter[0]}-${lengthFilter[1]} km`}
            <ChevronDown
              class={cn(
                "size-4 opacity-50 transition-transform duration-200",
                lengthOpen && "rotate-180",
              )}
            />
          </Popover.Trigger>
          <Popover.Content class="ml-24 w-72 text-xs">
            {#if lengthFilter.length > 0}
              <div class="text-sm text-muted-foreground">
                <span>{lengthFilter[0]}-{lengthFilter[1]} km</span>
              </div>
              <Separator class="my-5" />
            {/if}
            <div class="flex items-center gap-2">
              <span>0 km</span>
              <Slider
                type="multiple"
                bind:value={lengthFilter}
                max={100}
                min={0}
              />
              <span>100 km</span>
            </div>
            <Separator />
            <button
              class="w-full rounded-full mt-3 hover:bg-muted cursor-pointer text-xs flex items-center justify-center py-2 px-3"
              onclick={() => {
                appliedLengthFilter = [lengthFilter[0], lengthFilter[1]];
                lengthOpen = false;
                syncUrl({
                  minLength: String(lengthFilter[0]),
                  maxLength: String(lengthFilter[1]),
                });
              }}
            >
              Apply
            </button>
          </Popover.Content>
        </Popover.Root>
      {/if}
      {#if hasActiveFilters}
        <button
          onclick={clearAllFilters}
          class="cursor-pointer bg-white border border-input rounded-md px-3 py-2 text-sm font-medium hover:bg-muted shadow-xs whitespace-nowrap"
        >
          Clear all
        </button>
      {/if}
      <div class="absolute top-2 right-0">
        <button
          onclick={getCurrentLocation}
          class="rounded-full p-4 hover:bg-muted cursor-pointer bg-white border-input shadow-xl"
          ><Navigation class="size-5" /></button
        >
      </div>
      <div class="absolute top-18 right-0">
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button
              onclick={toggleMapStyle}
              class="rounded-full p-4 hover:bg-muted cursor-pointer bg-white border-input shadow-xl"
            >
              {#if streetsMap}
                <TentTree class="size-5" />
              {:else}
                <Road class="size-6" />
              {/if}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content
            side="bottom"
            class="bg-white text-sm text-foreground rounded-lg shadow-xl"
          >
            {#if streetsMap}
              <p>Switch to Outdoors map</p>
            {:else}
              <p>Switch to Streets map</p>
            {/if}
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </div>

    {#key mapKey}
      <MapLibre
        style={`https://api.maptiler.com/maps/${streetsMap ? "streets" : "outdoor"}/style.json?key=${PUBLIC_MAPTILER_API_KEY}`}
        class="h-full w-full"
        attributionControl={{ compact: true, customAttribution: "" }}
        bind:map
      >
        <NavigationControl position="bottom-right" showCompass={false} />
      </MapLibre>
    {/key}
  </div>
</div>
