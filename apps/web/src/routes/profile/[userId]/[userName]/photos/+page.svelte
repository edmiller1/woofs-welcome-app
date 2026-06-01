<script lang="ts">
  import { api } from "$lib/api-helper";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import PhotoLightbox from "$lib/components/photo-lightbox.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { Image, Lock } from "@lucide/svelte";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import type { BAUser, ProfilePhotos } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      userId: string;
      userName: string;
      initialProfilePhotos: ProfilePhotos;
    };
  }

  const { data }: Props = $props();
  const { userId, initialProfilePhotos } = $derived(data);

  let sentinel = $state<HTMLDivElement>();

  const profilePhotos = createInfiniteQuery(() => ({
    queryKey: ["profilePhotos", userId],
    queryFn: ({ pageParam }) =>
      api.profile.getProfilePhotos(userId, 24, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: {
      pages: [initialProfilePhotos],
      pageParams: [undefined],
    },
  }));

  $effect(() => {
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          profilePhotos.hasNextPage &&
          !profilePhotos.isFetchingNextPage
        ) {
          profilePhotos.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  const allPhotos = $derived(
    profilePhotos.data?.pages.flatMap((page) => page.photos) ?? [],
  );
  const isPrivate = $derived(profilePhotos.data?.pages[0]?.isPrivate ?? false);

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  function openLightbox(index: number) {
    lightboxIndex = index;
    lightboxOpen = true;
  }
</script>

{#if profilePhotos.isLoading || profilePhotos.isFetchingNextPage}
  <div class="columns-2 md:columns-3 xl:columns-4 gap-4">
    {#each Array(12) as _}
      <Skeleton class="break-inside-avoid mb-4 rounded-3xl aspect-square" />
    {/each}
  </div>
{:else if isPrivate}
  <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
    <Lock class="size-12 text-muted-foreground" />
    <p class="font-medium">Photos are private</p>
    <p class="text-sm text-muted-foreground">This user hasn't made their photos public</p>
  </div>
{:else if allPhotos.length === 0}
  <div
    class="flex flex-col items-center justify-center py-16 gap-3 text-center"
  >
    <Image class="size-12 text-muted-foreground" />
    <p class="font-medium">No photos yet</p>
    <p class="text-sm text-muted-foreground">
      Photos from reviews will appear here
    </p>
  </div>
{:else}
  <div class="columns-2 md:columns-3 xl:columns-4 gap-4">
    {#each allPhotos as photo, index}
      <div
        class="break-inside-avoid mb-4 group relative overflow-hidden rounded-3xl cursor-pointer"
        role="button"
        tabindex="0"
        onclick={() => openLightbox(index)}
        onkeydown={(e) => e.key === "Enter" && openLightbox(index)}
      >
        <OptimizedImage
          class="w-full h-auto shadow-sm transition-transform duration-500 group-hover:scale-105"
          imageId={photo.cfImageId}
          alt={photo.reviewId}
        />
      </div>
    {/each}
  </div>

  {#if profilePhotos.isFetchingNextPage}
    <div class="columns-2 md:columns-3 xl:columns-4 gap-4 mt-4">
      {#each Array(4) as _}
        <Skeleton class="break-inside-avoid mb-4 rounded-3xl aspect-square" />
      {/each}
    </div>
  {/if}

  <div bind:this={sentinel} class="h-1"></div>
{/if}

<PhotoLightbox
  photos={allPhotos}
  startIndex={lightboxIndex}
  open={lightboxOpen}
  onOpenChange={(o) => (lightboxOpen = o)}
/>
