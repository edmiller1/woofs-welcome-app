<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { api } from "$lib/api-helper";
  import Navbar from "$lib/components/navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser } from "@woofs/types";
  import {
    BedDouble,
    BedSingle,
    Beer,
    Coffee,
    DollarSign,
    Fish,
    Footprints,
    Hotel,
    House,
    Kayak,
    MapPin,
    Parasol,
    SportShoe,
    Stethoscope,
    TentTree,
    TreeDeciduous,
    Trees,
    Utensils,
    Waves,
    WavesHorizontal,
    Wine,
  } from "@lucide/svelte";

  interface Props {
    data: { user: BAUser | null };
  }

  const { data }: Props = $props();
  const { user } = $derived(data);

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const PLACE_TYPES = [
    { label: "Parks", slug: "Park", icon: Trees },
    { label: "Restaurants", slug: "Restaurant", icon: Utensils },
    { label: "Hotels", slug: "Hotel", icon: BedDouble },
    { label: "Motels", slug: "Motel", icon: BedSingle },
    { label: "AirBnbs", slug: "AirBnb", icon: House },
    { label: "Stores", slug: "Store", icon: DollarSign },
    { label: "Cafés", slug: "Café", icon: Coffee },
    { label: "Bars", slug: "Bar", icon: Beer },
    { label: "Dog Parks", slug: "Dog Park", icon: TreeDeciduous },
    { label: "Beaches", slug: "Beach", icon: WavesHorizontal },
    { label: "Walks", slug: "Walk", icon: Footprints },
    { label: "Hikes", slug: "Hike", icon: TentTree },
    { label: "Services", slug: "Service", icon: Stethoscope },
    { label: "Activities", slug: "Activity", icon: Parasol },
    { label: "Lakes", slug: "Lake", icon: Kayak },
    { label: "Rivers", slug: "River", icon: Fish },
    { label: "Trails", slug: "Trail", icon: SportShoe },
    { label: "Wineries", slug: "Winery", icon: Wine },
    { label: "Accommodation", slug: "Accomodation", icon: Hotel },
  ];

  type Tab = "countries" | "islands" | "regions" | "cities" | "place-types";

  const activeTab = $derived(
    (page.url.searchParams.get("tab") ?? "countries") as Tab,
  );
  const activeLetter = $derived(page.url.searchParams.get("letter") ?? "A");
  const activePage = $derived(Number(page.url.searchParams.get("page") ?? "1"));

  const typeForTab = $derived(
    activeTab === "countries"
      ? "country"
      : activeTab === "islands"
        ? "island"
        : activeTab === "regions"
          ? "region"
          : "city",
  ) as "country" | "island" | "region" | "city";

  const isPaginated = $derived(
    activeTab !== "countries" && activeTab !== "place-types",
  );

  const directory = createQuery(() => ({
    queryKey: ["directory", activeTab, activeLetter, activePage],
    queryFn: () =>
      api.location.getDirectory({
        type: typeForTab,
        letter: isPaginated ? activeLetter : undefined,
        page: activePage,
        limit: 150,
      }),
    enabled: activeTab !== "place-types",
  }));

  function setTab(tab: Tab) {
    const url = new URL(page.url);
    url.searchParams.set("tab", tab);
    url.searchParams.set("letter", "A");
    url.searchParams.delete("page");
    goto(url.toString(), { replaceState: true });
  }

  function setLetter(letter: string) {
    const url = new URL(page.url);
    url.searchParams.set("letter", letter);
    url.searchParams.delete("page");
    goto(url.toString(), { replaceState: true });
  }

  function setPage(p: number) {
    const url = new URL(page.url);
    url.searchParams.set("page", String(p));
    goto(url.toString(), { replaceState: true });
  }

  const totalPages = $derived(
    directory.data ? Math.ceil(directory.data.total / directory.data.limit) : 1,
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "countries", label: "Countries" },
    { id: "islands", label: "Islands" },
    { id: "regions", label: "Regions" },
    { id: "cities", label: "Cities" },
    { id: "place-types", label: "Place Types" },
  ];
