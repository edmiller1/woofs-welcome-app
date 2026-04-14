<script lang="ts">
  import type { PlaceImage } from "@woofs/types";
  import { cn } from "$lib/utils";
  import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Plus,
    Star,
    XIcon,
  } from "@lucide/svelte";
  import OptimizedImage from "./optimized-image.svelte";
  import { Badge } from "./ui/badge";
  import { Button } from "./ui/button";
  import { Popover } from "./ui/popover";
  import { Popover as PopoverPrimitive } from "bits-ui";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import { Spinner } from "./ui/spinner";

  type Popup = {
    id: string;
    images?: PlaceImage[];
    imageId?: string;
    locationPath: string;
    slug: string;
    isSaved: boolean;
    name: string;
    rating: string;
    cityName: string;
    regionName: string;
    countryCode: string;
    types: string[];
  };

  interface Props {
    activePlace: Popup;
    collectionId?: string;
    closePopup: () => void;
  }

  const { activePlace, collectionId, closePopup }: Props = $props();

  const queryClient = useQueryClient();

  let showRightArrow = $state<boolean>(false);
  let showLeftArrow = $state<boolean>(false);
  let currentIndex = $state<number>(0);
  let collectionPopoverOpen = $state(false);

  // Only fetch place collections when we don't have a specific collectionId
  const placeCollections = createQuery(() => ({
    queryKey: ["placeCollections", activePlace.id],
    queryFn: () => api.collection.getPlaceCollections(activePlace.id),
    enabled: !collectionId && collectionPopoverOpen,
  }));

  const removePlaceFromCollection = createMutation(() => ({
    mutationFn: ({ placeId, colId }: { placeId: string; colId: string }) =>
      api.collection.removePlaceFromCollection(placeId, colId),
    onSuccess: () => {
      toast.success("Place removed from collection!");
      queryClient.invalidateQueries({ queryKey: ["collectionWithPlaces"] });
      queryClient.invalidateQueries({
        queryKey: ["placeCollections", activePlace.id],
      });
    },
    onError: () => {
      toast.error("Failed to remove place from collection");
    },
  }));

  const addPlaceToCollection = createMutation(() => ({
    mutationFn: ({ placeId, colId }: { placeId: string; colId: string }) =>
      api.collection.addPlaceToCollection(placeId, colId),
    onSuccess: () => {
      toast.success("Place added to collection!");
      queryClient.invalidateQueries({
        queryKey: ["placeCollections", activePlace.id],
      });
    },
    onError: () => {
      toast.error("Failed to add place to collection");
    },
  }));

  const hasMultipleImages = $derived(
    activePlace.images && activePlace.images.length > 1,
  );

  const showArrows = () => {
    if (!activePlace.images || activePlace.images.length <= 1) return;

    if (currentIndex === 0) {
      showRightArrow = true;
      showLeftArrow = false;
    } else if (currentIndex === activePlace.images.length - 1) {
      showLeftArrow = true;
      showRightArrow = false;
    } else {
      showLeftArrow = true;
      showRightArrow = true;
    }
  };

  const hideArrows = () => {
    showLeftArrow = false;
    showRightArrow = false;
  };

  const nextImage = () => {
    if (activePlace.images && currentIndex < activePlace.images.length - 1) {
      currentIndex++;
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      currentIndex--;
    }
  };

  function toggleCollection(colId: string, hasPlace: boolean) {
    if (hasPlace) {
      removePlaceFromCollection.mutate({ placeId: activePlace.id, colId });
    } else {
      addPlaceToCollection.mutate({ placeId: activePlace.id, colId });
    }
  }
</script>

<div
  class="visible z-99 flex overflow-hidden rounded-t-sm sm:w-81.75 sm:flex-col"
