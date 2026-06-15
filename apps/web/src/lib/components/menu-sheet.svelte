<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import type { BAUser } from "@woofs/types";
  import { Button } from "./ui/button";
  import {
    Bookmark,
    Cog,
    Compass,
    LogIn,
    Smartphone,
    TextAlignJustify,
    Users,
  } from "@lucide/svelte";
  import { page } from "$app/state";
  import { settingsOpen } from "$lib/stores/accountSettingsStore";

  interface Props {
    user: BAUser | null;
  }

  const { user }: Props = $props();

  let menuOpen = $state(false);

  const exploreActive = $derived(page.url.pathname.includes("/explore"));
  const communityActive = $derived(page.url.pathname.includes("/community"));
  const profileActive = $derived(page.url.pathname.includes("/profile"));
  const collectionsActive = $derived(
    page.url.pathname.includes("/collections"),
  );
  const profileLink = $derived(
    user ? user.name.split(" ").join("-").toLowerCase() : "",
  );

  const openSettings = () => {
    menuOpen = false;
    settingsOpen.set(true);
  };
</script>

<Sheet.Root bind:open={menuOpen}>
  <Sheet.Trigger>
    <div class="flex items-center justify-end">
      <Button variant="ghost" size="icon" aria-label="Open menu">
        <TextAlignJustify class="size-5 shrink-0" />
      </Button>
    </div>
  </Sheet.Trigger>
  <Sheet.Content class="w-screen bg-white p-4">
    <h2 class="text-2xl font-headline font-bold text-primary-tint">
      Woofs Welcome
    </h2>
    {#if !user}
      <div class="rounded-2xl p-6 my-8 shadow-sm border border-input">
        <div class="flex flex-col gap-2">
          <h2 class="font-headline text-xl font-bold text-on-surface">
            Join the Pack
          </h2>
          <p class="font-body text-sm text-on-secondary-fixed-variant">
            Sign up to save collections and join our community of adventurers.
          </p>
          <a
            class="mt-2 font-body text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4"
            href="/sign-in">Create Account</a
          >
        </div>
      </div>
    {:else}
      <div
        class="border border-input flex items-center gap-4 p-6 rounded-xl shadow-sm"
      >
        <div class="relative">
          <img
            alt={user.name + " profile image"}
            src={user.image}
            class="w-16 h-16 rounded-full object-cover border-2 border-border"
          />
        </div>
        <div class="flex flex-col">
          <h2 class="text-2xl font-bold text-on-surface leading-tight">
            {user.name}
          </h2>
          <a
            class="text-label-md font-medium text-primary hover:underline decoration-primary underline-offset-4 transition-colors"
            href={`/profile/${user.id}/${profileLink}`}>View Profile</a
          >
        </div>
      </div>
    {/if}

    <div class="flex-1 flex flex-col space-y-1">
      <!-- Explore -->
      <a
        class="flex items-center gap-4 px-4 py-4 hover:bg-muted rounded-xl transition-all group {exploreActive &&
          'bg-secondary-container/30 '}"
        href="/explore"
      >
        {#if exploreActive}
          <div
            class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center"
          >
            <Compass class="size-5 text-secondary" />
          </div>
        {:else}
          <Compass class="size-5 text-black" />
        {/if}
        <span class="font-body text-lg font-medium">Explore</span>
      </a>
      <!-- Community -->
      <!-- <a
        class="flex items-center gap-4 px-4 py-4 hover:bg-muted rounded-xl transition-all group {communityActive &&
          'bg-secondary-container/30'}"
        href="/community"
      >
        {#if communityActive}
          <div
            class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center"
          >
            <Users class="size-5 text-secondary" />
          </div>
        {:else}
          <Users class="size-5 text-black" />
        {/if}
        <span class="font-body text-lg">Community</span>
      </a> -->
      {#if user}
        <!-- Collections -->
        <a
          class="flex items-center gap-4 px-4 py-4 hover:bg-muted rounded-xl transition-all group {profileActive &&
            'bg-secondary-container/30'}"
          href={`/profile/${user.id}/${profileLink}/collections`}
        >
          {#if collectionsActive}
            <div
              class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center"
            >
              <Bookmark class="size-5 text-secondary" />
            </div>
          {:else}
            <Bookmark class="size-5 text-black" />
          {/if}
          <span class="font-body text-lg">Collections</span>
        </a>
        <!-- Account Settings -->
        <button
          class="cursor-pointer flex items-center gap-4 px-4 py-4 hover:bg-muted rounded-xl transition-all group"
          onclick={openSettings}
        >
          <Cog class="size-5 text-black" />
          <span class="font-body text-lg">Account Settings</span>
        </button>
      {/if}
    </div>

    <div class="mt-auto flex flex-col items-center gap-6 pb-4">
      <button
        class="cursor-pointer hover:bg-orange-500/90 w-full bg-orange-500 text-white text-center py-3 rounded-full font-body text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20"
      >
        <Smartphone class="size-5 text-white" />
        Continue in App
      </button>
      {#if !user}
        <a
          role="button"
          href="/sign-in"
          class="w-full border border-input flex items-center justify-center gap-3 text-on-surface-variant text-center font-body py-4 rounded-xl font-medium hover:text-primary hover:bg-muted transition-colors cursor-pointer"
        >
          <LogIn class="size-5 text-primary" />
          Sign In
        </a>
      {/if}
      <div class="w-full pt-8 border-t border-surface-variant/30 text-center">
        <p class="font-display italic text-primary-tint font-semibold text-sm">
          "The world is better explored with your furry best friend."
        </p>
      </div>
    </div>
  </Sheet.Content>
</Sheet.Root>
