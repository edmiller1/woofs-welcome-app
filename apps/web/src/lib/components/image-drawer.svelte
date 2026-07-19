<script lang="ts">
  import { Drawer } from "vaul-svelte";
  import type { PlaceImage } from "@woofs/types";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import type { CarouselAPI } from "$lib/components/ui/carousel/context.js";
  import OptimizedImage from "./optimized-image.svelte";

  interface Props {
    imagesOpen: boolean;
    images: PlaceImage[];
  }

  let { imagesOpen = $bindable(), images }: Props = $props();

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

<Drawer.Root open={imagesOpen} onOpenChange={(open) => (imagesOpen = open)}>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/40" />
    <Drawer.Content
      class="fixed bottom-0 left-0 right-0 z-99 mt-24 flex h-full flex-col rounded-t-[10px] bg-white"
    >
      <!-- Drag handle -->
      <div class="shrink-0 pt-3 pb-2 flex items-center justify-center">
        <div class="h-1.5 w-12 rounded-full bg-zinc-300"></div>
      </div>

      <!-- Counter -->
      <div class="shrink-0 text-center text-xs text-muted-foreground pb-2">
        {current + 1} / {count}
      </div>

      <!-- Main carousel — fills all available space -->
      <div class="flex-1 min-h-0">
        <Carousel.Root
          setApi={(emblaApi) => (mainApi = emblaApi)}
          class="h-full"
        >
          <Carousel.Content class="h-full">
            {#each images as image}
              <Carousel.Item class="h-full">
                <img
                  src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=960,q=85,fit=cover,f=webp`}
                  alt={image.caption || ""}
                  style="width: 100%; height: 100%; object-fit: cover; display: block;"
                  loading="eager"
                />
              </Carousel.Item>
            {/each}
          </Carousel.Content>
          <Carousel.Previous class="left-2" />
          <Carousel.Next class="right-2" />
        </Carousel.Root>
      </div>

      <!-- Thumbnail strip -->
      <div class="shrink-0 pb-8 pt-3">
        <Carousel.Root
          setApi={(emblaApi) => (thumbApi = emblaApi)}
          opts={{ align: "center", dragFree: true }}
          class="w-full"
        >
          <Carousel.Content class="-ml-2 mt-2">
            {#each images as image, index}
              <Carousel.Item class="basis-auto pl-2">
                <button
                  type="button"
                  onclick={() => scrollToIndex(index)}
                  class="w-16 h-12 shrink-0 overflow-hidden rounded-md transition-all {current ===
                  index
                    ? 'ring-2 ring-primary ring-offset-1'
                    : 'opacity-60 hover:opacity-90'}"
                >
                  <img
                    src={`https://imagedelivery.net/WGsCUST9DldetrA1NTPARQ/${image.imageId}/w=320,q=80,fit=cover,f=webp`}
                    alt={image.caption || ""}
                    style="width: 100%; height: 100%; object-fit: cover; display: block;"
                  />
                </button>
              </Carousel.Item>
            {/each}
          </Carousel.Content>
        </Carousel.Root>
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
