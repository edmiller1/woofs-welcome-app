<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";
  import type { PlaceImage } from "@woofs/types";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import type { CarouselAPI } from "$lib/components/ui/carousel/context.js";
  import { onMount } from "svelte";

  interface Props {
    imagesOpen: boolean;
    images: PlaceImage[];
  }

  let { imagesOpen = $bindable(), images }: Props = $props();

  let isDesktop = $state(false);

  onMount(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    isDesktop = mq.matches;
    mq.addEventListener("change", (e) => (isDesktop = e.matches));
  });

  let mainApi = $state<CarouselAPI>();
  let thumbApi = $state<CarouselAPI>();

  const count = $derived(mainApi ? mainApi.scrollSnapList().length : 0);
  let current = $state<number>(0);

  $effect(() => {
    if (mainApi) {
      current = mainApi.selectedScrollSnap();
      mainApi.on("select", () => {
        current = mainApi!.selectedScrollSnap();
        thumbApi?.scrollTo(current);
      });
    }
  });

  const scrollToIndex = (index: number) => {
    mainApi?.scrollTo(index);
  };
</script>

<!-- ===================== MOBILE: Fullscreen Gallery ===================== -->
{#if !isDesktop}
  <DialogPrimitive.Root
    open={imagesOpen}
    onOpenChange={(open) => (imagesOpen = open)}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-white" />
      <DialogPrimitive.Content
        class="fixed inset-0 z-50 flex flex-col bg-white outline-none"
      >
        <!-- Top bar -->
        <div class="shrink-0 flex items-center justify-between px-2 py-3">
          <button
            onclick={() => (imagesOpen = false)}
            class="cursor-pointer mt-1 flex items-center gap-1.5 text-black/80 hover:text-black transition-colors text-sm font-medium"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><line x1="18" y1="6" x2="6" y2="18" /><line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              /></svg
            >
            Close
          </button>
          <span class="text-black/60 text-sm">{current + 1} / {count}</span>
          <div class="w-16"></div>
        </div>

        <!-- Main carousel -->
        <div class="flex-1 min-h-0 overflow-hidden px-4 py-2">
          <Carousel.Root
            setApi={(emblaApi) => (mainApi = emblaApi)}
            class="h-full"
          >
            <Carousel.Content class="h-full">
              {#each images as image}
                <Carousel.Item
                  class="h-full flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=960,q=85,f=webp`}
                    alt={image.caption || ""}
                    loading="eager"
                    class="rounded-xl block"
                    style="max-width: 100%; max-height: calc(100vh - 160px); width: auto; height: auto; object-fit: contain;"
                  />
                </Carousel.Item>
              {/each}
            </Carousel.Content>
            <!-- User will just swipe to navigate -->
            <!-- <Carousel.Previous class="left-2" />
            <Carousel.Next class="right-2" /> -->
          </Carousel.Root>
        </div>

        <!-- Thumbnail strip -->
        <div class="shrink-0 py-3 overflow-x-auto">
          <div class="flex gap-2 w-max mx-auto px-4">
            {#each images as image, index}
              <button
                type="button"
                onclick={() => scrollToIndex(index)}
                class="cursor-pointer w-16 h-11 shrink-0 overflow-hidden rounded-md transition-all {current ===
                index
                  ? 'ring-2 ring-primary ring-offset-1'
                  : 'opacity-50 hover:opacity-80'}"
              >
                <img
                  src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=320,q=80,fit=cover,f=webp`}
                  alt={image.caption || ""}
                  style="width: 100%; height: 100%; object-fit: cover; display: block;"
                />
              </button>
            {/each}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
{:else}
  <!-- ===================== DESKTOP: Fullscreen Gallery ===================== -->
  <DialogPrimitive.Root
    open={imagesOpen}
    onOpenChange={(open) => (imagesOpen = open)}
  >
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay class="fixed inset-0 z-50 bg-black" />
      <DialogPrimitive.Content
        class="fixed inset-0 z-50 flex flex-col bg-white outline-none"
      >
        <!-- Top bar -->
        <div class="shrink-0 flex items-center justify-between px-6 py-4">
          <button
            onclick={() => (imagesOpen = false)}
            class="cursor-pointer flex items-center gap-2 text-black/80 hover:text-black transition-colors text-sm font-medium"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><line x1="18" y1="6" x2="6" y2="18" /><line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              /></svg
            >
            Close
          </button>
          <span class="text-black/60 text-sm">{current + 1} / {count}</span>
          <div class="w-16"></div>
        </div>

        <!-- Main image area -->
        <div class="flex-1 min-h-0 overflow-hidden px-20 py-6">
          <Carousel.Root
            setApi={(emblaApi) => (mainApi = emblaApi)}
            class="h-full"
          >
            <Carousel.Content class="h-full">
              {#each images as image}
                <Carousel.Item
                  class="h-full flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=1920,q=90,f=webp`}
                    alt={image.caption || ""}
                    loading="eager"
                    class="rounded-xl block"
                    style="max-width: 100%; max-height: calc(100vh - 170px); width: auto; height: auto; object-fit: contain;"
                  />
                </Carousel.Item>
              {/each}
            </Carousel.Content>
            <Carousel.Previous class="left-2" />
            <Carousel.Next class="right-2" />
          </Carousel.Root>
        </div>

        <!-- Thumbnail strip -->
        <div class="shrink-0 py-4">
          <div class="flex justify-center gap-2 flex-wrap px-8">
            {#each images as image, index}
              <button
                type="button"
                onclick={() => scrollToIndex(index)}
                class="cursor-pointer w-20 h-14 shrink-0 overflow-hidden rounded-md transition-all {current ===
                index
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-50 hover:opacity-80'}"
              >
                <img
                  src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=320,q=80,fit=cover,f=webp`}
                  alt={image.caption || ""}
                  style="width: 100%; height: 100%; object-fit: cover; display: block;"
                />
              </button>
            {/each}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
{/if}
