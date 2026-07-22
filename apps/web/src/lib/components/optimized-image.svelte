<script lang="ts">
  import {
    buildImageUrl,
    buildResponsiveSrcSet,
    type ImageVariant,
  } from "@woofs/image-config";

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
  }: Props = $props();

  const src = $derived(buildImageUrl(imageId, variant));
  const srcset = $derived(responsive ? buildResponsiveSrcSet(imageId) : undefined);
</script>

<img
  {src}
  {srcset}
  {sizes}
  {alt}
  {loading}
  {fetchpriority}
  class={className}
  style="width: {width}; height: {height}; object-fit: cover; object-position: center;"
/>

<style>
  img {
    display: block;
    object-fit: cover;
    object-position: center;
  }
</style>
