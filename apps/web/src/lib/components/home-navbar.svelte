<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { slide } from "svelte/transition";
  import type { BAUser } from "@woofs/types";
  import UserNav from "./user-nav.svelte";
  import { Bell, Bookmark, Search } from "@lucide/svelte";

  interface Props {
    user: BAUser | null;
  }

  const { user }: Props = $props();

  let mobileMenuOpen = $state<boolean>(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    // Prevent body scroll when menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
</script>

<header
  class="fixed top-0 z-50 w-full bg-[#fcf9f5]/70 backdrop-blur-md dark:bg-stone-900/70 border-none"
>
  <div
    class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto"
  >
    <div class="flex items-center gap-8">
      <a
        class="text-2xl font-serif italic font-bold text-[#154212] dark:text-emerald-500"
        href="/">Woofs Welcome</a
      >
      <nav class="hidden md:flex items-center gap-6">
        <a
          class="text-stone-600 dark:text-stone-400 hover:text-primary hover:border-b-2 hover:border-[#f8bd45] transition-colors font-medium"
          href="/">Browse Destinations</a
        >
        <a
          class="text-stone-600 dark:text-stone-400 hover:text-primary hover:border-b-2 hover:border-[#f8bd45] transition-colors font-medium"
          href="/">Community</a
        >
      </nav>
    </div>
    <div class="flex items-center gap-4">
      <div
        class="hidden lg:flex items-center bg-surface-container-high rounded-full px-4 py-2 gap-2"
      >
        <Search class="h-4 w-4" />
        <input
          class="bg-transparent border-none focus:ring-0 text-sm w-48 font-medium outline-none"
          placeholder="Search destinations..."
          type="text"
        />
      </div>
      {#if user}
        <button
          class="cursor-pointer p-2 text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
        >
          <Bell />
        </button>
        <button
          class="cursor-pointer p-2 text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
        >
          <Bookmark />
        </button>
        <UserNav {user} />
      {/if}
    </div>
  </div>
</header>
