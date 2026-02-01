<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { BadgeCheck, Heart, LoaderCircle, Star } from "@lucide/svelte";
  import type { CarouselAPI } from "$lib/components/ui/carousel/context";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { page } from "$app/state";
  import type { BAUser } from "@woofs/types";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { place } from "../../../../../packages/api/src/api/place";
  import OptimizedImage from "./optimized-image.svelte";

  interface Props {
    id: string;
    name: string;
    rating: string;
    slug: string;
    cityName: string;
    regionName: string;
    types: string[];
    isSaved: boolean;
    imageId?: string;
    imageIds?: string[];
    user: BAUser | null;
    locationPath: string;
    isVerified: boolean;
  }

  const {
    id,
    name,
    rating,
    slug,
    cityName,
    regionName,
    types,
    isSaved,
    imageId,
    imageIds,
    user,
    locationPath,
    isVerified,
  }: Props = $props();

  const images = $derived(imageIds ?? (imageId ? [imageId] : []));

  //Carousel
  let carouselApi = $state<CarouselAPI>();
  let current = $state<number>(0);

  $effect(() => {
    if (carouselApi) {
      current = carouselApi.scrollSnapList().length;
      carouselApi.on("select", () => {
        current = carouselApi!.selectedScrollSnap();
      });
    }
  });

  const handleFavouritePlace = (e: Event) => {
    if (!user) {
      toast.info("Please sign in to favourite places", {
        action: {
          label: "Sign in",
          onClick: () => {
            goto("/sign-in?redirect=" + encodeURIComponent(page.url.pathname));
          },
        },
        duration: 10000,
      });
    }
  };

  const goToImage = (index: number) => {
    carouselApi!.scrollTo(index);
    current = index;
  };
</script>

<a
  href={`/location/${locationPath}/places/${slug}`}
  class="m-0 flex w-full justify-center p-0"
>
  <div
    class="m-0 flex h-full max-w-sm cursor-pointer flex-col overflow-hidden p-0"
  >
    <div class="relative w-full overflow-hidden rounded-lg">
      {#if images.length > 1}
        <Carousel.Root
          setApi={(emblaApi) => (carouselApi = emblaApi)}
          class="rounded-xl"
        >
          <div class="group relative cursor-pointer">
            <Carousel.Content class="basis-70 md:basis-[320px]">
              {#each images as image}
                <Carousel.Item class="pl-3">
                  <div
                    class="relative aspect-4/3 transition-transform duration-200 group-hover:scale-105"
                  >
                    <OptimizedImage
                      imageId={image}
                      alt={name}
                      class="h-full w-full object-cover"
                      variant="card"
                    />
                  </div>
                </Carousel.Item>
              {/each}
            </Carousel.Content>
            <!-- Indicators -->
            <div
              class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2"
            >
              {#each images as _, index}
                {@const isActive = current === index}
                <button
                  class="size-2 cursor-pointer rounded-full bg-white {isActive
                    ? 'opacity-100'
                    : 'opacity-60'}"
                  onclick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  aria-label="image-indicator"
                ></button>
              {/each}
            </div>
          </div>
        </Carousel.Root>
        <!-- Heart Button -->
        <div class="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            class="rounded-full bg-white/80 hover:bg-white"
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFavouritePlace(e);
            }}
          >
            <Heart
              class={`size-6 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </Button>
        </div>
        <div class="space-y-3 py-2">
          <div class="m-0 flex items-center justify-between">
            <h3 class="truncate font-medium">{name}</h3>
            <div class="flex items-center gap-1">
              <Star class="size-3" fill="#000000" />
              <span class="text-sm">{Number(rating).toFixed(1)}</span>
            </div>
          </div>
          <div class="text-muted-foreground m-0 text-sm">
            {cityName}, {regionName}
          </div>
          <div class="mt-1 flex items-center gap-1">
            {#each types.sort((a, b) => a.localeCompare(b)) as type}
              <Badge class="rounded-full">{type}</Badge>
            {/each}
          </div>
        </div>
      {:else if images.length === 1}
        <div class="group basis-70 md:basis-[320px]">
          <div class="relative aspect-4/3">
            <OptimizedImage
              imageId={images[0]}
              alt={name}
              class="h-full w-full rounded-lg object-cover"
              variant="card"
            />
            <!-- Heart Button -->
            <div class="absolute right-2 top-2 z-10">
              <Button
                variant="ghost"
                size="icon"
                class="rounded-full bg-white/80 hover:bg-white"
                onclick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavouritePlace(e);
                }}
              >
                <Heart
                  class={`size-6 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`}
                />
              </Button>
            </div>
          </div>
          <div class="space-y-3 py-2">
            <div class="m-0 flex items-center justify-between">
              <div class="flex items-center gap-1">
                <h3 class="truncate font-medium">{name}</h3>
                {#if isVerified}
                  <BadgeCheck class="fill-primary size-4" />
                {/if}
              </div>
              <div class="flex items-center gap-1">
                <Star class="size-3 fill-yellow-500 text-yellow-500" />
                <span class="text-sm">{Number(rating).toFixed(1)}</span>
              </div>
            </div>
            <div class="text-muted-foreground m-0 text-left text-sm">
              {cityName}, {regionName}
            </div>
            <div class="mt-1 flex items-center gap-1">
              {#each types.sort((a, b) => a.localeCompare(b)) as type}
                <Badge class="rounded-full">{type}</Badge>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</a>
