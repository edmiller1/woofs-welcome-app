<script lang="ts">
  import {
    buildImageUrl,
    buildResponsiveSrcSet,
    getPlaceholderUrl,
    type ImageVariant,
    type ImageFormat,
  } from "@woofs/image-config";

  interface Props {
    imageId: string;
    alt: string;
    variant?: ImageVariant;
    format?: ImageFormat;
    class?: string;
    loading?: "lazy" | "eager";
    sizes?: string;
    responsive?: boolean;
  }

  let {
    imageId,
    alt,
    variant = "medium",
    format = "auto",
    class: className = "",
    loading = "lazy",
    sizes = "100vw",
    responsive = true,
  }: Props = $props();

  const src = $derived(buildImageUrl(imageId, variant, format));
  const srcset = $derived(
    responsive ? buildResponsiveSrcSet(imageId, undefined, format) : undefined,
  );
  const placeholder = $derived(getPlaceholderUrl(imageId));
</script>

<img
  {src}
  {srcset}
  {sizes}
  {alt}
  {loading}
  class={className}
  style="background-image: url({placeholder}); background-size: cover;"
/>

<style>
  img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
