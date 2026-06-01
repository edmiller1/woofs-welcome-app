<script lang="ts">
  import { Drawer } from "vaul-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import type { ProfilePhoto } from "@woofs/types";
  import OptimizedImage from "./optimized-image.svelte";
  import type { CarouselAPI } from "./ui/carousel/context";

  interface Props {
    photos: ProfilePhoto[];
    startIndex: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { photos, startIndex, open, onOpenChange }: Props = $props();

  let isDesktop = $state(false);
  let api = $state<CarouselAPI>();
  let current = $state(0);

  $effect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    isDesktop = mq.matches;
    const handler = (e: MediaQueryListEvent) => (isDesktop = e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  });

  $effect(() => {
    if (api) {
      api.scrollTo(startIndex, true);
      current = api.selectedScrollSnap() + 1;
      api.on("select", () => {
        current = api!.selectedScrollSnap() + 1;
      });
    }
  });

  $effect(() => {
    if (open && api) {
      api.scrollTo(startIndex, true);
    }
  });
</script>

{#snippet imageContent()}
  <Carousel.Root class="w-full" setApi={(emblaApi) => (api = emblaApi)}>
    <Carousel.Content class="mt-5 lg:mt-0">
      {#each photos as photo, index}
        <Carousel.Item class="relative">
          <div class="flex items-center justify-center">
            <OptimizedImage
              imageId={photo.cfImageId}
              alt={`Photo ${index + 1}`}
              class="rounded-lg max-h-[70vh] w-auto object-contain"
              variant="xlarge"
            />
          </div>
        </Carousel.Item>
      {/each}
    </Carousel.Content>
    {#if photos.length > 1}
      <Carousel.Previous class="absolute left-4" />
      <Carousel.Next class="absolute right-4" />
    {/if}
  </Carousel.Root>
  {#if photos.length > 1}
    <Carousel.Root opts={{ align: "start", dragFree: true }}>
      <Carousel.Content class="-ml-2 py-4">
        {#each photos as photo, index}
          <Carousel.Item class="basis-auto pl-2">
            <button
              type="button"
              onclick={() => api?.scrollTo(index)}
              class="cursor-pointer w-20 h-16 shrink-0 overflow-hidden rounded-md transition-all {current === index + 1
                ? 'ring-2 ring-primary ring-offset-2'
                : 'opacity-60 hover:opacity-100'}"
            >
              <OptimizedImage
                imageId={photo.cfImageId}
                alt={`Photo ${index + 1}`}
                variant="thumbnail"
                width="100%"
                height="100%"
                class="w-full h-full object-cover object-center"
              />
            </button>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
    </Carousel.Root>
  {/if}
{/snippet}

{#if isDesktop}
  <Dialog.Root {open} onOpenChange={(o) => onOpenChange(o)}>
    <Dialog.Content class="z-99 w-full min-w-2xl">
      {@render imageContent()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root {open} onOpenChange={(o) => onOpenChange(o)}>
    <Drawer.Portal>
      <Drawer.Overlay class="fixed inset-0 bg-black/40" />
      <Drawer.Content
        class="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-xl bg-background"
      >
        <div class="cursor-pointer mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"></div>
        {@render imageContent()}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
