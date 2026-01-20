<script lang="ts">
  import { Search, Clock, X, LoaderCircle, Star } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { SearchHistoryItem } from "@woofs/types";
  import {
    addSearchHistory,
    clearSearchHistory,
    getSearchHistory,
    removeFromSearchHistory,
  } from "$lib/utils/search-history";
  import { api } from "$lib/api/index";

  interface PlaceSuggestion {
    name: string;
    slug: string;
  }

  //state
  let searchQuery = $state<string>("");
  let isOpen = $state<boolean>(false);
  let isLoading = $state<boolean>(false);
  let suggestions = $state<PlaceSuggestion[]>([]);
  let searchHistory = $state<SearchHistoryItem[]>([]);
  let selectedIndex = $state(-1);
  let searchInputRef: HTMLInputElement;
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Combined list of suggestions and history
  const allItems = $derived([
    ...searchHistory.map((h) => ({ type: "history" as const, data: h })),
    ...suggestions.map((s) => ({ type: "suggestion" as const, data: s })),
  ]);

  // Load search history on mount
  onMount(() => {
    searchHistory = getSearchHistory();
  });

  // Debounced search function
  // TODO: Implement actual API call when backend is ready
  async function performSearch(query: string) {
    if (query.length < 3) {
      suggestions = [];
      isLoading = false;
      return;
    }

    isLoading = true;

    try {
      // TODO: Replace with actual API call
      // const results = await api.place.searchPlaces(query, 10);
      console.log("Search query:", query);
      suggestions = [];
    } catch (error) {
      console.error("Search failed:", error);
      suggestions = [];
    } finally {
      isLoading = false;
    }
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    selectedIndex = -1;

    clearTimeout(debounceTimer);

    if (searchQuery.length === 0) {
      suggestions = [];
      isLoading = false;
      return;
    }

    if (searchQuery.length < 3) {
      suggestions = [];
      return;
    }

    // Set new timer for debounce (300ms)
    isLoading = true;
    debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
  }

  // Handle focus - open dropdown and load history
  function handleFocus() {
    isOpen = true;
    searchHistory = getSearchHistory();
  }

  // Handle blur - close dropdown (with delay for clicks)
  function handleBlur() {
    setTimeout(() => {
      isOpen = false;
      selectedIndex = -1;
    }, 200);
  }

  // Navigate to explore page with search query
  function navigateToSearch(query: string) {
    addSearchHistory(query);
    searchQuery = "";
    suggestions = [];
    isOpen = false;
    goto(`/explore?search=${encodeURIComponent(query)}`);
  }

  // Handle suggestion click
  function handleSuggestionClick(suggestion: PlaceSuggestion) {
    addSearchHistory(suggestion.name);
    searchQuery = "";
    suggestions = [];
    isOpen = false;
    goto(`/explore?place=${suggestion.slug}`);
  }

  // Handle history item click
  function handleHistoryItemClick(item: SearchHistoryItem) {
    searchQuery = item.query;
    searchInputRef.focus();
    performSearch(item.query);
  }

  // Remove history item
  function handleRemoveHistory(e: Event, query: string) {
    e.stopPropagation();
    removeFromSearchHistory(query);
    searchHistory = getSearchHistory();
  }

  // Clear all history
  function handleClearHistory() {
    clearSearchHistory();
    searchHistory = [];
  }

  // Handle keyboard navigation
  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, allItems.length - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1) {
          // Submit current query
          if (searchQuery.length >= 3) {
            navigateToSearch(searchQuery);
          }
        } else {
          // Select highlighted item
          const item = allItems[selectedIndex];
          if (item.type === "history") {
            handleHistoryItemClick(item.data);
          } else {
            handleSuggestionClick(item.data);
          }
        }
        break;
      case "Escape":
        isOpen = false;
        searchInputRef.blur();
        break;
    }
  }

  // Handle form submit
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (searchQuery.length >= 3) {
      navigateToSearch(searchQuery);
    }
  }
</script>

<div class="relative mx-8 hidden max-w-xl flex-1 lg:block">
  <form onsubmit={handleSubmit}>
    <div class="relative">
      <Search
        class="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
      />
      <input
        bind:this={searchInputRef}
        type="text"
        placeholder="Search dog-friendly places..."
        value={searchQuery}
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={handleKeydown}
        class="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2"
      />
      {#if isLoading}
        <LoaderCircle
          class="text-muted-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin"
        />
      {:else if searchQuery.length > 0}
        <button
          type="button"
          onclick={() => {
            searchQuery = "";
            suggestions = [];
            searchInputRef.focus();
          }}
          class="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
        >
          <X class="h-4 w-4" />
        </button>
      {/if}
    </div>
  </form>

  <!-- Dropdown -->
</div>
