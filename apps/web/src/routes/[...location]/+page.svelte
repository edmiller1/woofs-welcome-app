<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
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
      queryFn: () => api.location.getLocationPhotos(pathname.toString(), 1, 3),
    })),
  );
</script>

<svelte:head>
  {#if initialLocation}
    <title>{initialLocation.name} — Dog-Friendly Places | Woofs Welcome</title>
    <meta
      name="description"
      content="Discover dog-friendly places in {initialLocation.name}, New Zealand. Find cafes, restaurants, accommodation, walks and more that welcome your dog."
    />
    <meta property="og:title" content="{initialLocation.name} — Dog-Friendly Places | Woofs Welcome" />
    <meta
      property="og:description"
      content="Discover dog-friendly places in {initialLocation.name}, New Zealand. Find cafes, restaurants, accommodation, walks and more that welcome your dog."
    />
    {#if initialLocation.image}
      <meta property="og:image" content={buildImageUrl(initialLocation.image, "xlarge")} />
    {/if}
    <meta property="og:type" content="website" />
    <link rel="canonical" href="https://woofswelcome.app/location/{initialLocation.pathname}" />
  {/if}
  {#if initialLocation?.image}
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
    <section class="py-24 bg-surface-container-low">
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
    <section class="py-32 bg-surface-container">
      <div class="max-w-7xl mx-auto px-8">
        <Skeleton class="h-12 w-56 mb-16" />
        <Skeleton class="rounded-3xl h-150 w-full" />
      </div>
    </section>
  {/if}

  {#if location.isSuccess}
    <Navbar {user} />
    <main>
      <section
        class="relative w-full min-h-200 overflow-hidden flex items-center {location
          .data.image
          ? 'h-screen'
          : 'py-24'}"
      >
        {#if location.data.image}
          <OptimizedImage
            imageId={location.data.image}
            alt={location.data.name + " landscape"}
            sizes="100vw"
            class="absolute inset-0 w-full h-full object-cover object-center"
            variant="xlarge"
            height="100%"
            loading="eager"
            fetchpriority="high"
          />
          <div class="absolute inset-0 adventure-gradient"></div>
        {/if}
        <div
          class="relative w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end {location
            .data.image
            ? 'pb-24'
            : ''}"
        >
          <div class="lg:col-span-8">
            <div class="mb-6">
              <Breadcrumbs
                items={location.data.breadcrumbs}
                location={!!location.data.image}
              />
            </div>
            <h1
              class="font-serif text-6xl md:text-8xl lg:text-[100px] mb-8 {location
                .data.image
                ? 'text-white'
                : 'text-on-surface'}"
            >
              Dog-Friendly places in {locationArticle}{location.data.name}
            </h1>
            <div class="flex gap-6">
              <a
                href={`/explore?lat=${location.data.latitude}&lng=${location.data.longitude}&zoom=${zoom}`}
                class="bg-primary px-10 py-5 rounded-lg text-white font-bold text-sm tracking-widest hover:brightness-110 transition-all shadow-2xl uppercase"
                >Start Exploring</a
              >
              {#if communityPhotos.isSuccess && communityPhotos.data.total > 0}
                {#if location.data.image}
                  <a
                    href="/location/{pathname}/photos"
                    class="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 px-10 py-5 rounded-lg text-white font-bold text-sm tracking-widest hover:bg-white/20 transition-all uppercase"
                    >View Gallery</a
                  >
                {:else}
                  <a
                    href="/location/{pathname}/photos"
                    class="cursor-pointer border border-secondary px-10 py-5 rounded-lg text-secondary font-bold text-sm tracking-widest hover:bg-secondary/10 transition-all uppercase"
                    >View Gallery</a
                  >
                {/if}
              {/if}
            </div>
          </div>
          <!-- Floating Stats Sidebar -->
          <div class="lg:col-span-4 hidden lg:block">
            <div
              class="stat-overlay p-8 rounded-xl border border-white/20 shadow-2xl"
            >
              <div class="space-y-8">
                <div
                  class="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                >
                  <span
                    class="text-on-surface-variant font-bold text-xs tracking-widest uppercase"
                    >Adventures</span
                  >
                  <span class="text-primary-tint font-serif text-3xl font-bold"
                    >{location.data.stats.totalAdventures ?? 0}</span
                  >
                </div>
                <div
                  class="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                >
                  <span
                    class="text-on-surface-variant font-bold text-xs tracking-widest uppercase"
                    >Eats</span
                  >
                  <span class="text-primary-tint font-serif text-3xl font-bold"
                    >{location.data.stats.totalEats ?? 0}</span
                  >
                </div>
                <div
                  class="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                >
                  <span
                    class="text-on-surface-variant font-bold text-xs tracking-widest uppercase"
                    >Accommodation</span
                  >
                  <span class="text-primary-tint font-serif text-3xl font-bold"
                    >{location.data.stats.totalStays ?? 0}</span
                  >
                </div>
                <div
                  class="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                >
                  <span
                    class="text-on-surface-variant font-bold text-xs tracking-widest uppercase"
                    >Stores</span
                  >
                  <span class="text-primary-tint font-serif text-3xl font-bold"
                    >{location.data.stats.totalStores ?? 0}</span
                  >
                </div>
                <div
                  class="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                >
                  <span
                    class="text-on-surface-variant font-bold text-xs tracking-widest uppercase"
                    >Total Places</span
                  >
                  <span class="text-primary-tint font-serif text-3xl font-bold"
                    >{location.data.stats.totalPlaces ?? 0}</span
                  >
                </div>
                <div class="pt-2">
                  <div
                    class="flex items-center gap-1 text-primary font-bold text-xs tracking-wide uppercase mb-2"
                  >
                    <Star class="size-3.5 fill-primary text-primary" />
                    {location.data.averageRating} ({location.data.totalReviews} reviews)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Images section -->
      {#if communityPhotos.isSuccess && communityPhotos.data.total > 0}
        <section class="py-24 bg-surface-container-low">
          <div class="max-w-7xl mx-auto px-8">
            <div class="flex items-end justify-between mb-16">
              <div>
                <h2 class="font-serif text-5xl text-on-surface mb-4">
                  Community Moments
                </h2>
                <p class="text-on-surface-variant text-lg max-w-lg">
                  Captured moments from our community's most memorable visits.
                </p>
              </div>
              <a
                href="/location/{pathname}/photos"
                aria-label="View all photos from the community"
                class="cursor-pointer text-primary-tint font-bold text-sm tracking-widest flex items-center gap-3 group uppercase"
              >
                View Gallery <ArrowRight
                  class="size-4 transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each communityPhotos.data.photos as photo}
                <a
                  href="/location/{pathname}/photos"
                  class="group relative aspect-3/4 overflow-hidden rounded-xl cursor-pointer shadow-lg"
                >
                  <OptimizedImage
                    imageId={photo.cfImageId}
                    alt={photo.placeName}
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    height="100%"
                    variant="large"
                  />
                  <div
                    class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8"
                  >
                    <span class="text-white font-serif text-2xl mb-1"
                      >{photo.placeName}</span
                    >
                    {#if photo.reviewerName}
                      <span
                        class="text-white/70 text-xs tracking-widest uppercase"
                        >by {photo.reviewerName}</span
                      >
                    {/if}
                    {#if photo.dogs.length > 0}
                      <span class="text-white/60 text-xs tracking-wide mt-1">
                        {photo.dogs.map((d) => d.name).join(", ")}
                      </span>
                    {/if}
                  </div>
                </a>
              {/each}
            </div>
          </div>
        </section>
      {/if}

      <!-- Places section -->
      {#if location.data.popularPlaces.length > 0}
        <section class="py-32 max-w-7xl mx-auto px-8">
          <div class="mb-20">
            <h2 class="font-serif text-5xl mb-4">Popular Picks</h2>
            <div class="w-24 h-1 bg-primary-container mx-auto"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            {#each location.data.popularPlaces as place}
              <PlaceCard
                id={place.id}
                name={place.name}
                rating={place.rating}
                slug={place.slug}
                cityName={place.cityName}
                regionName={place.regionName ?? ""}
                countryCode={place.countryCode}
                types={place.types}
                isSaved={place.isSaved}
                imageId={place.imageId ?? undefined}
                {user}
                locationPath={place.locationPath}
                isVerified={place.isVerified}
                memberFavourite={place.memberFavourite}
                reviewCount={place.reviewsCount}
                dogAmenities={place.dogAmenities}
              />
            {/each}
          </div>
          <div class="mt-12 flex items-center justify-center">
            <a
              href={`/explore?lat=${location.data.latitude}&lng=${location.data.longitude}&zoom=${zoom}`}
              class="bg-primary py-3 px-4 rounded-lg text-white hover:bg-primary/90 cursor-pointer"
              >Explore {locationArticle}{location.data.name}</a
            >
          </div>
        </section>
      {/if}

      <!-- locations / nearby cities section -->
      {#snippet locationCarousel(items: typeof childLocations, heading: string)}
        <section class="py-32 bg-surface-container-low">
          <div class="max-w-7xl mx-auto px-8">
            <div class="mb-16">
              <h2 class="font-serif text-5xl text-on-surface mb-4">
                {heading}
              </h2>
            </div>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="relative"
              onmouseenter={() => (carouselHovered = true)}
              onmouseleave={() => (carouselHovered = false)}
            >
              <!-- Left arrow -->
              {#if canScrollLeft && carouselHovered}
                <button
                  onclick={scrollLeft}
                  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-12 h-12 rounded-full bg-background shadow-xl border border-outline/10 flex items-center justify-center text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft class="size-5" />
                </button>
              {/if}

              <!-- Right arrow -->
              {#if canScrollRight && carouselHovered}
                <button
                  onclick={scrollRight}
                  class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-12 h-12 rounded-full bg-background shadow-xl border border-outline/10 flex items-center justify-center text-on-surface hover:bg-surface-container transition-all cursor-pointer"
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
                          class="absolute inset-0 bg-surface-container-high"
                        ></div>
                      {/if}
                      <div
                        class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8"
                      >
                        <h3 class="text-white font-serif text-3xl mb-2">
                          {child.name}
                        </h3>
                        <div
                          class="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest"
                        >
                          <MapPin class="size-3.5 fill-white/80" />
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
        {@render locationCarousel(nearbyLocations, `Nearby cities`)}
      {:else}
        {@render locationCarousel(
          childLocations,
          `Top locations in ${location.data.name}`,
        )}
      {/if}

      <!-- Map section -->
      <section class="py-32 bg-surface-container">
        <div class="max-w-7xl mx-auto px-8">
          <div
            class="flex flex-col md:flex-row items-center justify-between mb-16 gap-8"
          >
            <div>
              <h2 class="font-serif text-5xl text-on-surface mb-2">
                Explore the map
              </h2>
            </div>
          </div>
          <div
            class="rounded-3xl overflow-hidden relative h-150 border border-outline/10 shadow-lg"
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
        </div>
      </section>
    </main>
    <Footer />
  {/if}
</ErrorBoundary>

<style>
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
</style>
