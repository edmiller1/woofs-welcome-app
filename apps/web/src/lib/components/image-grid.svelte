<script lang="ts">
  import { api } from "$lib/api-helper";
  import type { BAUser, PlaceImage } from "@woofs/types";
  import OptimizedImage from "./optimized-image.svelte";
  import Button from "./ui/button/button.svelte";
  import { Grip, Heart, Share } from "@lucide/svelte";
  import ShareButton from "./share-button.svelte";
  import { page } from "$app/state";
  import SaveButton from "./save-button.svelte";

  interface Props {
    images: PlaceImage[];
    openImageDrawer: () => void;
    placeName: string;
    placeCity: string;
    placeRegion: string;
    memberFavourite: boolean;
    user: BAUser | null;
    placeId: string;
    isSaved: boolean;
  }

  const {
    images,
    openImageDrawer,
    placeName,
    placeCity,
    placeRegion,
    memberFavourite,
    user,
    placeId,
    isSaved,
  }: Props = $props();
</script>

<section
  class="my-4 grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-125 md:h-162.5 mb-12"
>
  <div
    class="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-xl group"
  >
    {#if images[0]}
      <OptimizedImage
        imageId={images[0].imageId}
        alt={images[0].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"
      ></div>
      <div class="absolute bottom-6 left-6 text-white">
        {#if memberFavourite}
          <span
            class="bg-tertiary text-[#271900] px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block font-body"
            >MEMBER FAVORITE</span
          >
        {/if}
        <div class="flex items-center gap-3 mt-4 mb-2">
          <ShareButton url={page.url.href} name={placeName}>
            {#snippet trigger()}
              <Button variant="glass">
                <Share class="size-4" />
                <span class="font-headline font-semibold text-sm">Share</span>
              </Button>
            {/snippet}
          </ShareButton>
          <SaveButton {user} {placeId} {isSaved} />
        </div>
        <h1 class="text-4xl md:text-6xl font-headline font-bold">
          {placeName}
        </h1>
        <p class="font-body text-lg opacity-90">{placeCity}, {placeRegion}</p>
      </div>
    {/if}
  </div>
  {#if images[1]}
    <button
      class="appreance-none cursor-pointer hidden md:block md:col-span-2 overflow-hidden rounded-xl relative group"
    >
      <OptimizedImage
        imageId={images[1].imageId}
        alt={images[1].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
    </button>
  {/if}
  {#if images[2]}
    <button
      onclick={openImageDrawer}
      class="cursor-pointer appreance-none hidden md:block overflow-hidden rounded-xl relative group"
    >
      <OptimizedImage
        imageId={images[2].imageId}
        alt={images[2].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
    </button>
  {/if}
  {#if images[3] || images.length >= 4}
    <div class="hidden md:block overflow-hidden rounded-xl relative group">
      <div class="absolute bottom-4 right-4 z-10">
        <Button
          variant="secondary"
          class="rounded-lg bg-white/90 px-4 py-2 font-medium text-black shadow-lg backdrop-blur-sm hover:bg-white"
          onclick={openImageDrawer}
        >
          <Grip class="size-4" />
          View all photos
        </Button>
      </div>
      <OptimizedImage
        imageId={images[3].imageId}
        alt={images[3].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
    </div>
  {/if}
</section>
