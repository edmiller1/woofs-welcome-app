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
    srcsetVariants?: ImageVariant[];
    width?: string;
    height?: string;
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
    srcsetVariants = ["thumbnail", "card", "medium", "large", "full"],
    width = "100%",
    height = "auto",
  }: Props = $props();

  const src = $derived(buildImageUrl(imageId, variant, format));
  const srcset = $derived(
    responsive ? buildResponsiveSrcSet(imageId, srcsetVariants, format) : undefined,
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
  style="background-image: url({placeholder}); background-size: cover; width: {width}; height: {height};"
/>

  <style>
  img {
    display: block;
    object-fit: cover;
  }
</style>
