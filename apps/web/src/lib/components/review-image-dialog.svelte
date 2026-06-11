<script lang="ts">
  import { Drawer } from "vaul-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import type { ReviewImage } from "@woofs/types"; // used in Props interface
  import OptimizedImage from "./optimized-image.svelte";
  import type { CarouselAPI } from "./ui/carousel/context";
  import { PawPrint, UserRound } from "@lucide/svelte";

  interface Props {
    image: ReviewImage | undefined;
    images: ReviewImage[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reviewUserName: string;
    dogs?: { dog: { id: string; name: string; breed: string } }[];
  }

  let { image, images, open, onOpenChange, reviewUserName, dogs = [] }: Props = $props();

  let isDesktop = $state<boolean>(false);
  let api = $state<CarouselAPI>();
  let current = $state<number>(0);

  $effect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    isDesktop = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  $effect(() => {
    if (api) {
      current = api.selectedScrollSnap() + 1;
      api.on("select", () => {
        current = api!.selectedScrollSnap() + 1;
      });
    }
  });
</script>

{#snippet imageContent()}
  <Carousel.Root class="w-full" setApi={(emblaApi) => (api = emblaApi)}>
    <Carousel.Content class="mt-5 lg:mt-0">
      {#each images as image, index}
        <Carousel.Item class="relative">
          <div class="flex items-center justify-center">
            <OptimizedImage
              imageId={image.imageId}
              alt={`review image ${index + 1} by ${reviewUserName}`}
              class="rounded-lg"
              width="600px"
              height="600px"
              variant="xlarge"
            />
          </div>
        </Carousel.Item>
      {/each}
    </Carousel.Content>
    {#if images.length > 1}
      <Carousel.Previous class="absolute left-4" />
      <Carousel.Next class="absolute right-4" />
    {/if}
  </Carousel.Root>
  <Carousel.Root
    opts={{
      align: "start",
      dragFree: true,
    }}
  >
    <Carousel.Content class="-ml-2 py-4">
      {#each images as image, index}
        <Carousel.Item class="basis-auto pl-2">
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
              alt={`review image ${index + 1} by ${reviewUserName}`}
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

  <!-- Reviewer + dogs info -->
  <div class="flex items-center gap-4 px-2 pb-4 text-sm">
    <div class="flex items-center gap-1.5 text-muted-foreground">
      <UserRound class="size-4 shrink-0" />
      <span class="font-medium text-foreground">{reviewUserName}</span>
    </div>
    {#if dogs.length > 0}
      <span class="text-muted-foreground">·</span>
      <div class="flex items-center gap-1.5 text-muted-foreground">
        <PawPrint class="size-4 shrink-0" />
        <span>
          {dogs.map((d) => d.dog.name + (d.dog.breed ? ` · ${d.dog.breed}` : "")).join(", ")}
        </span>
      </div>
    {/if}
  </div>
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
        <!-- Drag handle -->
        <div
          class="cursor-pointer mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
        ></div>
        {@render imageContent()}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
