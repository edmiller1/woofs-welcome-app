<script lang="ts">
  import { page } from "$app/state";
  import SaveButton from "$lib/components/save-button.svelte";
  import ShareButton from "$lib/components/share-button.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { classNames } from "$lib/helpers";
  import { BadgeCheck } from "@lucide/svelte";
  import type { BAUser, Tab } from "@woofs/types";

  interface Props {
    placeName: string;
    user: BAUser | null;
    placeId: string;
    currentTab: string;
    tabs: Tab[];
    headerElement: HTMLElement | undefined;
    scrollY: number;
    showStickyHeader: boolean;
    isSaved: boolean;
    modalOpen?: boolean;
  }

  let {
    placeName,
    user,
    placeId,
    currentTab,
    tabs,
    headerElement,
    scrollY,
    showStickyHeader,
    isSaved,
    modalOpen = false,
  }: Props = $props();

  $effect(() => {
    if (headerElement && scrollY > 0) {
      const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
      showStickyHeader = scrollY > headerBottom;
    }
  });
</script>

<svelte:window bind:scrollY />

{#if showStickyHeader}
  <div
    class="sticky top-0 w-full border-b border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/95 {modalOpen
      ? 'z-0'
      : 'z-30'}"
  >
    <div class="mx-auto max-w-375 px-2 pt-3 sm:px-4 lg:px-8">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold sm:text-2xl">
            {placeName}
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <ShareButton url={page.url.href} name={placeName} />
          <SaveButton {user} {placeId} {isSaved} />
        </div>
      </div>
      <Separator />
      <div class="hidden sm:block">
        <nav aria-label="Tabs" class="flex space-x-8 font-semibold">
          {#each tabs as tab}
            <a
              href={tab.href}
              aria-current={currentTab === tab.name ? "page" : undefined}
              class={classNames(
                currentTab === tab.name
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "whitespace-nowrap border-b-2 px-1 py-4 text-sm",
              )}>{tab.name}</a
            >
          {/each}
        </nav>
      </div>
    </div>
  </div>
{/if}
