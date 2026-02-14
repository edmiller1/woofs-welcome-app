<script lang="ts">
  import ImageScroll from "$lib/components/image-scroll.svelte";
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

  let api = $state<CarouselAPI>();

  const count = $derived(api ? api.scrollSnapList().length : 0);
  let current = $state<number>(0);

  $effect(() => {
    if (api) {
      current = api.selectedScrollSnap() + 1;
      api.on("select", () => {
        current = api!.selectedScrollSnap() + 1;
      });
    }
  });
</script>

<Drawer.Root open={imagesOpen} onOpenChange={(open) => (imagesOpen = open)}>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 bg-black/40" />
    <Drawer.Content
      class="fixed bottom-0 left-0 right-0 z-99 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-zinc-100"
    >
      <div class="flex min-h-screen flex-col rounded-t-[10px] bg-white">
        <div class="shrink-0 p-4">
          <div
            class="mx-auto h-1.5 w-12 cursor-pointer rounded-full bg-zinc-300"
          ></div>
        </div>

        <!-- Carousel -->
        <div class="flex-1 flex flex-col px-16 overflow-y-auto">
          <Carousel.Root setApi={(emblaApi) => (api = emblaApi)} class="mb-10">
            <Carousel.Content class="h-full">
              {#each images as image}
                <Carousel.Item class="flex items-center justify-center">
                  <OptimizedImage
                    imageId={image.imageId}
                    alt={image.caption || ""}
                    class="w-full max-h-[75vh] rounded-lg object-contain"
                    variant="full"
                    responsive={false}
                    width="auto"
                    height="600px"
                    loading="eager"
                  />
                </Carousel.Item>
              {/each}
            </Carousel.Content>
            <Carousel.Previous />
            <Carousel.Next />
          </Carousel.Root>
          <Carousel.Root
            class="w-full flex justify-center"
            opts={{
              align: "center",
              dragFree: true,
            }}
          >
            <Carousel.Content class="-ml-2">
              {#each images as image, index}
                <Carousel.Item class="basis-auto ml-2 py-2">
                  <button
                    type="button"
                    onclick={() => api?.scrollTo(index)}
                    class="cursor-pointer w-28 h-20 shrink-0 overflow-hidden rounded-md transition-all {current ===
                    index + 1
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'opacity-70 hover:opacity-100'}"
                  >
                    <OptimizedImage
                      imageId={image.imageId}
                      alt={image.caption || ""}
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
        </div>
      </div>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
