<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import { onMount, onDestroy, mount, unmount } from "svelte";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  import type { BAUser, LocationPlace } from "@woofs/types";
  import MapPlaceCard from "$lib/components/map-place-card.svelte";
  import Footer from "$lib/components/footer.svelte";

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

  // Bbox from URL (set when user searches by map area)
  const activeBbox = $derived(() => {
    const swLat = page.url.searchParams.get("swLat");
    const swLng = page.url.searchParams.get("swLng");
    const neLat = page.url.searchParams.get("neLat");
    const neLng = page.url.searchParams.get("neLng");
    if (swLat && swLng && neLat && neLng) {
      return {
        swLat: Number(swLat),
        swLng: Number(swLng),
        neLat: Number(neLat),
        neLng: Number(neLng),
      };
    }
    return undefined;
  });

  const explore = $derived(
    createQuery(() => ({
      queryKey: ["explore", pathname, activeTypes, currentPage, activeBbox()],
      queryFn: () =>
        api.location.getExplorePlaces(pathname, {
          types: activeTypes.length > 0 ? activeTypes : undefined,
          page: currentPage,
          bbox: activeBbox(),
        }),
    })),
  );

  // "Search this area" button state
  let showSearchAreaButton = $state(false);
  // Suppress moveend during programmatic panning (fitBounds/flyTo after data loads)
  let suppressMoveEnd = false;

  // Map state — separate containers for desktop and mobile
  let desktopMapContainer = $state<HTMLDivElement>();
  let mobileMapContainer = $state<HTMLDivElement>();
  let desktopMap = $state<mapboxgl.Map>();
  let mobileMap = $state<mapboxgl.Map>();
  const desktopMarkers = new Map<string, mapboxgl.Marker>();
  const mobileMarkers = new Map<string, mapboxgl.Marker>();
  let hoveredPlaceId = $state<string | null>(null);

  // Track mounted popup components so we can unmount them on cleanup
  const mountedPopups = new Map<mapboxgl.Popup, ReturnType<typeof mount>>();

  function addMarkersToMap(
    mapInstance: mapboxgl.Map,
    markersMap: Map<string, mapboxgl.Marker>,
    places: LocationPlace[],
  ) {
    markersMap.forEach((m) => m.remove());
    markersMap.clear();
    mountedPopups.forEach((c) => unmount(c));
    mountedPopups.clear();

    const validPlaces = places.filter((p) => p.lat !== null && p.lng !== null);
    if (validPlaces.length === 0) return;

    validPlaces.forEach((place) => {
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="background:white;color:black;border-radius:9999px;padding:2px 8px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e5e7eb;cursor:pointer;transition:background 0.15s,color 0.15s;white-space:nowrap;">
          ★ ${place.rating ? Number(place.rating).toFixed(1) : "N/A"}
        </div>
      `;
      el.addEventListener("mouseenter", () => {
        hoveredPlaceId = place.id;
      });
      el.addEventListener("mouseleave", () => {
        hoveredPlaceId = null;
      });

      const popupNode = document.createElement("div");
      const popup = new mapboxgl.Popup({
        offset: 8,
        closeButton: false,
        maxWidth: "none",
        className: "woofs-map-popup",
      }).setDOMContent(popupNode);

      popup.on("open", () => {
        const component = mount(MapPlaceCard, {
          target: popupNode,
          props: { place, onclose: () => popup.remove() },
        });
        mountedPopups.set(popup, component);
      });

      popup.on("close", () => {
        const component = mountedPopups.get(popup);
        if (component) {
          unmount(component);
          mountedPopups.delete(popup);
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([Number(place.lng), Number(place.lat)])
        .setPopup(popup)
        .addTo(mapInstance);

      markersMap.set(place.id, marker);
    });

    // Don't refit the map if we're already in bbox search mode
    if (!activeBbox()) {
      suppressMoveEnd = true;
      if (validPlaces.length === 1) {
        mapInstance.flyTo({
          center: [Number(validPlaces[0].lng), Number(validPlaces[0].lat)],
          zoom: 13,
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        validPlaces.forEach((p) =>
          bounds.extend([Number(p.lng), Number(p.lat)]),
        );
        mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 14 });
      }
      mapInstance.once("moveend", () => {
        suppressMoveEnd = false;
      });
    }
  }

  // Mobile drawer state
  // snapPoints as % of viewport height from bottom (0 = fully collapsed, 1 = fully open)
  const SNAP_PEEK = 0.18; // just a handle + count peek
  const SNAP_HALF = 0.52; // half screen
  const SNAP_FULL = 0.88; // nearly full screen
  let drawerSnap = $state(SNAP_PEEK);
  let isDragging = $state(false);
  let dragStartY = $state(0);
  let dragStartSnap = $state(SNAP_PEEK);

  // Derived drawer height in vh units for CSS
  const drawerHeight = $derived(`${drawerSnap * 100}vh`);

  function onDrawerPointerDown(e: PointerEvent) {
    isDragging = true;
    dragStartY = e.clientY;
    dragStartSnap = drawerSnap;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onDrawerPointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dy = dragStartY - e.clientY; // positive = dragging up
    const viewportH = window.innerHeight;
    const newSnap = Math.min(
      SNAP_FULL,
      Math.max(SNAP_PEEK, dragStartSnap + dy / viewportH),
    );
    drawerSnap = newSnap;
  }

  function onDrawerPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    // Snap to nearest
    const snaps = [SNAP_PEEK, SNAP_HALF, SNAP_FULL];
    drawerSnap = snaps.reduce((prev, curr) =>
      Math.abs(curr - drawerSnap) < Math.abs(prev - drawerSnap) ? curr : prev,
    );
  }

  // Sync hovered card → marker highlight on both maps
  $effect(() => {
    for (const markersMap of [desktopMarkers, mobileMarkers]) {
      markersMap.forEach((marker, id) => {
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
    }
  });

  // Re-render markers when places change
  $effect(() => {
    const places = explore.data?.places;
    if (!places) return;
    if (desktopMap) addMarkersToMap(desktopMap, desktopMarkers, places);
    if (mobileMap) addMarkersToMap(mobileMap, mobileMarkers, places);
  });

  function initMap(
    container: HTMLDivElement,
    initialCenter?: [number, number],
    initialZoom?: number,
  ) {
    const m = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v11",
      interactive: true,
      ...(initialCenter
        ? { center: initialCenter, zoom: initialZoom ?? 12 }
        : { center: [0, 0], zoom: 1 }),
      fadeDuration: 0,
    });
    m.addControl(new mapboxgl.NavigationControl(), "top-right");
    // Show "Search this area" after user pans/zooms
    m.on("moveend", () => {
      if (!suppressMoveEnd) showSearchAreaButton = true;
    });
    return m;
  }

  function searchThisArea() {
    // Use whichever map is active (prefer desktop, fall back to mobile)
    const activeMap = desktopMap ?? mobileMap;
    if (!activeMap) return;
    const bounds = activeMap.getBounds()!;
    const params = new URLSearchParams(page.url.searchParams);
    params.set("swLat", String(bounds.getSouth()));
    params.set("swLng", String(bounds.getWest()));
    params.set("neLat", String(bounds.getNorth()));
    params.set("neLng", String(bounds.getEast()));
    params.set("page", "1");
    showSearchAreaButton = false;
    goto(`?${params.toString()}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true,
    });
  }

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_API_KEY;
  });

  // Init maps once containers are bound and we have place data for initial position
  $effect(() => {
    const places = explore.data?.places;
    const validPlaces =
      places?.filter((p) => p.lat !== null && p.lng !== null) ?? [];

    let initialCenter: [number, number] | undefined;
    let initialZoom: number | undefined;

    if (validPlaces.length === 1) {
      initialCenter = [Number(validPlaces[0].lng), Number(validPlaces[0].lat)];
      initialZoom = 13;
    } else if (validPlaces.length > 1) {
      // Use centroid of all places as initial center
      const avgLng =
        validPlaces.reduce((s, p) => s + Number(p.lng), 0) / validPlaces.length;
      const avgLat =
        validPlaces.reduce((s, p) => s + Number(p.lat), 0) / validPlaces.length;
      initialCenter = [avgLng, avgLat];
      initialZoom = 11;
    }

    if (desktopMapContainer && !desktopMap) {
      desktopMap = initMap(desktopMapContainer, initialCenter, initialZoom);
    }
    if (mobileMapContainer && !mobileMap) {
      mobileMap = initMap(mobileMapContainer, initialCenter, initialZoom);
    }
  });

  onDestroy(() => {
    mountedPopups.forEach((c) => unmount(c));
    mountedPopups.clear();
    desktopMarkers.forEach((m) => m.remove());
    mobileMarkers.forEach((m) => m.remove());
    desktopMap?.remove();
    mobileMap?.remove();
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

  function resetMapSearch() {
    const params = new URLSearchParams(page.url.searchParams);
    params.delete("swLat");
    params.delete("swLng");
    params.delete("neLat");
    params.delete("neLng");
    params.set("page", "1");
    showSearchAreaButton = false;
    goto(`?${params.toString()}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true,
    });
  }

  const totalPages = $derived(
    explore.data ? Math.ceil(explore.data.total / explore.data.pageSize) : 0,
  );
</script>

<ErrorBoundary error={explore.error}>
  <Navbar {user} />

  <!-- ─── DESKTOP layout ─────────────────────────────────────── -->
  <div class="hidden lg:block">
    <div class="flex h-[calc(100vh-64px)] overflow-hidden">
      <!-- Left: scrollable list -->
      <div class="w-full lg:w-1/2 xl:w-[55%] flex flex-col overflow-hidden">
        <!-- Type filter chips -->
        <div
          class="px-6 py-4 border-b border-outline-variant/20 overflow-x-auto"
        >
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
        <div
          bind:this={desktopMapContainer}
          class="w-full h-full rounded-lg"
        ></div>
        {#if showSearchAreaButton || activeBbox()}
          <div
            class="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
          >
            {#if showSearchAreaButton}
              <button
                onclick={searchThisArea}
                class="cursor-pointer bg-white text-on-surface text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
              >
                Search this area
              </button>
            {/if}
            {#if activeBbox()}
              <button
                onclick={resetMapSearch}
                class="cursor-pointer bg-white text-secondary text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
              >
                Reset
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    <Footer />
  </div>

  <!-- ─── MOBILE layout ─────────────────────────────────────── -->
  <div class="lg:hidden relative w-full" style="height: calc(100dvh - 64px)">
    <!-- Full-screen map -->
    <div
      bind:this={mobileMapContainer}
      class="absolute inset-0 w-full h-full"
    ></div>

    <!-- Map action buttons -->
    {#if showSearchAreaButton || activeBbox()}
      <div
        class="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
      >
        {#if showSearchAreaButton}
          <button
            onclick={searchThisArea}
            class="cursor-pointer bg-white text-on-surface text-sm font-semibold px-4 py-2 rounded-full shadow-lg border border-outline-variant/30"
          >
            Search this area
          </button>
        {/if}
        {#if activeBbox()}
          <button
            onclick={resetMapSearch}
            class="cursor-pointer bg-white text-secondary text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-outline-variant/30"
          >
            Reset
          </button>
        {/if}
      </div>
    {/if}

    <!-- Backdrop: dismiss drawer on tap -->
    {#if drawerSnap > SNAP_PEEK}
      <div
        class="absolute inset-0 z-10"
        role="button"
        tabindex="-1"
        aria-label="Close drawer"
        onclick={() => (drawerSnap = SNAP_PEEK)}
        onkeydown={(e) => e.key === "Escape" && (drawerSnap = SNAP_PEEK)}
      ></div>
    {/if}

    <!-- Bottom drawer -->
    <div
      class="absolute left-0 right-0 bottom-0 z-20 flex flex-col bg-white rounded-t-2xl shadow-[0_-4px_32px_rgba(0,0,0,0.12)]"
      style="height: {drawerHeight}; transition: {isDragging
        ? 'none'
        : 'height 0.3s cubic-bezier(0.32,0.72,0,1)'};"
    >
      <!-- Drag handle -->
      <div
        class="shrink-0 flex flex-col items-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
        role="separator"
        aria-label="Drag to resize"
        onpointerdown={onDrawerPointerDown}
        onpointermove={onDrawerPointerMove}
        onpointerup={onDrawerPointerUp}
        onpointercancel={onDrawerPointerUp}
      >
        <div class="w-10 h-1 rounded-full bg-outline-variant/50 mb-3"></div>
        <div class="flex items-center gap-3">
          {#if explore.isLoading}
            <p class="text-sm font-semibold text-on-surface">Loading...</p>
          {:else if explore.isSuccess}
            <p class="text-sm font-semibold text-on-surface">
              {explore.data.total} places found
            </p>
          {/if}
        </div>
      </div>

      <div class="w-full h-px bg-outline-variant/20 shrink-0"></div>

      <!-- Filter chips -->
      <div class="shrink-0 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {#each ALL_TYPES as type}
          <button
            onclick={() => toggleType(type)}
            class="cursor-pointer shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
              {activeTypes.includes(type)
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-on-surface border-outline-variant/40'}"
          >
            {type}
          </button>
        {/each}
      </div>

      <div class="w-full h-px bg-outline-variant/20 shrink-0"></div>

      <!-- Scrollable place list -->
      <div class="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        {#if explore.isLoading}
          <div class="flex items-center justify-center h-40">
            <Spinner />
          </div>
        {:else if explore.isSuccess}
          {#if explore.data.places.length === 0}
            <div
              class="flex flex-col items-center justify-center h-40 text-secondary gap-2"
            >
              <p class="font-medium">No places found</p>
              <p class="text-sm">Try removing some filters</p>
            </div>
          {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {#each explore.data.places as place}
                <div role="listitem">
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
              <div class="flex items-center justify-center gap-2 mt-6">
                <button
                  onclick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  class="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span class="text-sm text-secondary">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onclick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  class="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            {/if}
          {/if}
        {/if}
      </div>
    </div>

    <!-- Mobile bottom nav sits above the drawer -->
    <MobileBottomNav {user} />
  </div>
</ErrorBoundary>

<style>
  /* Strip Mapbox default popup chrome for our custom card popups */
  :global(.woofs-map-popup .mapboxgl-popup-content) {
    padding: 0;
    border-radius: 0.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    margin: 1rem 0;
  }
  :global(.woofs-map-popup .mapboxgl-popup-tip) {
    display: none;
  }
</style>
