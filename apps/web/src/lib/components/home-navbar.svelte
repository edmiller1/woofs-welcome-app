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
  import MenuSheet from "./menu-sheet.svelte";
  import NavbarSearch from "./navbar-search.svelte";

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
  class="fixed top-0 z-50 w-full bg-background border-none"
>
  <!-- Desktop layout -->
  <div class="hidden md:flex justify-between items-center w-full px-8 py-4">
    <div class="flex items-center gap-8">
      <a class="hidden lg:block text-2xl font-bold text-primary" href="/"
        >Woofs Welcome
      </a>
      <a href="/" class="lg:hidden text-2xl font-bold text-primary-tint">WW</a>
      <nav class="flex gap-6 items-center">
        <a
          class="font-body font-medium hover:text-primary hover:underline decoration-primary transition-colors {exploreActive
            ? 'text-primary-tint font-semibold'
            : 'text-muted-foreground'}"
          href="/explore">Explore</a
        >
        <!-- <a
          class="font-body font-medium hover:text-primary-tint transition-colors {communityActive
            ? 'text-primary-tint font-semibold'
            : 'text-muted-foreground'}"
          href="/community">Community</a
        > -->
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <NavbarSearch />
      {#if user}
        <NotificationsMenu />
        <CollectionsSheet {user} />
        <UserNav {user} />
      {:else}
        <a href={signInUrl}>
          <Button variant="default" class="ml-2">Sign In</Button>
        </a>
      {/if}
    </div>
  </div>

  <!-- Mobile layout: three equal columns -->
  <div
    class="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:hidden w-full px-4 py-3"
  >
    <div class="flex items-center">
      <a href="/" class="text-2xl font-headline font-bold text-primary">WW</a>
    </div>
    <div class="flex items-center">
      <NavbarSearch />
    </div>
    <div class="flex items-center justify-end gap-1">
      {#if user}
        <NotificationsMenu />
      {/if}
      <MenuSheet {user} />
    </div>
  </div>
  {#if !isExplorePageOrAccountPage}
    <div
      class="hidden lg:flex lg:space-x-4 lg:py-2 items-center w-full px-5 py-4 max-w-screen-2xl mx-auto"
    >
      {#each types as type}
        <a
          href={type.href}
          class="hover:bg-secondary hover:text-white flex cursor-pointer items-center gap-2 rounded-full px-3 py-1"
        >
          <type.icon class="size-4" />
          <span class=" text-sm font-medium">{type.name}</span>
        </a>
      {/each}
    </div>
  {/if}
</header>
