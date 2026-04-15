<script lang="ts">
  import type { BAUser } from "@woofs/types";
  import UserNav from "./user-nav.svelte";
  import {
    Bell,
    Bookmark,
    Coffee,
    Footprints,
    Hotel,
    Map,
    MapPin,
    Menu,
    Search,
    ShoppingBag,
    Stethoscope,
    Ticket,
    Trees,
    Utensils,
    Waves,
  } from "@lucide/svelte";
  import { page } from "$app/state";
  import { Button } from "./ui/button";
  import NotificationsMenu from "./notifications-menu.svelte";
  import CollectionsSheet from "./collections-sheet.svelte";

  interface Props {
    user: BAUser | null;
  }

  const { user }: Props = $props();

  const types = [
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
    { name: "Events", href: "/explore?types=Event", icon: Ticket },
  ];

  const signInUrl = $derived(
    `/sign-in?redirect=${encodeURIComponent(page.url.pathname + page.url.search)}`,
  );

  const isExplorePageOrAccountPage =
    page.url.pathname === "/" ||
    page.url.pathname.includes("/explore") ||
    page.url.pathname.includes("/business/dashboard") ||
    page.url.pathname.includes("/profile") ||
    page.url.pathname.includes("/community");

  const exploreActive = $derived(page.url.pathname.includes("/explore"));
  const communityActive = $derived(page.url.pathname.includes("/community"));
</script>

<header
  class="top-0 z-50 w-full bg-[#fcf9f5]/70 backdrop-blur-md border-b border-border-subtle/20"
>
  <div
    class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto"
  >
    <div class="flex items-center gap-8">
      <a class="text-2xl font-headline italic font-bold text-[#154212]" href="/"
        >Woofs Welcome</a
      >
      <nav class="hidden md:flex gap-6 items-center">
        <a
          class="font-body font-medium hover:text-[#154212] hover:border-b-2 hover:border-[#f8bd45] transition-colors {exploreActive
            ? 'text-[#154212] border-b-2 border-[#f8bd45]'
            : 'text-stone-600'}"
          href="/">Explore</a
        >
        <a
          class="font-body font-medium hover:text-[#154212] hover:border-b-2 hover:border-[#f8bd45] transition-colors {communityActive
            ? 'text-[#154212] border-b-2 border-[#f8bd45]'
            : 'text-stone-600'}"
          href="/community">Community</a
        >
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <div
        class="hidden lg:flex items-center bg-surface-raised rounded-full px-4 py-2 gap-2"
      >
        <Search class="h-4 w-4 shrink-0" />
        <input
          class="bg-transparent w-96 border-none focus:ring-0 text-sm font-body outline-none"
          placeholder="Search locations..."
          type="text"
        />
      </div>
      {#if user}
        <NotificationsMenu />
        <CollectionsSheet />
        <UserNav {user} />
      {:else}
        <a href={signInUrl}>
          <Button variant="default" class="ml-2">Sign In</Button>
        </a>
      {/if}
    </div>
  </div>
  {#if !isExplorePageOrAccountPage}
    <div
      class="hidden lg:flex lg:space-x-4 lg:py-2 items-center w-full px-5 py-4 max-w-screen-2xl mx-auto"
    >
      {#each types as type}
        <a
          href={type.href}
          class="hover:bg-secondary hover:text-foreground flex cursor-pointer items-center gap-2 rounded-full px-3 py-1"
        >
          <type.icon class="size-4" />
          <span class=" text-sm font-medium">{type.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</header>
