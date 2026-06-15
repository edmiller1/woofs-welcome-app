<script lang="ts">
  import { api } from "$lib/api-helper";
  import { buildImageUrl } from "@woofs/image-config";
  import type { SearchLocationResult, SearchPlaceResult } from "@woofs/types";
  import { createQuery } from "@tanstack/svelte-query";
  import { goto } from "$app/navigation";
  import { MapPin, Search, Clock, X, Star } from "@lucide/svelte";

  const STORAGE_KEY = "ww_recent_searches";
  const MAX_RECENT = 10;

  interface RecentSearch {
    id: string;
    label: string;
    sublabel: string;
    resultType: "place" | "location";
    href: string;
    imageId?: string | null;
    image?: string | null;
    timestamp: number;
  }

  let inputEl = $state<HTMLInputElement | null>(null);
  let wrapperEl = $state<HTMLDivElement | null>(null);
  let query = $state("");
  let focused = $state(false);
  let activeIndex = $state(-1);

  // Debounced query using a simple reactive pattern
  let debouncedValue = $state("");
  $effect(() => {
    const q = query;
    const timer = setTimeout(() => {
      debouncedValue = q;
    }, 200);
    return () => clearTimeout(timer);
  });

  const searchQuery = createQuery(() => ({
    queryKey: ["navbar-search", debouncedValue],
    queryFn: () => api.place.searchPlaces(debouncedValue),
    enabled: debouncedValue.trim().length >= 2,
    staleTime: 30_000,
  }));

  function loadRecent(): RecentSearch[] {
    if (typeof localStorage === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  function saveRecent(item: RecentSearch) {
    const existing = loadRecent().filter((r) => r.id !== item.id);
    const updated = [{ ...item, timestamp: Date.now() }, ...existing].slice(
      0,
      MAX_RECENT,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    recentSearches = updated;
  }

  function removeRecent(id: string) {
    const updated = loadRecent().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    recentSearches = updated;
  }

  let recentSearches = $state<RecentSearch[]>([]);

  $effect(() => {
    if (focused) recentSearches = loadRecent();
  });

  const trimmed = $derived(query.trim());
  const showDropdown = $derived(
    focused && (trimmed.length === 0 || trimmed.length >= 2),
  );
  const showRecent = $derived(
    focused && trimmed.length === 0 && recentSearches.length > 0,
  );
  const showResults = $derived(focused && trimmed.length >= 2);
  const showEmpty = $derived(
    focused && trimmed.length === 0 && recentSearches.length === 0,
  );

  const allResults = $derived<Array<SearchPlaceResult | SearchLocationResult>>(
    searchQuery.data
      ? [...searchQuery.data.places, ...searchQuery.data.locations]
      : [],
  );

  function placeHref(r: SearchPlaceResult) {
    return `/location/${r.locationPath}/places/${r.slug}`;
  }

  function locationHref(r: SearchLocationResult) {
    const lat = r.latitude ? Number(r.latitude).toFixed(5) : null;
    const lng = r.longitude ? Number(r.longitude).toFixed(5) : null;
    if (lat && lng) return `/explore?lat=${lat}&lng=${lng}&zoom=11.00`;
    return `/explore`;
  }

  function handleSelect(result: SearchPlaceResult | SearchLocationResult) {
    if (result.resultType === "place") {
      const href = placeHref(result);
      saveRecent({
        id: result.id,
        label: result.name,
        sublabel: result.locationName,
        resultType: "place",
        href,
        imageId: result.imageId,
        image: null,
        timestamp: Date.now(),
      });
      query = "";
      focused = false;
      goto(href);
      return;
    }

    const href = locationHref(result);
    saveRecent({
      id: result.id,
      label: result.name,
      sublabel: result.type,
      resultType: "location",
      href,
      imageId: null,
      image: result.image,
      timestamp: Date.now(),
    });

    query = "";
    focused = false;
    goto(href);
  }

  function handleRecentSelect(item: RecentSearch) {
    saveRecent(item);
    query = "";
    focused = false;
    goto(item.href);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!showDropdown) return;

    const items = showRecent ? recentSearches : allResults;
    const len = items.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = len > 0 ? (activeIndex + 1) % len : -1;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = len > 0 ? (activeIndex - 1 + len) % len : -1;
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < len) {
        if (showRecent) {
          handleRecentSelect(recentSearches[activeIndex]);
        } else {
          handleSelect(
            allResults[activeIndex] as SearchPlaceResult | SearchLocationResult,
          );
        }
      } else if (trimmed) {
        focused = false;
        query = "";
        goto(`/explore?q=${encodeURIComponent(trimmed)}`);
      }
    } else if (e.key === "Escape") {
      focused = false;
      inputEl?.blur();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (wrapperEl && !wrapperEl.contains(e.target as Node)) {
      focused = false;
    }
  }

  $effect(() => {
    if (focused) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  });

  $effect(() => {
    if (!focused) activeIndex = -1;
  });
</script>

<div bind:this={wrapperEl} class="relative w-full">
  <div
    class="flex items-center bg-input hover:border-primary hover:border rounded-full px-4 py-2 gap-2 transition-shadow {focused
      ? 'ring-1 ring-primary/20 shadow-md'
      : ''}"
  >
    <Search class="h-4 w-4 shrink-0 text-muted-foreground" />
    <input
      bind:this={inputEl}
      bind:value={query}
      onfocus={() => (focused = true)}
      onkeydown={handleKeydown}
      class="bg-input w-full lg:w-96 border-none focus:ring-0 text-sm font-body outline-none"
      placeholder="Search places or locations..."
      type="text"
      autocomplete="off"
    />
    {#if query}
      <button
        type="button"
        onclick={() => {
          query = "";
          inputEl?.focus();
        }}
        class="text-muted-foreground hover:text-on-surface transition-colors"
        aria-label="Clear search"
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>

  {#if showDropdown}
    <div
      class="absolute top-full mt-2 left-0 w-full min-w-72 lg:w-120 bg-white rounded-2xl shadow-xl border border-border/40 z-50 overflow-hidden"
    >
      {#if showRecent}
        <!-- Recent searches -->
        <div class="px-3 pt-3 pb-1">
          <p
            class="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1"
          >
            Recent Searches
          </p>
        </div>
        <ul class="pb-2">
          {#each recentSearches as item, i}
            <li>
              <div
                role="button"
                tabindex="0"
                class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer {activeIndex ===
                i
                  ? 'bg-muted/50'
                  : ''}"
                onclick={() => handleRecentSelect(item)}
                onkeydown={(e) => e.key === "Enter" && handleRecentSelect(item)}
                onmouseenter={() => (activeIndex = i)}
              >
                <div
                  class="size-9 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center"
                >
                  {#if item.imageId}
                    <img
                      src={buildImageUrl(item.imageId, "thumbnail")}
                      alt={item.label}
                      class="w-full h-full object-cover"
                    />
                  {:else if item.image}
                    <img
                      src={item.image}
                      alt={item.label}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <MapPin class="size-4 text-muted-foreground" />
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{item.label}</p>
                  <p class="text-xs text-muted-foreground capitalize truncate">
                    {item.sublabel}
                  </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <Clock class="size-3.5 text-muted-foreground/50" />
                  <button
                    type="button"
                    onclick={(e) => {
                      e.stopPropagation();
                      removeRecent(item.id);
                    }}
                    class="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    aria-label="Remove"
                  >
                    <X class="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else if showResults}
        <!-- Live search results -->
        {#if searchQuery.isLoading}
          <div class="flex items-center justify-center py-8 gap-1">
            {#each [0, 1, 2] as i}
              <span
                class="size-1.5 rounded-full bg-primary/50 animate-pulse"
                style="animation-delay: {i * 150}ms"
              ></span>
            {/each}
          </div>
        {:else if allResults.length === 0}
          <div class="py-8 text-center text-sm text-muted-foreground">
            No results for "<span class="font-medium">{query}</span>"
          </div>
        {:else}
          {#if searchQuery.data && searchQuery.data.places.length > 0}
            <div class="px-3 pt-3 pb-1">
              <p
                class="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1"
              >
                Places
              </p>
            </div>
            <ul>
              {#each searchQuery.data.places as place, i}
                <li>
                  <button
                    type="button"
                    class="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left {activeIndex ===
                    i
                      ? 'bg-muted/50'
                      : ''}"
                    onclick={() => handleSelect(place)}
                    onmouseenter={() => (activeIndex = i)}
                  >
                    <div
                      class="size-9 rounded-xl overflow-hidden shrink-0 bg-muted"
                    >
                      {#if place.imageId}
                        <img
                          src={buildImageUrl(place.imageId, "thumbnail")}
                          alt={place.name}
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <div
                          class="w-full h-full flex items-center justify-center"
                        >
                          <MapPin class="size-4 text-muted-foreground" />
                        </div>
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{place.name}</p>
                      <p class="text-xs text-muted-foreground truncate">
                        {place.locationName}
                      </p>
                    </div>
                    {#if place.rating && Number(place.rating) > 0}
                      <div class="flex items-center gap-1 shrink-0">
                        <Star class="size-3 fill-primary text-primary" />
                        <span class="text-xs font-semibold"
                          >{Number(place.rating).toFixed(1)}</span
                        >
                      </div>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          {/if}

          {#if searchQuery.data && searchQuery.data.locations.length > 0}
            {#if searchQuery.data.places.length > 0}
              <div class="mx-3 border-t border-border/30 my-1"></div>
            {/if}
            <div class="px-3 pt-2 pb-1">
              <p
                class="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1"
              >
                Locations
              </p>
            </div>
            <ul class="pb-2">
              {#each searchQuery.data.locations as loc, i}
                {@const idx = (searchQuery.data?.places.length ?? 0) + i}
                <li>
                  <button
                    type="button"
                    class="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left {activeIndex ===
                    idx
                      ? 'bg-muted/50'
                      : ''}"
                    onclick={() => handleSelect(loc)}
                    onmouseenter={() => (activeIndex = idx)}
                  >
                    <div
                      class="size-9 rounded-xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center"
                    >
                      {#if loc.image}
                        <img
                          src={buildImageUrl(loc.image, "thumbnail")}
                          alt={loc.name}
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <MapPin class="size-4 text-primary" />
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">{loc.name}</p>
                      <p
                        class="text-xs text-muted-foreground capitalize truncate"
                      >
                        {loc.type}
                      </p>
                    </div>
                    <span class="text-xs text-muted-foreground/60 shrink-0"
                      >Explore →</span
                    >
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      {:else if showEmpty}
        <div class="py-6 text-center text-sm text-muted-foreground">
          Search for a place or location
        </div>
      {/if}
    </div>
  {/if}
</div>