>
  <div
    class="relative overflow-hidden"
    role="img"
    aria-label="Popup image"
    onmouseenter={showArrows}
    onmouseleave={hideArrows}
    onfocus={showArrows}
    onblur={hideArrows}
  >
    {#if activePlace.images && activePlace.images.length > 0}
      <!-- Multiple images: carousel -->
      <div
        class="flex transition-transform duration-500 ease-out"
        style="transform: translateX(-{currentIndex * 100}%)"
      >
        {#each activePlace.images as image}
          <OptimizedImage
            imageId={image.imageId}
            alt={image.caption || ""}
            class="h-52 w-full shrink-0 object-cover object-center"
            width="208"
            height="208"
            variant="card"
          />
        {/each}
      </div>
    {:else if activePlace.imageId}
      <!-- Single imageId fallback -->
      <OptimizedImage
        imageId={activePlace.imageId}
        alt={activePlace.name}
        class="h-52 w-full shrink-0 object-cover object-center"
        width="208"
        height="208"
        variant="card"
      />
    {:else}
      <div class="flex h-52 w-72 items-center justify-center bg-gray-200">
        <span class="text-gray-500">No images available</span>
      </div>
    {/if}

    <a
      href={`/location/${activePlace.locationPath}/places/${activePlace.slug}`}
      aria-label="View place details"
      target="_blank"
      class="rounded-t-lg"
    >
      <div
        class="absolute inset-0 z-10 flex cursor-pointer items-start justify-end"
      ></div>
    </a>

    <!-- Collection action button -->
    {#if collectionId}
      <!-- On a specific collection page: show remove button -->
      <Button
        variant="ghost"
        size="icon"
        class="absolute right-2 top-2 z-20 flex rounded-full hover:bg-muted"
        onclick={() =>
          removePlaceFromCollection.mutate({
            placeId: activePlace.id,
            colId: collectionId,
          })}
      >
        {#if removePlaceFromCollection.isPending}
          <Spinner class="size-5" />
        {:else}
          <Heart
            class={`size-6 ${activePlace.isSaved ? "fill-rose-500 text-rose-500" : ""}`}
          />
        {/if}
      </Button>
    {:else}
      <!-- Generic map context: show collection picker -->
      <PopoverPrimitive.Root bind:open={collectionPopoverOpen}>
        <PopoverPrimitive.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="icon"
              class="absolute right-2 top-2 z-20 flex rounded-full bg-white/80 hover:bg-white"
            >
              <Heart
                class={cn(
                  "size-6",
                  activePlace.isSaved
                    ? "fill-rose-500 text-rose-500"
                    : "text-gray-600",
                )}
              />
            </Button>
          {/snippet}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Content
          class="z-200 w-56 rounded-xl border bg-white p-2 shadow-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <p
            class="px-2 pb-1 pt-0.5 text-xs font-semibold text-muted-foreground"
          >
            Save to collection
          </p>
          {#if placeCollections.isLoading}
            <div class="flex items-center justify-center py-4">
              <Spinner class="size-4" />
            </div>
          {:else if placeCollections.data && placeCollections.data.length > 0}
            <ul class="space-y-0.5">
              {#each placeCollections.data as col}
                {@const isPending =
                  addPlaceToCollection.isPending ||
                  removePlaceFromCollection.isPending}
                <li>
                  <button
                    class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={isPending}
                    onclick={() => toggleCollection(col.id, col.hasPlace)}
                  >
                    <span class="text-base leading-none"
                      >{col.emoji ?? "📁"}</span
                    >
                    <span class="flex-1 truncate text-left font-medium"
                      >{col.name}</span
                    >
                    {#if col.hasPlace}
                      <Heart
                        class="size-3.5 shrink-0 fill-rose-500 text-rose-500"
                      />
                    {:else}
                      <Plus class="size-3.5 shrink-0 text-muted-foreground" />
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="px-2 py-3 text-xs text-muted-foreground">
              No collections yet.
            </p>
          {/if}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    {/if}

    <button
      onclick={closePopup}
      class="absolute left-2 top-2 z-20 flex cursor-pointer"
    >
      <XIcon
        class="rounded-full bg-white fill-white p-1 opacity-80 hover:opacity-100"
      />
    </button>

    {#if showLeftArrow}
      <div class="absolute left-2 top-[45%] z-20">
        <button
          onclick={prevImage}
          class="cursor-pointer rounded-full bg-white/80 p-1 text-gray-800 shadow transition-all hover:bg-white focus:outline-none"
          aria-label="Previous image"
        >
          <ChevronLeft class="size-4" />
        </button>
      </div>
    {/if}

    {#if showRightArrow}
      <div class="absolute right-2 top-[45%] z-20">
        <button
          onclick={nextImage}
          class="cursor-pointer rounded-full bg-white/80 p-1 text-gray-800 shadow transition-all hover:bg-white focus:outline-none"
          aria-label="Next image"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>
    {/if}

    {#if hasMultipleImages}
      <div class="absolute bottom-4 left-0 right-0 z-20">
        <div class="flex items-center justify-center gap-2">
          {#each activePlace.images! as _, index}
            <button
              onclick={() => (currentIndex = index)}
              class={cn(
                "size-2 cursor-pointer rounded-full bg-white transition-all",
                currentIndex === index ? "scale-125" : "opacity-50",
              )}
              aria-label={`Go to image ${index + 1}`}
            ></button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="rounded-b-xl bg-white px-2 pb-3 pt-2 text-black">
    <div class="flex items-center justify-between">
      <span class="truncate mt-1 text-sm font-bold">
        {activePlace.name}
      </span>
      <div class="mt-1 flex items-center space-x-1 text-sm">
        <Star class="size-3 fill-yellow-500 text-yellow-500" />
        <span class="text-black">{Number(activePlace.rating).toFixed(1)}</span>
      </div>
    </div>
    <span class="text-muted-foreground text-xs mb-1"
      >{activePlace.cityName}, {activePlace.regionName}
      {activePlace.countryCode}</span
    >
    <div class="flex items-center gap-2">
      {#each activePlace.types as type}
        <Badge variant="secondary">{type}</Badge>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(.custom-popup .maplibregl-popup-content) {
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.custom-popup .maplibregl-popup-tip) {
    border-top-color: white;
  }
</style>
