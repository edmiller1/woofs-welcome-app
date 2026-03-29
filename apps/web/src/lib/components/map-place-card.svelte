<script lang="ts">
  import OptimizedImage from "./optimized-image.svelte";
  import { Heart, Star, X, XIcon } from "@lucide/svelte";
  import type { LocationPlace } from "@woofs/types";
  import { Badge } from "./ui/badge";

  interface Props {
    place: LocationPlace;
    onclose: () => void;
  }

  const { place, onclose }: Props = $props();
</script>

<div
  class="visible z-99 flex overflow-hidden rounded-t-sm sm:w-81.75 sm:flex-col"
>
  <div class="relative overflow-hidden" role="img" aria-label="Popup image">
    <div class="flex transition-transform duration-500 ease-out">
      <OptimizedImage
        imageId={place.imageId}
        alt={place.name || ""}
        class="h-52 w-full shrink-0 object-cover object-center"
        width="208"
        height="208"
        variant="card"
      />
    </div>

    <a
      href={`/location/${place.locationPath}/places/${place.slug}`}
      aria-label="View place details"
      target="_blank"
      class="rounded-t-lg"
    >
      <div
        class="absolute inset-0 z-10 flex cursor-pointer items-start justify-end p-2"
      ></div>
    </a>

    {#if place.isSaved}
      <div class="absolute right-2 top-2 z-10 flex">
        <Heart class="size-6 fill-rose-500 text-rose-500" />
      </div>
    {/if}

    <button
      onclick={onclose}
      class="absolute left-2 top-2 z-10 flex cursor-pointer"
    >
      <XIcon
        class="rounded-full bg-white fill-white p-1 opacity-80 hover:opacity-100"
      />
    </button>
  </div>

  <div class="rounded-b-xl bg-white px-2 pb-3 pt-2 text-black">
    <div class="flex items-center justify-between pb-2">
      <span class="mt-1 text-[1.01rem] font-bold text-primary">
        {place.name}
      </span>
      <div class="mt-1 flex items-center space-x-1 text-[1.01rem]">
        <Star class="size-4 fill-yellow-500 text-yellow-500" />
        <span class="text-black text-sm">{Number(place.rating).toFixed(1)}</span
        >
      </div>
    </div>
    <div class="flex items-center gap-1">
      {#each place.types as type}
        <Badge variant="secondary" class="rounded-full">{type}</Badge>
      {/each}
    </div>
  </div>
</div>
