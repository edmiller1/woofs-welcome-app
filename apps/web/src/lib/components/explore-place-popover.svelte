<script lang="ts">
  import OptimizedImage from "./optimized-image.svelte";
  import { Star } from "@lucide/svelte";
  import type { ExplorePlaceItem } from "@woofs/types";

  interface Props {
    place: ExplorePlaceItem;
    onclose: () => void;
  }

  const { place, onclose }: Props = $props();
</script>

<a
  href={`/location/${place.locationPath}/places/${place.slug}`}
  target="_blank"
  class="flex items-center gap-3 w-72 bg-white rounded-2xl overflow-hidden shadow-lg p-2 cursor-pointer hover:shadow-xl transition-shadow"
>
  <div class="shrink-0 w-16 h-16 rounded-xl overflow-hidden">
    {#if place.imageId}
      <OptimizedImage
        imageId={place.imageId}
        alt={place.name}
        class="w-full h-full object-cover"
        variant="thumbnail"
        width="64"
        height="64"
      />
    {:else}
      <div class="w-full h-full bg-muted"></div>
    {/if}
  </div>
  <div class="flex flex-col gap-0.5 min-w-0">
    <span class="font-bold text-sm text-primary truncate">{place.name}</span>
    <span class="text-xs text-muted-foreground truncate"
      >{place.cityName}, {place.regionName || place.countryCode}</span
    >
    <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
      <div class="flex items-center gap-0.5">
        <Star class="size-3 fill-yellow-400 text-yellow-400" />
        <span class="font-semibold text-black"
          >{Number(place.rating).toFixed(1)}</span
        >
      </div>
      <span>·</span>
      <span>{place.types.join(" · ")}</span>
    </div>
  </div>
</a>
