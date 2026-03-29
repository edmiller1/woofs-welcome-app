<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import MapPlaceCard from "$lib/components/map-place-card.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import { onMount, onDestroy, mount, unmount } from "svelte";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import type { BAUser, LocationPlace } from "@woofs/types";

  const ALL_TYPES = [
    "Park",
    "Restaurant",
    "Hotel",
    "Motel",
    "AirBnb",
    "Store",
    "Café",
    "Bar",
    "Dog Park",
    "Beach",
    "Walk",
    "Hike",
    "Service",
    "Activity",
    "Lake",
    "River",
    "Trail",
    "Winery",
    "Accomodation",
  ];

  interface Props {
    data: {
      pathname: string;
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { pathname, user } = $derived(data);

  // Parse filters from URL
  const activeTypes = $derived(
    page.url.searchParams.get("types")?.split(",").filter(Boolean) ?? [],
  );
  const currentPage = $derived(
    Number(page.url.searchParams.get("page") ?? "1"),
  );

  const explore = $derived(
    createQuery(() => ({
      queryKey: ["explore", pathname, activeTypes, currentPage],
      queryFn: () =>
        api.location.getExplorePlaces(pathname, {
          types: activeTypes.length > 0 ? activeTypes : undefined,
          page: currentPage,
        }),
    })),
  );

  // Map state
  let mapContainer = $state<HTMLDivElement>();
  let map = $state<mapboxgl.Map>();
  const markers = new Map<string, mapboxgl.Marker>();
  let hoveredPlaceId = $state<string | null>(null);
  let activePopup: mapboxgl.Popup | null = null;
  let activeMounted: Record<string, unknown> | null = null;

  // Sync hovered card → map marker highlight
  $effect(() => {
    markers.forEach((marker, id) => {
      const el = marker.getElement().querySelector("div")!;
      if (id === hoveredPlaceId) {
        el.style.backgroundColor = "#154b11";
        el.style.color = "white";
        el.style.zIndex = "10";
        marker.getElement().style.zIndex = "10";
      } else {
        el.style.backgroundColor = "white";
        el.style.color = "black";
        el.style.zIndex = "0";
        marker.getElement().style.zIndex = "0";
      }
    });
  });

  // Re-render markers when places change
  $effect(() => {
    const places = explore.data?.places;
    if (!map || !places) return;

    // Remove old markers
    markers.forEach((m) => m.remove());
    markers.clear();

    const validPlaces = places.filter((p) => p.lat !== null && p.lng !== null);
    if (validPlaces.length === 0) return;

    validPlaces.forEach((place) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="background:white;color:black;border-radius:9999px;padding:2px 8px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e5e7eb;cursor:pointer;transition:background 0.15s,color 0.15s;white-space:nowrap;">
          ★ ${place.rating ? Number(place.rating).toFixed(1) : "N/A"}
        </div>
      `;

      el.addEventListener("mouseenter", () => { hoveredPlaceId = place.id; });
      el.addEventListener("mouseleave", () => { hoveredPlaceId = null; });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close existing popup
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

    // Fit bounds to new markers
    if (validPlaces.length === 1) {
      map.flyTo({
        center: [Number(validPlaces[0].lng), Number(validPlaces[0].lat)],
        zoom: 13,
      });
    } else {
      const bounds = new mapboxgl.LngLatBounds();
      validPlaces.forEach((p) => bounds.extend([Number(p.lng), Number(p.lat)]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  });

  onMount(() => {
    if (!mapContainer) return;

    mapboxgl.accessToken = PUBLIC_MAPBOX_API_KEY;
    map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/streets-v11",
      interactive: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("click", () => { activePopup?.remove(); });
  });

  onDestroy(() => {
    activePopup?.remove();
    if (activeMounted) unmount(activeMounted);
    markers.forEach((m) => m.remove());
    map?.remove();
  });

  function toggleType(type: string) {
    const params = new URLSearchParams(page.url.searchParams);
    const current = params.get("types")?.split(",").filter(Boolean) ?? [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];

    if (next.length > 0) {
      params.set("types", next.join(","));
    } else {
      params.delete("types");
    }
    params.set("page", "1");
    goto(`?${params.toString()}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true,
    });
  }

  function setPage(p: number) {
    const params = new URLSearchParams(page.url.searchParams);
    params.set("page", String(p));
    goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
  }

  const totalPages = $derived(
    explore.data ? Math.ceil(explore.data.total / explore.data.pageSize) : 0,
  );
</script>

<ErrorBoundary error={explore.error}>
  <Navbar {user} />

  <div class="flex h-[calc(100vh-64px)] overflow-hidden">
    <!-- Left: scrollable list -->
    <div class="w-full lg:w-1/2 xl:w-[55%] flex flex-col overflow-hidden">
      <!-- Type filter chips -->
      <div class="px-6 py-4 border-b border-outline-variant/20 overflow-x-auto">
        <div class="flex gap-2 min-w-max">
          {#each ALL_TYPES as type}
            <button
              onclick={() => toggleType(type)}
              class="cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap
                {activeTypes.includes(type)
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-on-surface border-outline-variant/40 hover:border-primary/60'}"
            >
              {type}
            </button>
          {/each}
        </div>
      </div>

      <!-- Results count -->
      <div class="px-6 py-3 text-sm text-secondary">
        {#if explore.isSuccess}
          {explore.data.total} places found
        {/if}
      </div>

      <!-- Place list -->
      <div class="flex-1 overflow-y-auto px-6 pb-6">
        {#if explore.isLoading}
          <div class="flex items-center justify-center h-64">
            <Spinner />
          </div>
        {:else if explore.isSuccess}
          {#if explore.data.places.length === 0}
            <div
              class="flex flex-col items-center justify-center h-64 text-secondary gap-2"
            >
              <p class="font-medium">No places found</p>
              <p class="text-sm">Try removing some filters</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {#each explore.data.places as place}
                <div
                  onmouseenter={() => (hoveredPlaceId = place.id)}
                  onmouseleave={() => (hoveredPlaceId = null)}
                  role="listitem"
                >
                  <PlaceCard
                    id={place.id}
                    name={place.name}
                    rating={place.rating}
                    slug={place.slug}
                    cityName={place.cityName}
                    regionName={place.regionName}
                    countryCode={place.countryCode}
                    types={place.types}
                    isSaved={place.isSaved}
                    imageId={place.imageId}
                    {user}
                    locationPath={place.locationPath}
                    isVerified={place.isVerified}
                  />
                </div>
              {/each}
            </div>

            <!-- Pagination -->
            {#if totalPages > 1}
              <div class="flex items-center justify-center gap-2 mt-8">
                <button
                  onclick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  class="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                >
                  Previous
                </button>
                <span class="text-sm text-secondary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onclick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  class="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-surface-container-low transition-colors"
                >
                  Next
                </button>
              </div>
            {/if}
          {/if}
        {/if}
      </div>
    </div>

    <!-- Right: sticky map -->
    <div class="hidden lg:block flex-1 sticky top-0 h-[87vh] m-4">
      <div bind:this={mapContainer} class="w-full h-full rounded-lg"></div>
    </div>
  </div>

  <MobileBottomNav {user} />
</ErrorBoundary>
