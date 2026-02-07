<script lang="ts">
  import { api } from "$lib/api-helper";
  import type { PlaceImage } from "@woofs/types";
  import OptimizedImage from "./optimized-image.svelte";
  import Button from "./ui/button/button.svelte";

  interface Props {
    images: PlaceImage[];
    openImageDrawer: () => void;
  }

  const { images, openImageDrawer }: Props = $props();
</script>

<div
  class="group/gallery my-5 grid h-139 grid-cols-3 grid-rows-2 gap-3 overflow-hidden rounded-lg group-hover/gallery:overflow-visible"
>
  <!-- Large main image - spans 2 columns and 2 rows  -->
  <div class="group relative col-span-2 row-span-2 cursor-pointer">
    {#if images[0]}
      <OptimizedImage
        imageId={images[0].imageId}
        alt={images[0].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
    {/if}
  </div>

  <!-- Top right image - explicitly spans 1 row -->
  {#if images[1]}
    <div class="group relative row-span-1 cursor-pointer">
      <OptimizedImage
        imageId={images[1].imageId}
        alt={images[1].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
    </div>
  {/if}

  <!-- Bottom right image with overlay button - explicitly spans 1 row -->
  {#if images[2]}
    <div class="group relative row-span-1 cursor-pointer">
      <OptimizedImage
        imageId={images[2].imageId}
        alt={images[2].caption || ""}
        class="h-full w-full object-cover transition duration-300 group-hover:brightness-90"
        width="100%"
        height="100%"
      />
      <div class="absolute bottom-4 right-4">
        <Button
          variant="secondary"
          class="rounded-lg bg-white/90 px-4 py-2 font-medium text-black shadow-lg backdrop-blur-sm hover:bg-white"
          onclick={openImageDrawer}
        >
          Show All Photos
          <span class="ml-2 text-sm">{images.length}</span>
        </Button>
      </div>
    </div>
  {/if}
</div>