</script>

<svelte:head>
  <title>Directory — Woofs Welcome</title>
  <meta
    name="description"
    content="Browse all dog-friendly destinations by country, region, city and place type."
  />
</svelte:head>

<Navbar {user} />

<main class="min-h-screen bg-muted">
  <!-- Header -->
  <div class="bg-card border-b border-border/10">
    <div class="max-w-7xl mx-auto px-8 py-12">
      <h1 class="font-serif text-5xl text-foreground mb-2">Directory</h1>
      <p class="text-muted-foreground">
        Browse all dog-friendly destinations and place types.
      </p>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-8">
      <div class="flex gap-0 border-b border-border/10">
        {#each tabs as tab}
          <button
            onclick={() => setTab(tab.id)}
            class="px-6 py-4 text-sm font-medium tracking-wide border-b-2 transition-colors cursor-pointer {activeTab ===
            tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'}"
          >
            {tab.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-8 py-12">
    <!-- Place Types tab -->
    {#if activeTab === "place-types"}
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        {#each PLACE_TYPES as type}
          <a
            href="/explore?types={encodeURIComponent(type.slug)}"
            class="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <type.icon class="size-4 text-primary shrink-0" />
            <span
              class="text-sm font-medium group-hover:text-primary transition-colors"
              >{type.label}</span
            >
          </a>
        {/each}
      </div>

      <!-- Countries tab (no letter filter, just sorted list) -->
    {:else if activeTab === "countries"}
      {#if directory.isLoading}
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3"
        >
          {#each Array(30) as _}
            <div class="h-5 bg-muted rounded animate-pulse"></div>
          {/each}
        </div>
      {:else if directory.isSuccess}
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3"
        >
          {#each directory.data.locations as loc}
            <a
              href="/location/{loc.path}"
              class="text-sm text-foreground hover:text-primary transition-colors py-1 border-b border-border/5"
            >
              {loc.name}
            </a>
          {/each}
        </div>
      {/if}

      <!-- Paginated + letter-filtered tabs -->
    {:else}
      <!-- Letter bar -->
      <div class="flex flex-wrap gap-1 mb-8">
        <span
          class="text-xs font-bold tracking-widest uppercase text-muted-foreground self-center mr-2"
          >Browse by</span
        >
        {#each LETTERS as letter}
          <button
            onclick={() => setLetter(letter)}
            class="w-8 h-8 rounded text-xs font-bold transition-colors cursor-pointer {activeLetter ===
            letter
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
          >
            {letter}
          </button>
        {/each}
      </div>

      {#if directory.isLoading}
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3"
        >
          {#each Array(30) as _}
            <div class="h-5 bg-muted rounded animate-pulse"></div>
          {/each}
        </div>
      {:else if directory.isSuccess && directory.data.locations.length > 0}
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3"
        >
          {#each directory.data.locations as loc}
            <a
              href="/location/{loc.path}"
              class="text-sm text-foreground hover:text-primary transition-colors py-1 border-b border-border/5"
            >
              {loc.name}{#if activeTab !== "regions"}<span
                  class="text-muted-foreground">, {loc.countryCode}</span
                >{/if}
            </a>
          {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="flex items-center justify-center gap-2 mt-12">
            <button
              onclick={() => setPage(activePage - 1)}
              disabled={activePage === 1}
              class="px-4 py-2 text-sm rounded-lg border border-border/20 disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer disabled:cursor-default"
            >
              Previous
            </button>
            <span class="text-sm text-muted-foreground px-4">
              Page {activePage} of {totalPages}
            </span>
            <button
              onclick={() => setPage(activePage + 1)}
              disabled={activePage === totalPages}
              class="px-4 py-2 text-sm rounded-lg border border-border/20 disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer disabled:cursor-default"
            >
              Next
            </button>
          </div>
        {/if}
      {:else if directory.isSuccess}
        <p class="text-muted-foreground text-sm">
          No {activeTab} found starting with "{activeLetter}".
        </p>
      {/if}
    {/if}
  </div>
</main>

<Footer />
