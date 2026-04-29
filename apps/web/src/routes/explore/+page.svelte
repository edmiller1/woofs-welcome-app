<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import {
    Coffee,
    Compass,
    Footprints,
    Hotel,
    MapPin,
    ShoppingBag,
    Sliders,
    SlidersHorizontal,
    Stethoscope,
    Trees,
    Utensils,
    Waves,
  } from "@lucide/svelte";
  import type { BAUser } from "@woofs/types";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Separator } from "$lib/components/ui/separator";
  import * as Select from "$lib/components/ui/select/index.js";

  interface Props {
    data: {
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { user } = $derived(data);

  const filterTypes = [
    { name: "All Places", href: "/explore", icon: Compass },
    { name: "Things to Do", href: "/explore?types=Activity", icon: MapPin },
    {
      name: "Accommodation",
      href: "/explore?types=AirBnb%2CHotel%2CMotel",
      icon: Hotel,
    },
    { name: "Retail", href: "/explore?types=Store", icon: ShoppingBag },
    { name: "Restaurants", href: "/explore?types=Restaurant", icon: Utensils },
    { name: "Cafés", href: "/explore?types=Café", icon: Coffee },
    { name: "Services", href: "/explore?types=Service", icon: Stethoscope },
    { name: "Parks", href: "/explore?types=Dog+Park%2CPark", icon: Trees },
    { name: "Beaches", href: "/explore?types=Beach", icon: Waves },
    {
      name: "Walks",
      href: "/explore?types=Hike%2CTrail%2CWalk",
      icon: Footprints,
    },
  ];

  const sortTypes = [
    { name: "Recommended", value: "recommended" },
    { name: "Highest Rated", value: "rating" },
    { name: "Most Reviewed", value: "reviews" },
  ];

  let sortValue = $state("recommended");

  // Derive the active filter name from the current URL
  const currentFilter = $derived(() => {
    const types = page.url.searchParams.get("types");
    console.log(types);
    if (!types) return "All Places";
    // Multiple types, find filter chip by first type in the list
    if (types.includes(",")) {
      const type = types.split(",")[0]; // Get the first type for display
      return filterTypes.find((f) => f.href.includes(type))?.name;
    }

    return (
      filterTypes.find((f) => f.href.includes(types))?.name ?? "All Places"
    );
  });

  // Derive the types param to use in your API call
  const activeTypes = $derived(page.url.searchParams.get("types"));

  $effect(() => {
    // Re-fetch places whenever activeTypes changes
    // e.g. fetchPlaces(activeTypes)
    console.log("types changed:", activeTypes);
  });

  const handleFilterTypeChange = (href: string) => {
    goto(href, { replaceState: true, noScroll: true });
  };

  const triggerContent = $derived(
    sortTypes.find((s) => s.value === sortValue)?.name ?? "Recommended",
  );
</script>

<Navbar {user} />
<!-- Content Area -->
<main class="flex flex-col h-[calc(100vh-76px)]">
  <!-- Filter & Header Section -->
  <section class="pt-6 pb-4 px-8 space-y-6">
    <div class="flex justify-between items-center">
      <!-- Category Chips -->
      <div
        class="flex items-center gap-3 overflow-x-auto hide-scrollbar whitespace-nowrap"
      >
        {#each filterTypes as type}
          {@const isActive = currentFilter() === type.name}
          <button
            onclick={() => handleFilterTypeChange(type.href)}
            class={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-body text-[13px] font-medium tracking-brand cursor-pointer whitespace-nowrap transition-colors
                  ${isActive ? "bg-primary text-white border-0" : "bg-transparent text-ink border border-border-strong hover:bg-surface-raised"}`}
          >
            <type.icon class="size-4" />
            {type.name}
          </button>
        {/each}
      </div>
      <div class="h-10 flex items-center gap-4">
        <Separator orientation="vertical" />
        <button
          class="flex items-center gap-2 px-3.5 py-2 bg-white border rounded-full font-body text-primary text-[13px] font-semibold tracking-brand cursor-pointer whitespace-nowrap hover:bg-surface-raised"
          ><SlidersHorizontal class="size-4" /> Filters</button
        >
      </div>
    </div>

    <!-- List Subheader -->
    <div class="flex justify-between items-end border-b pb-4">
      <div>
        <span
          class="font-label text-[10px] tracking-widest text-secondary font-bold uppercase"
          >Discover</span
        >
        <h2 class="font-display text-4xl">
          12 places <span class="italic font-light">near you</span>
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-body text-xs text-subtle">Sort by</span>
        <Select.Root type="single" name="sort" bind:value={sortValue}>
          <Select.Trigger class="rounded-full bg-white"
            >{triggerContent}</Select.Trigger
          >
          <Select.Content>
            {#each sortTypes as sort}
              <Select.Item value={sort.value}>{sort.name}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  </section>
</main>
