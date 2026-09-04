<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import LocationMap from "$lib/components/location-map.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, LocationWithDetails, PlaceFilter } from "@woofs/types";
  import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Footprints,
    Map as MapIcon,
    MapPin,
    Minus,
    PawPrint,
    Plus,
    Star,
    Utensils,
  } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import "@aejkatappaja/phantom-ui";
  import { buildImageUrl, buildResponsiveSrcSet } from "@woofs/image-config";

  interface Props {
    data: {
      pathname: string;
      user: BAUser | null;
      initialLocation: LocationWithDetails;
    };
  }

  const { data }: Props = $props();
  const { pathname, user, initialLocation } = $derived(data);

  let communityPhotosOpen = $state<boolean>(false);
  let activeGalleryIndex = $state(0);

  function openGalleryAt(index: number) {
    activeGalleryIndex = index;
    communityPhotosOpen = true;
  }

  function selectGalleryPhoto(index: number) {
    activeGalleryIndex = index;
  }

  function nextGalleryPhoto(photoCount: number) {
    activeGalleryIndex = (activeGalleryIndex + 1) % photoCount;
  }

  function prevGalleryPhoto(photoCount: number) {
    activeGalleryIndex = (activeGalleryIndex - 1 + photoCount) % photoCount;
  }

  $effect(() => {
    document.body.style.overflow = communityPhotosOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  const location = createQuery(() => ({
    queryKey: ["location", pathname],
    queryFn: () => api.location.getLocation(pathname.toString()),
    initialData: initialLocation,
  }));

  const currentPlaceFilter = $derived(
    (page.url.searchParams.get("placeSort") as PlaceFilter) ?? "popular",
  );
  const currentEventFilter = $derived(
    page.url.searchParams.get("eventSort") ?? "new",
  );

  const locationPlaces = $derived(
    createQuery(() => ({
      queryKey: ["locationPlaces", pathname, currentPlaceFilter],
      queryFn: () =>
        api.location.getLocationPlaces(pathname.toString(), {
          placeSort: currentPlaceFilter,
        }),
    })),
  );

  const locationArticle = $derived(
    ["island"].includes(location.data?.type ?? "") ? "the " : "",
  );

  const zoom = $derived(
    location.data?.type === "country"
      ? 6
      : location.data?.type === "region"
        ? 8
        : location.data?.type === "city"
          ? 12
          : 8,
  );

  // Locations carousel
  let carouselEl = $state<HTMLDivElement | null>(null);
  let carouselHovered = $state(false);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(true);

  const CARD_WIDTH = 350 + 32; // w-87.5 (350px) + gap-8 (32px)

  function updateScrollState() {
    if (!carouselEl) return;
    canScrollLeft = carouselEl.scrollLeft > 0;
    canScrollRight =
      carouselEl.scrollLeft + carouselEl.clientWidth <
      carouselEl.scrollWidth - 1;
  }

  function scrollLeft() {
    carouselEl?.scrollBy({ left: -CARD_WIDTH, behavior: "smooth" });
  }

  function scrollRight() {
    carouselEl?.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
  }

  const isCity = $derived(location.data?.type === "city");

  const childLocations = $derived(
    createQuery(() => ({
      queryKey: ["childLocations", pathname],
      queryFn: () => api.location.getChildLocations(pathname.toString(), 2),
      enabled: !isCity,
    })),
  );

  const nearbyLocations = $derived(
    createQuery(() => ({
      queryKey: ["nearbyLocations", pathname],
      queryFn: () => api.location.getNearbyLocations(pathname.toString()),
      enabled: isCity,
    })),
  );

  const communityPhotos = $derived(
    createQuery(() => ({
      queryKey: ["locationPhotos", pathname, 1],
      queryFn: () => api.location.getLocationPhotos(pathname.toString(), 1, 20),
    })),
  );
</script>

<svelte:head>
  <title>{initialLocation.name} — Dog-Friendly Places | Woofs Welcome</title>
  <meta
    name="description"
    content="Discover dog-friendly places in {initialLocation.name}, New Zealand. Find cafes, restaurants, accommodation, walks and more that welcome your dog."
  />
  <meta
    property="og:title"
    content="{initialLocation.name} — Dog-Friendly Places | Woofs Welcome"
  />
  <meta
    property="og:description"
    content="Discover dog-friendly places in {initialLocation.name}, New Zealand. Find cafes, restaurants, accommodation, walks and more that welcome your dog."
  />
  {#if initialLocation.image}
    <meta
      property="og:image"
      content={buildImageUrl(initialLocation.image, "xlarge")}
    />
  {/if}
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://woofswelcome.app/{initialLocation.path}"
  />
  <link
    rel="canonical"
    href="https://woofswelcome.app/{initialLocation.path}"
  />
  {#if initialLocation.image}
    <link
      rel="preload"
      as="image"
      href={buildImageUrl(initialLocation.image, "xlarge")}
      imagesrcset={buildResponsiveSrcSet(initialLocation.image)}
      imagesizes="100vw"
      fetchpriority="high"
    />
  {/if}
</svelte:head>

<ErrorBoundary error={location.error}>
  {#if location.isLoading}
    <Navbar {user} />
    <!-- Hero skeleton -->
    <div class="relative h-screen w-full min-h-200 overflow-hidden">
      <Skeleton class="absolute inset-0 w-full h-full rounded-none" />
      <div
        class="relative max-w-7xl mx-auto px-8 flex flex-col justify-end h-full pb-24 gap-6"
      >
        <Skeleton class="h-24 w-2/3" />
        <Skeleton class="h-16 w-1/2" />
        <div class="flex gap-4">
          <Skeleton class="h-14 w-48 rounded-lg" />
          <Skeleton class="h-14 w-48 rounded-lg" />
        </div>
      </div>
    </div>
    <!-- Community moments skeleton -->
    <section class="py-24 bg-muted">
      <div class="max-w-7xl mx-auto px-8">
        <Skeleton class="h-12 w-64 mb-4" />
        <Skeleton class="h-5 w-96 mb-16" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {#each Array(3) as _}
            <Skeleton class="aspect-3/4 rounded-xl" />
          {/each}
        </div>
      </div>
    </section>
    <!-- Popular picks skeleton -->
    <section class="py-32 max-w-7xl mx-auto px-8">
      <Skeleton class="h-12 w-48 mx-auto mb-4" />
      <Skeleton class="h-1 w-24 mx-auto mb-20" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        {#each Array(3) as _}
          <div class="space-y-4">
            <Skeleton class="aspect-video rounded-xl" />
            <Skeleton class="h-6 w-3/4" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
          </div>
        {/each}
      </div>
    </section>
    <!-- Map skeleton -->
    <section class="py-32 bg-muted">
      <div class="max-w-7xl mx-auto px-8">
        <Skeleton class="h-12 w-56 mb-16" />
        <Skeleton class="rounded-3xl h-150 w-full" />
      </div>
    </section>
  {/if}

  {#if location.isSuccess}
    <Navbar {user} />
    <Breadcrumb.Root
      class="flex flex-wrap items-center gap-2.5 border-b border-border px-6 py-4 text-[13px] text-muted-foreground sm:px-10"
    >
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        {#each location.data.breadcrumbs as breadcrumb, i}
          <Breadcrumb.Item>
            {#if i === location.data.breadcrumbs.length - 1}
              {#if breadcrumb.level !== 0}
                <Breadcrumb.Page class="font-bold text-primary"
                  >{breadcrumb.name}</Breadcrumb.Page
                >
              {:else}
                <Breadcrumb.Page class="font-bold text-primary"
                  >{breadcrumb.name}</Breadcrumb.Page
                >
              {/if}
            {:else}
              <Breadcrumb.Link href="/location/{breadcrumb.path}"
                >{breadcrumb.name}</Breadcrumb.Link
              >
            {/if}
          </Breadcrumb.Item>
          {#if i < location.data.breadcrumbs.length - 1}
            <Breadcrumb.Separator />
          {/if}
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <section class="px-6 pt-5 sm:px-10">
      <div class="relative overflow-hidden rounded-2xl">
        <OptimizedImage
          imageId={location.data.image}
          alt={location.data.name + " landscape"}
          sizes="100vw"
          class="w-full h-105 object-cover object-center"
          variant="large"
          height="38rem"
          loading="eager"
          fetchpriority="high"
        />
        <div
          class="pointer-events-none absolute inset-0"
          style="background:var(--overlay-hero)"
        ></div>
        <div class="absolute bottom-8 left-8 max-w-140">
          <span
            class="inline-block rounded-full bg-accent px-2.75 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-accent-foreground"
            >Country</span
          >
          <h1
            class="m-0 mt-3 text-[52px] leading-[1.02] tracking-[-0.035em] text-[#fdf9f3]"
          >
            New Zealand
          </h1>
          <!-- <p class="mt-3 text-[16px] text-[#fdf9f3]/90">
            64 dog-friendly places across both islands — cafés that mean it,
            off-leash beaches and stays that welcome the whole family.
          </p> -->
        </div>
        <dl
          class="absolute bottom-8 right-8 m-0 hidden w-65 rounded-xl bg-popover p-5 shadow-[0_10px_30px_rgba(63,45,29,.18)] lg:block"
        >
          <div class="flex items-baseline justify-between">
            <dt class="text-[13px] text-muted-foreground">Adventures</dt>
            <dd class="m-0 text-[15px] font-extrabold">
              {location.data.stats.totalAdventures}
            </dd>
          </div>
          <div
            class="flex items-baseline justify-between mt-2.5 border-t border-border pt-2.5"
          >
            <dt class="text-[13px] text-muted-foreground">Eats</dt>
            <dd class="m-0 text-[15px] font-extrabold">
              {location.data.stats.totalEats}
            </dd>
          </div>
          <div
            class="flex items-baseline justify-between mt-2.5 border-t border-border pt-2.5"
          >
            <dt class="text-[13px] text-muted-foreground">Accommodation</dt>
            <dd class="m-0 text-[15px] font-extrabold">
              {location.data.stats.totalStays}
            </dd>
          </div>
          <div
            class="flex items-baseline justify-between mt-2.5 border-t border-border pt-2.5"
          >
            <dt class="text-[13px] text-muted-foreground">Stores</dt>
            <dd class="m-0 text-[15px] font-extrabold">
              {location.data.stats.totalStores}
            </dd>
          </div>
          <div
            class="flex items-baseline justify-between mt-2.5 border-t border-border pt-2.5"
          >
            <dt class="text-[13px] text-muted-foreground">Total places</dt>
            <dd class="m-0 text-[15px] font-extrabold">
              {location.data.stats.totalPlaces}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="px-6 pt-14 sm:px-10">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="m-0 text-[28px] tracking-[-0.025em]">
            Popular picks in {locationArticle}{location.data.name}
          </h2>
          <p class="mt-1.5 text-[15px] text-muted-foreground">
            The places dog owners keep coming back to.
          </p>
        </div>
        <a
          href="/explore?lat={location.data.latitude}&lng={location.data
            .longitude}&zoom={zoom}&rating=4"
          class="text-sm font-bold text-primary no-underline hover:underline"
          >View all →</a
        >
      </div>
      <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {#each location.data.popularPlaces as place}
          <PlaceCard
            id={place.id}
            name={place.name}
            slug={place.slug}
            types={place.types}
            rating={place.rating}
            reviewCount={place.reviewsCount}
            isVerified={place.isVerified}
            countryCode={place.countryCode}
            dogAmenities={place.dogAmenities}
            imageId={place.imageId}
            {user}
            locationPath={place.locationPath}
            isSaved={place.isSaved}
            memberFavourite={place.memberFavourite}
            difficulty={place.difficulty}
            cityName={place.cityName}
            regionName={place.regionName}
          />
        {/each}
      </div>
    </section>

    {#snippet locationCarousel(items: typeof childLocations, heading: string)}
      <section class="w-full px-6 pt-14 sm:px-10">
        <h2 class="m-0 text-[28px] tracking-[-0.025em]">{heading}</h2>
        <div class="mt-5">
          <div
            role="button"
            tabindex="0"
            aria-label="location carousel"
            class="relative"
            onmouseenter={() => (carouselHovered = true)}
            onmouseleave={() => (carouselHovered = false)}
          >
            {#if canScrollLeft && carouselHovered}
              <button
                onclick={scrollLeft}
                class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-12 h-12 rounded-full bg-background shadow-xl border border-border/10 flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft class="size-5" />
              </button>
            {/if}

            {#if canScrollRight && carouselHovered}
              <button
                onclick={scrollRight}
                class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-12 h-12 rounded-full bg-background shadow-xl border border-border/10 flex items-center justify-center text-foreground hover:bg-muted transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight class="size-5" />
              </button>
            {/if}

            <div
              bind:this={carouselEl}
              onscroll={updateScrollState}
              class="flex overflow-x-auto gap-8 pb-8 scroll-smooth"
              style="-ms-overflow-style: none; scrollbar-width: none;"
            >
              {#if items.isLoading}
                {#each Array(5) as _}
                  <div
                    class="flex-none w-87.5 aspect-3/4 rounded-xl overflow-hidden"
                  >
                    <Skeleton class="w-full h-full rounded-xl" />
                  </div>
                {/each}
              {:else if items.isSuccess}
                {#each items.data as child, i}
                  <a
                    href="/location/{child.path}"
                    class="flex-none w-87.5 aspect-3/4 relative rounded-xl overflow-hidden group/card cursor-pointer shadow-xl"
                  >
                    {#if child.image}
                      <OptimizedImage
                        imageId={child.image}
                        alt={child.name}
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        height="100%"
                        variant="medium"
                        loading={i < 4 ? "eager" : "lazy"}
                        fetchpriority={i < 4 ? "high" : "auto"}
                      />
                    {:else}
                      <div
                        class="absolute inset-0 bg-muted flex flex-col items-center justify-center gap-2"
                      >
                        <PawPrint
                          class="size-8 text-muted-foreground opacity-40"
                        />
                        <p
                          class="font-headline font-semibold text-muted-foreground text-sm"
                        >
                          No photos yet
                        </p>
                      </div>
                    {/if}
                    <div
                      class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8"
                    >
                      <h3 class="text-white text-3xl mb-2">
                        {child.name}
                      </h3>
                      <div
                        class="flex items-center gap-2 text-white/80 text-xs tracking-widest"
                      >
                        <MapPin class="size-3.5 text-white/80" />
                        <span
                          >{child.placeCount} place{child.placeCount === 1
                            ? ""
                            : "s"}</span
                        >
                      </div>
                    </div>
                  </a>
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </section>
    {/snippet}

    {#if isCity}
      {@render locationCarousel(nearbyLocations, "Nearby locations")}
    {:else}
      {@render locationCarousel(childLocations, "Top locations")}
    {/if}

    {#if communityPhotos.isSuccess && communityPhotos.data.total > 0}
      <section class="px-6 pt-14 sm:px-10">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="m-0 text-[28px] tracking-[-0.025em]">
              Community photos
            </h2>
            <p class="mt-1.5 text-[15px] text-muted-foreground">
              Captured moments from our community's most memorable visits.
            </p>
          </div>
          <a
            href="#"
            class="text-sm font-bold text-primary no-underline hover:underline"
            >View more →</a
          >
        </div>
        <div
          class="mt-5 grid auto-rows-[86px] grid-cols-4 gap-3 sm:auto-rows-[100px] sm:grid-cols-6 lg:auto-rows-[92px] lg:grid-cols-8"
        >
          <button
            onclick={() => openGalleryAt(0)}
            type="button"
            data-gallery-open="0"
            class="group relative col-span-4 col-start-1 row-span-2 row-start-1 cursor-pointer overflow-hidden rounded-2xl border-0 p-0 sm:col-span-3 sm:row-span-3 lg:col-span-3 lg:row-span-4"
          >
            <div
              class="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
            >
              <OptimizedImage
                alt={`${communityPhotos.data.photos[0].reviewerName} at ${communityPhotos.data.photos[0].placeName}`}
                imageId={communityPhotos.data.photos[0].cfImageId}
                variant="medium"
                class="w-full h-full object-center object-cover"
              />
            </div>
            <div
              class="pointer-events-none absolute inset-0"
              style="background:var(--overlay-card)"
            ></div>
            <span
              class="pointer-events-none absolute bottom-4 left-4 text-left text-[15px] font-extrabold tracking-[-0.015em] text-[#fdf9f3]"
              >{communityPhotos.data.photos[0].reviewerName} · {communityPhotos
                .data.photos[0].placeName}</span
            >
          </button>
          {#each communityPhotos.data.photos.slice(1, 5) as photo, i}
            <button
              type="button"
              data-gallery-open={i + 1}
              onclick={() => openGalleryAt(i + 1)}
              class="group relative cursor-pointer overflow-hidden rounded-2xl border-0 p-0"
            >
              <div
                class="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
              >
                <OptimizedImage
                  alt={`${photo.reviewerName} at ${photo.placeName}`}
                  imageId={photo.cfImageId}
                  variant="medium"
                  class="w-full h-full object-center object-cover"
                />
              </div>
              <div
                class="pointer-events-none absolute inset-0"
                style="background:var(--overlay-card)"
              ></div>
            </button>
          {/each}
          <button
            type="button"
            data-gallery-open="6"
            onclick={() => openGalleryAt(5)}
            class="group relative col-span-2 col-start-3 row-span-2 row-start-7 cursor-pointer overflow-hidden rounded-2xl border-0 p-0 sm:col-span-6 sm:col-start-1 sm:row-span-1 sm:row-start-6 lg:col-span-4 lg:col-start-5 lg:row-span-2 lg:row-start-5"
          >
            <div
              class="photo absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
            ></div>
            <div
              class="pointer-events-none absolute inset-0 grid place-items-center bg-[#3f2d1d]/55"
            >
              <span class="text-[15px] font-extrabold text-[#fdf9f3]"
                >+{communityPhotos.data.total - 6} more photos</span
              >
            </div>
          </button>
        </div>
      </section>
    {/if}

    <section class="px-6 pt-14 sm:px-10">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">Explore on the map</h2>
      <div
        class="relative mt-5 h-185 overflow-hidden rounded-2xl border border-border bg-muted"
      >
        <LocationMap
          lat={location.data.latitude}
          lng={location.data.longitude}
          {zoom}
          {pathname}
          places={Array.from(
            new Map(
              [
                ...location.data.popularPlaces,
                ...location.data.stays,
                ...location.data.eats,
                ...location.data.adventures,
              ].map((p) => [p.id, p]),
            ).values(),
          )}
        />
      </div>
    </section>

    <!-- Dialog gallery -->
    {#if communityPhotos.data && communityPhotos.data.total > 0}
      {@const activePhoto = communityPhotos.data.photos[activeGalleryIndex]}
      <div
        class="inset-0 z-50 flex flex-col bg-[#3f2d1d]/92 backdrop-blur-sm {communityPhotosOpen
          ? 'fixed'
          : 'hidden'}"
        role="dialog"
        aria-modal="true"
        aria-label="Community photos"
      >
        <div class="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div
            class="text-[12.5px] font-bold uppercase tracking-widest text-[#fdf9f3]/70"
          >
            Community photos · <span data-gallery-count
              >{activeGalleryIndex + 1} / {communityPhotos.data.photos
                .length}</span
            >
          </div>
          <button
            onclick={() => (communityPhotosOpen = false)}
            type="button"
            data-gallery-close
            aria-label="Close gallery"
            class="flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-[#fdf9f3]/12 text-[#fdf9f3] hover:bg-[#fdf9f3]/25"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              ><path d="M5 5l14 14" /><path d="M19 5L5 19" /></svg
            >
          </button>
        </div>
        <div
          class="flex min-h-0 flex-1 items-stretch gap-3 px-3 sm:gap-5 sm:px-8"
        >
          <button
            onclick={() =>
              prevGalleryPhoto(communityPhotos.data.photos.length)}
            type="button"
            data-gallery-prev
            aria-label="Previous photo"
            class="flex size-12 flex-none cursor-pointer items-center justify-center self-center rounded-full border-0 bg-[#fdf9f3]/12 text-[#fdf9f3] hover:bg-[#fdf9f3]/25"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"><path d="M15 5l-7 7 7 7" /></svg
            >
          </button>
          <figure class="m-0 flex h-full min-h-0 min-w-0 flex-1 flex-col gap-4">
            <OptimizedImage
              imageId={activePhoto.cfImageId}
              alt={`${activePhoto.reviewerName} at ${activePhoto.placeName}`}
              variant="large"
              class="min-h-35 flex-1 overflow-hidden rounded-2xl object-cover"
              height="100%"
            />

            <figcaption
              class="flex flex-wrap items-center justify-between gap-3 pb-1"
            >
              <div>
                <div
                  class="text-[17px] font-extrabold tracking-[-0.015em] text-[#fdf9f3]"
                  data-gallery-title
                >
                  {activePhoto.placeName}
                </div>
                <div
                  class="mt-0.5 text-[13.5px] text-[#fdf9f3]/70"
                  data-gallery-meta
                >
                  {#if activePhoto.reviewerName}
                    by {activePhoto.reviewerName}
                  {/if}
                  {#if activePhoto.dogs.length > 0}
                    · {activePhoto.dogs.map((dog) => dog.name).join(", ")}
                  {/if}
                </div>
              </div>
              <a
                href="/location/{activePhoto.locationPath}/places/{activePhoto.placeSlug}"
                class="rounded-lg bg-[#fdf9f3] px-4 py-2.5 text-[13px] font-extrabold text-[#3f2d1d] no-underline hover:bg-[#fdf9f3]/85"
                >View place</a
              >
            </figcaption>
          </figure>
          <button
            onclick={() =>
              nextGalleryPhoto(communityPhotos.data.photos.length)}
            type="button"
            data-gallery-next
            aria-label="Next photo"
            class="flex size-12 flex-none cursor-pointer items-center justify-center self-center rounded-full border-0 bg-[#fdf9f3]/12 text-[#fdf9f3] hover:bg-[#fdf9f3]/25"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"><path d="M9 5l7 7-7 7" /></svg
            >
          </button>
        </div>
        <div
          class="flex gap-2 overflow-x-auto px-5 pb-5 pt-2 sm:px-8"
          data-gallery-strip
        >
          {#each communityPhotos.data.photos as photo, i (photo.cfImageId)}
            <button
              type="button"
              onclick={() => selectGalleryPhoto(i)}
              aria-label={`View photo at ${photo.placeName}`}
              aria-current={i === activeGalleryIndex}
              class="size-16 flex-none cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-opacity sm:size-20 {i ===
              activeGalleryIndex
                ? 'border-[#fdf9f3] opacity-100'
                : 'border-transparent opacity-60 hover:opacity-90'}"
            >
              <OptimizedImage
                imageId={photo.cfImageId}
                alt={`${photo.reviewerName} at ${photo.placeName}`}
                variant="thumbnail"
                class="h-full w-full object-cover"
                height="100%"
              />
            </button>
          {/each}
        </div>
      </div>
    {/if}

    <Footer />
  {/if}
</ErrorBoundary>

<!-- <style>
  .stat-overlay {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
  }

  .adventure-gradient {
    background: linear-gradient(
      to top,
      rgba(25, 28, 26, 0.8) 0%,
      transparent 100%
    );
  }
</style> -->
