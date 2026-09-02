<script lang="ts">
  import {
    buildImageUrl,
    buildResponsiveSrcSet,
    type ImageVariant,
  } from "@woofs/image-config";
  import { Skeleton } from "./ui/skeleton";

  interface Props {
    imageId: string;
    alt: string;
    variant?: ImageVariant;
    class?: string;
    loading?: "lazy" | "eager";
    fetchpriority?: "high" | "low" | "auto";
    sizes?: string;
    responsive?: boolean;
    width?: string;
    height?: string;
    showPlaceholder?: boolean;
  }

  let {
    imageId,
    alt,
    variant = "medium",
    class: className = "",
    loading = "lazy",
    fetchpriority = "auto",
    sizes = "100vw",
    responsive = true,
    width = "100%",
    height = "auto",
    showPlaceholder = false,
  }: Props = $props();

  const src = $derived(buildImageUrl(imageId, variant));
  const srcset = $derived(responsive ? buildResponsiveSrcSet(imageId) : undefined);

  let loaded = $state(false);
  let imgEl = $state<HTMLImageElement | null>(null);

  $effect(() => {
    src;
    loaded = false;
  });

  $effect(() => {
    if (imgEl?.complete && imgEl.naturalWidth > 0) {
      loaded = true;
    }
  });
</script>

<div class="relative {className}" style="width: {width}; height: {height};">
  {#if showPlaceholder && !loaded}
    <Skeleton class="absolute inset-0 h-full w-full" />
  {/if}
  <img
    bind:this={imgEl}
    {src}
    {srcset}
    {sizes}
    {alt}
    {loading}
    {fetchpriority}
    style="width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: {showPlaceholder &&
    !loaded
      ? 0
      : 1}; transition: opacity 200ms ease-out;"
    onload={() => (loaded = true)}
  />
</div>

<style>
  img {
    display: block;
    object-fit: cover;
    object-position: center;
  }
</style>
