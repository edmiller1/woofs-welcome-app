<script lang="ts">
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import type { BAUser } from "@woofs/types";
  import { Button } from "./ui/button";
  import {
    Bookmark,
    CircleQuestionMark,
    Cog,
    Compass,
    Heart,
    LogIn,
    Smartphone,
    TextAlignJustify,
    User,
  } from "@lucide/svelte";
  import { page } from "$app/state";
  import { settingsOpen } from "$lib/stores/accountSettingsStore";
  import { getUserInitials } from "$lib/helpers";

  interface Props {
    user: BAUser | null;
  }

  const { user }: Props = $props();

  let menuOpen = $state(false);

  const exploreActive = $derived(page.url.pathname.includes("/explore"));
  const aboutActive = $derived(page.url.pathname.includes("/about"));
  const contactActive = $derived(page.url.pathname.includes("/contact"));
  const communityActive = $derived(page.url.pathname.includes("/community"));
  const profileActive = $derived(page.url.pathname.includes("/profile"));
  const collectionsActive = $derived(
    page.url.pathname.includes("/collections"),
  );
  const supportActive = $derived(page.url.pathname.includes("/support"));
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
  <Sheet.Content class="w-screen bg-background p-4">
    <span class="mt-1 text-xl font-extrabold tracking-[-0.02em] text-primary"
      >Woofs Welcome</span
    >
    <div class="flex flex-col gap-5 px-5 py-5">
      {#if user}
        <div
          class="flex items-center gap-3.5 rounded-2xl bg-secondary px-4 py-3.5"
        >
          <span
            class="grid size-11.5 flex-none place-items-center rounded-full border-[1.5px] border-border bg-muted text-[15px] font-extrabold text-muted-foreground"
            >{getUserInitials(user.name)}</span
          >
          <div class="min-w-0">
            <div class="text-[15.5px] font-extrabold text-foreground">
              {user.name}
            </div>
            <div class="mt-0.5 truncate text-[12.5px] text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
      {/if}

      <nav class="py-6 flex flex-col gap-1">
        <a
          href="/explore"
          aria-current="page"
          class="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-extrabold text-secondary-foreground no-underline {exploreActive
            ? 'bg-secondary'
            : 'text-foreground hover:bg-muted'}"
          >Explore<svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            stroke-width="2.4"
            stroke-linecap="round"><path d="M9 6l6 6-6 6" /></svg
          ></a
        >
        <a
          href="/about"
          class="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-extrabold text-secondary-foreground no-underline {aboutActive
            ? 'bg-secondary'
            : 'text-foreground hover:bg-muted'}"
          >About<svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            stroke-width="2.4"
            stroke-linecap="round"><path d="M9 6l6 6-6 6" /></svg
          ></a
        >
        <a
          href="/contact"
          class="flex items-center justify-between rounded-xl px-4 py-4 text-[17px] font-extrabold text-secondary-foreground no-underline {contactActive
            ? 'bg-secondary'
            : 'text-foreground hover:bg-muted'}"
          >Contact<svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            stroke-width="2.4"
            stroke-linecap="round"><path d="M9 6l6 6-6 6" /></svg
          ></a
        >
      </nav>

      <!-- account -->
      {#if user}
        <div class="flex flex-col gap-0.5 border-t border-border pt-4">
          <div
            class="px-1 pb-2 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Your account
          </div>
          <a
            href={`/profile/${user.id}/${profileLink}`}
            class="flex items-center gap-3.5 rounded-xl px-3.5 py-3.5 text-[15.5px] font-semibold text-foreground no-underline hover:bg-muted {profileActive
              ? 'bg-muted py-1.75 px-3.5 rounded-full text-[#3f2d1d] font-extrabold'
              : 'text-foreground'}"
          >
            <User class="text-primary size-4" />
            Profile
          </a>
          <a
            href={`/profile/${user.id}/${profileLink}/collections`}
            class="flex items-center gap-3.5 rounded-xl px-3.5 py-3.5 text-[15.5px] font-semibold text-foreground no-underline hover:bg-muted {collectionsActive
              ? 'bg-muted py-1.75 px-3.5 rounded-full text-[#3f2d1d] font-extrabold'
              : 'text-foreground'}"
          >
            <Heart class="text-primary size-4" />
            Collections
            <!-- <span
                class="ml-auto rounded-full bg-secondary px-2.5 py-1 text-[11.5px] font-extrabold text-secondary-foreground"
                >12</span
              > -->
          </a>
          <button
            onclick={openSettings}
            class="flex items-center gap-3.5 rounded-xl px-3.5 py-3.5 text-[15.5px] font-semibold text-foreground no-underline hover:bg-muted"
          >
            <Cog class="text-primary size-4" />
            Settings
          </button>
          <a
            href={`/profile/${user.id}/${profileLink}/support`}
            class="flex items-center gap-3.5 rounded-xl px-3.5 py-3.5 text-[15.5px] font-semibold text-foreground no-underline hover:bg-muted {supportActive
              ? 'bg-muted py-1.75 px-3.5 rounded-full text-[#3f2d1d] font-extrabold'
              : 'text-foreground'}"
          >
            <CircleQuestionMark class="text-primary size-4" />
            Help &amp; support
          </a>
        </div>
      {/if}

      <div class="flex flex-col gap-3 border-t border-border pt-5">
        <a
          href="/sign-in"
          class="rounded-lg bg-primary px-5 py-4 text-center text-[15px] font-extrabold text-primary-foreground no-underline hover:brightness-95"
          >Sign In</a
        >
      </div>
    </div></Sheet.Content
  >
</Sheet.Root>
