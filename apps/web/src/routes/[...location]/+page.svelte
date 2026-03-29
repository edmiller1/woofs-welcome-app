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
  import { Button } from "$lib/components/ui/button";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";

  import type { BAUser, PlaceFilter } from "@woofs/types";
  import { Map as MapIcon, Maximize2 } from "@lucide/svelte";

  interface Props {
    data: {
      pathname: string;
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { pathname, user } = $derived(data);

  const location = createQuery(() => ({
    queryKey: ["location", pathname],
    queryFn: () => api.location.getLocation(pathname.toString()),
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

  const setPlaceFilter = (filter: PlaceFilter) => {
    const params = new URLSearchParams(page.url.searchParams);
    params.set("placeSort", filter);
    goto(`?${params.toString()}`, {
      keepFocus: true,
      noScroll: true,
      replaceState: true, // don't add to browser history (might change later)
    });
  };
</script>

<ErrorBoundary error={location.error}>
  {#if location.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if location.isSuccess}
    <Navbar {user} />
    <main>
      <!-- Hero Section -->
      <section
        class="relative h-180 w-full overflow-hidden mx-auto flex items-end px-8 md:px-16 pb-20"
      >
        <div class="absolute inset-0 z-0">
          <OptimizedImage
            imageId={location.data.image}
            alt={location.data.name + " image"}
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) calc(100vw - 4rem), 1500px"
            class="w-full object-cover object-center"
            variant="hero"
            height="800px"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
          ></div>
        </div>
        <div class="relative z-10 max-w-4xl">
          <Breadcrumbs items={location.data.breadcrumbs} location={true} />
          <h1
            class="font-headline italic text-7xl md:text-9xl text-white leading-none tracking-tighter"
          >
            {location.data.name}, {location.data.countryCode}
          </h1>
        </div>
      </section>
      <!-- Stats Bar -->
      <section class="max-w-7xl mx-auto -mt-12 relative z-50 px-4 md:px-8">
        <div
          class="bg-white shadow-[0_4px_24px_rgba(28,28,25,0.06)] rounded-3xl p-8 md:p-10 flex flex-wrap justify-around items-center gap-8 border border-outline-variant/10"
        >
          <div class="flex flex-col items-center">
            <span class="font-headline italic text-4xl text-primary"
              >{location.data.stats.totalPlaces}</span
            >
            <span
              class="font-label text-xs uppercase tracking-widest text-secondary font-bold"
              >Places</span
            >
          </div>
          <div class="w-px h-12 bg-outline-variant/30 hidden md:block"></div>
          <div class="flex flex-col items-center">
            <span class="font-headline italic text-4xl text-primary"
              >{location.data.stats.totalStays}</span
            >
            <span
              class="font-label text-xs uppercase tracking-widest text-secondary font-bold"
              >Stays</span
            >
          </div>
          <div class="w-px h-12 bg-outline-variant/30 hidden md:block"></div>
          <div class="flex flex-col items-center">
            <span class="font-headline italic text-4xl text-primary"
              >{location.data.stats.totalEats}</span
            >
            <span
              class="font-label text-xs uppercase tracking-widest text-secondary font-bold"
              >Eats</span
            >
          </div>
          <div class="w-px h-12 bg-outline-variant/30 hidden md:block"></div>
          <div class="flex flex-col items-center">
            <span class="font-headline italic text-4xl text-primary"
              >{location.data.stats.totalAdventures}</span
            >
            <span
              class="font-label text-xs uppercase tracking-widest text-secondary font-bold"
              >Adventures</span
            >
          </div>
        </div>
      </section>
      <!-- Description -->
      {#if location.data.description}
        <section
          class="max-w-7xl mx-auto px-8 py-24 grid grid-cols-12 gap-6 items-center"
        >
          <div class="col-span-12 lg:col-span-5 space-y-6">
            <span
              class="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold"
              >About
            </span>
            <p
              class="font-body text-lg text-on-surface-variant leading-relaxed"
            >
              {location.data.description}
            </p>
            <div class="pt-4">
              <Button size="lg">Explore {location.data.name}</Button>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 lg:col-start-7 relative">
            <!-- Maybe a place image? -->
            <div
              class="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700"
            >
              <OptimizedImage imageId={location.data.image} alt="" />
            </div>
            <!-- Maybe a review image? here -->
            <!-- <div
              class="absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden border-8 border-surface shadow-xl hidden md:block -rotate-3"
            >
              <img
                alt="Happy dog in Cotswolds"
                class="w-full h-full object-cover"
                data-alt="portrait of a happy golden retriever sitting in a field of yellow wildflowers with soft green hills in the background"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCENQZpwP1v4rdCKIvzR9knHqDCs2lH6yfjydlQniSRY1EJUkw5uVXtJrd3wF_mppePnl8AKSbPfzwrNuC1Z9Vgbqm9QBEyT96ZsWHvq_Qm9K9V1QwfWCR7j005Nydp1jT7U-z2wsrH1lQ6v9USIe-Yz5tO5HlB7kdgH5HnazUjYetQTjXPmBxNfP59jZZrbZRqL0rClIlP3qvLwjlgFDDERAZFAkKtW-SrPAPtN-gvDyJB_XpfrNUZFr45ala8RpOZWoCnjXKeWD0f"
              />
            </div> -->
          </div>
        </section>
      {/if}
      <!-- Places Section -->
      <section class="bg-surface-container-low py-24">
        <!-- Popular Places -->
        {#if location.data.popularPlaces.length > 0}
          <div class="max-w-7xl mx-auto px-8">
            <div class="flex justify-between items-end mb-12">
              <div class="space-y-2">
                <!-- <span
                class="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold"
                >Curated Selection</span
              > -->
                <h2 class="font-headline text-5xl text-primary">
                  Popular Places in {location.data.name}
                </h2>
              </div>
              <a
                class="font-label font-bold text-sm hover:border-b-2 hover:border-tertiary-fixed-dim text-primary transition-colors"
                href="/{pathname}/explore">View All</a
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each location.data.popularPlaces as place}
                <PlaceCard
                  id={place.id}
                  name={place.name}
                  rating={place.rating}
                  slug={place.slug}
                  cityName={place.cityName}
                  regionName={place.regionName}
                  countryCode={place.countryCode}
                  types={place.types}
                  isSaved={place.isSaved}
                  imageId={place.imageId}
                  {user}
                  locationPath={place.locationPath}
                  isVerified={place.isVerified}
                />
              {/each}
            </div>
          </div>
        {/if}
        <!-- Stays -->
        {#if location.data.stays.length > 0}
          <div class="max-w-7xl mx-auto px-8">
            <div class="flex justify-between items-end mb-12">
              <div class="space-y-2">
                <!-- <span
                class="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold"
                >Curated Selection</span
              > -->
                <h2 class="font-headline text-5xl text-primary">
                  Dog-friendly stays in {location.data.name}
                </h2>
              </div>
              <a
                class="font-label font-bold text-sm hover:border-b-2 hover:border-tertiary-fixed-dim text-primary transition-colors"
                href="/{pathname}/explore?types=Hotel,Motel,Accomodation,AirBnb"
                >View All</a
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each location.data.stays as place}
                <PlaceCard
                  id={place.id}
                  name={place.name}
                  rating={place.rating}
                  slug={place.slug}
                  cityName={place.cityName}
                  regionName={place.regionName}
                  countryCode={place.countryCode}
                  types={place.types}
                  isSaved={place.isSaved}
                  imageId={place.imageId}
                  {user}
                  locationPath={place.locationPath}
                  isVerified={place.isVerified}
                />
              {/each}
            </div>
          </div>
        {/if}
        <!-- Eats -->
        {#if location.data.eats.length > 0}
          <div class="max-w-7xl mx-auto px-8">
            <div class="flex justify-between items-end mb-12">
              <div class="space-y-2">
                <!-- <span
                class="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold"
                >Curated Selection</span
              > -->
                <h2 class="font-headline text-4xl text-primary">
                  Places to eat {location.data.name}
                </h2>
              </div>
              <a
                class="font-label font-bold text-sm hover:border-b-2 hover:border-tertiary-fixed-dim text-primary transition-colors"
                href="/{pathname}/explore?types=Bar,Restaurant,Café,Winery"
                >View All</a
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each location.data.eats as place}
                <PlaceCard
                  id={place.id}
                  name={place.name}
                  rating={place.rating}
                  slug={place.slug}
                  cityName={place.cityName}
                  regionName={place.regionName}
                  countryCode={place.countryCode}
                  types={place.types}
                  isSaved={place.isSaved}
                  imageId={place.imageId}
                  {user}
                  locationPath={place.locationPath}
                  isVerified={place.isVerified}
                />
              {/each}
            </div>
          </div>
        {/if}
        <!-- Adventures -->
        {#if location.data.adventures.length > 0}
          <div class="max-w-7xl mx-auto px-8">
            <div class="flex justify-between items-end mb-12">
              <div class="space-y-2">
                <!-- <span
                class="font-label text-xs uppercase tracking-[0.3em] text-secondary font-bold"
                >Curated Selection</span
              > -->
                <h2 class="font-headline text-5xl text-primary">
                  Adventures in {location.data.name}
                </h2>
              </div>
              <a
                class="font-label font-bold text-sm hover:border-b-2 hover:border-tertiary-fixed-dim text-primary transition-colors"
                href="/{pathname}/explore?types=Park,Dog+Park,Beach,Walk,Hike,Lake,River,Trail,Activity"
                >View All</a
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each location.data.adventures as place}
                <PlaceCard
                  id={place.id}
                  name={place.name}
                  rating={place.rating}
                  slug={place.slug}
                  cityName={place.cityName}
                  regionName={place.regionName}
                  countryCode={place.countryCode}
                  types={place.types}
                  isSaved={place.isSaved}
                  imageId={place.imageId}
                  {user}
                  locationPath={place.locationPath}
                  isVerified={place.isVerified}
                />
              {/each}
            </div>
          </div>
        {/if}
      </section>
      <!-- Map Component -->
      <section class="max-w-full mx-auto px-24 py-24">
        <div
          class="rounded-lg overflow-hidden relative h-150 border-8 border-surface-container-low"
        >
          <div class="absolute bottom-7 right-2 z-50">
            <Button
              href="/{pathname}/explore"
              class="bg-white text-black hover:bg-primary hover:text-white transition-colors duration-150"
              ><MapIcon />View all</Button
            >
          </div>
          <LocationMap
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
    </main>
    <Footer />
    <MobileBottomNav {user} />
  {/if}
</ErrorBoundary>
