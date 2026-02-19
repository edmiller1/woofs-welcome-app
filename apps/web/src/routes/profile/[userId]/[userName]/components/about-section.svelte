<script lang="ts">
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Calendar, Instagram, MapPin } from "@lucide/svelte";
  import type { Dog } from "@woofs/types";

  interface Props {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    x: string | null;
    currentCity: string | null;
    dogs: Dog[];
    createdAt: Date;
  }

  const {
    instagram,
    facebook,
    tiktok,
    x,
    dogs,
    currentCity,
    createdAt,
  }: Props = $props();
</script>

<section>
  <h2 class="text-2xl font-bold text-foreground">About</h2>
  <div class="mt-4 flex flex-col gap-3">
    {#if currentCity}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <MapPin class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span>{currentCity}</span>
      </div>
    {/if}
    {#if instagram}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span>{instagram}</span>
      </div>
    {/if}
    {#if facebook}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span>{facebook}</span>
      </div>
    {/if}
    {#if x}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span>{x}</span>
      </div>
    {/if}
    {#if tiktok}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span>{tiktok}</span>
      </div>
    {/if}
    <div class="flex items-center gap-3 text-sm text-foreground">
      <Calendar class="h-5 w-5 shrink-0 text-muted-foreground" />
      <span class="text-xs text-muted-foreground"
        >Joined {new Date(createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })}</span
      >
    </div>
  </div>
  {#if dogs && dogs.length > 0}
    <div>
      <h2 class="text-2xl font-bold text-foreground">Dogs</h2>
      <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each dogs as dog}
          <div class="flex flex-col items-center gap-2">
            <OptimizedImage
              imageId={dog.imageId}
              alt={dog.name}
              class="h-32 w-32 rounded-full object-cover object-center"
              variant="card"
            />
            <span class="text-sm text-foreground">{dog.name}</span>
            <span class="text-xs text-muted-foreground">{dog.breed}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>
