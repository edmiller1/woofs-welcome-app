<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Spinner } from "$lib/components/ui/spinner";
  import {
    ArrowRight,
    BadgeCheck,
    Bubbles,
    Footprints,
    Heart,
    Hotel,
    MapPin,
    MapPinHouse,
    PartyPopper,
    ShoppingBag,
    Sparkles,
    Star,
    UtensilsCrossed,
  } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";

  import type { BAUser, PlaceFilter } from "@woofs/types";

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

  const mainPopularPlaces = $derived(
    location.data?.popularPlaces.slice(0, 2) || [],
  );
  const popularPlaces = $derived(location.data?.popularPlaces.slice(2) || []);
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
    <div class="mx-auto max-w-375 px-2 sm:px-4 lg:px-8">
      <Navbar {user} />
      <div class="py-2 lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <Breadcrumbs items={location.data.breadcrumbs} />
          <h2
            class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
          >
            {location.data.name}
          </h2>
          <div
            class="text-muted-foreground mt-2 flex h-4 flex-wrap items-center space-x-2 text-sm"
          >
            <p class="flex items-center">
              <MapPin class="mr-1 h-4 w-4" />
              {location.data.stats.totalPlaces} places
            </p>
            <Separator orientation="vertical" />
            <p class="flex items-center">
              <Footprints class="mr-1 h-4 w-4" />
              {location.data.stats.totalAdventures} adventures
            </p>
            <Separator orientation="vertical" />
            <p class="flex items-center">
              <UtensilsCrossed class="mr-1 h-4 w-4" />
              {location.data.stats.totalEats} eats
            </p>
            <Separator orientation="vertical" />
            <p class="flex items-center">
              <Hotel class="mr-1 h-4 w-4" />
              {location.data.stats.totalStays} stays
            </p>
            <Separator orientation="vertical" />
            <p class="flex items-center">
              <ShoppingBag class="mr-1 h-4 w-4" />
              {location.data.stats.totalStores} stores
            </p>
          </div>
          <div class="min-width-full relative my-5 flex justify-center">
            <OptimizedImage
              imageId={location.data.image}
              alt={location.data.name + " image"}
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) calc(100vw - 4rem), 1500px"
              class="w-full rounded-lg object-cover object-center"
              variant="hero"
              height="600px"
            />
          </div>
          <section class="mt-20 w-full rounded-lg border p-4">
            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Star class="size-7 fill-foreground" />
                <h2 class="text-2xl font-bold">
                  Popular Places in {location.data.name}
                </h2>
              </div>
              <a
                href={`/explore?location=${location.data.name.toLowerCase()}&minRating=4`}
                class="hover:underline"
              >
                View all
              </a>
            </div>

            <!-- Popular Places first 2 -->
            <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {#each mainPopularPlaces as place}
                <div class="flex items-center gap-4">
                  <a
                    href={`${place.locationPath}/places/${place.slug}`}
                    aria-label={place.name}
                  >
                    <div
                      class="group cursor-pointer overflow-hidden rounded-lg border"
                    >
                      <div class="relative aspect-video overflow-hidden">
                        <OptimizedImage
                          imageId={place.imageId}
                          alt={place.name + " image"}
                          class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          variant="card"
                        />
                        <!-- Heart Button -->
                        <div class="absolute right-2 top-2 z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            class="rounded-full bg-white/80 hover:bg-white"
                          >
                            <Heart
                              class={`size-5 ${place.isSaved ? "fill-rose-500 text-rose-500" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <div class="rounded-lg p-4">
                        <div class="flex items-center gap-2">
                          <h3 class="line-clamp-1 text-lg font-semibold">
                            {place.name}
                          </h3>
                          {#if place.isVerified}
                            <BadgeCheck class="fill-primary size-4" />
                          {/if}
                        </div>
                        <div
                          class="text-muted-foreground mb-2 flex items-center gap-3 text-sm"
                        >
                          <span>{place.cityName}, {place.regionName}</span>
                          <div class="flex items-center gap-1 text-foreground">
                            <Star
                              class="text-yellow-500 size-3 fill-yellow-500"
                            />
                            <span class="text-foreground"
                              >{Number(place.rating).toFixed(1)}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              {/each}
            </div>
            <!-- Popular Places -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              {#each popularPlaces as place}
                <a
                  href={`${pathname}/places/${place.slug}`}
                  aria-label={place.name}
                >
                  <div
                    class="group cursor-pointer overflow-hidden rounded-md border"
                  >
                    <div class="relative aspect-video overflow-hidden">
                      <OptimizedImage
                        imageId={place.imageId}
                        alt={place.name + " image"}
                        class="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        variant="card"
                      />
                      <!-- Heart Button -->
                      <div class="absolute right-2 top-2 z-10">
                        <Button
                          variant="ghost"
                          size="icon"
                          class="rounded-full bg-white/80 hover:bg-white"
                        >
                          <Heart
                            class={`size-5 ${place.isSaved ? "fill-rose-500 text-rose-500" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                    <div class="p-3">
                      <div class="flex items-center gap-2">
                        <h3 class="line-clamp-1 text-lg font-semibold">
                          {place.name}
                        </h3>
                        {#if place.isVerified}
                          <BadgeCheck class="fill-primary size-4" />
                        {/if}
                      </div>
                      <div
                        class="text-muted-foreground flex items-center gap-2 text-xs"
                      >
                        <span>{place.cityName}, {place.regionName}</span>
                        <div class="flex items-center gap-1">
                          <Star class="fill-muted-foreground size-3" />
                          <span>{place.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </section>

          <!-- Premium Banner -->
          <!-- <div
            class="relative my-20 flex h-64 w-full items-center rounded-xl border border-[#bee9a6] bg-[#fafdf8] px-8"
          >
            <div
              class="text-secondary flex w-full items-center justify-between"
            >
              <div class="flex items-center gap-5">
                <div class="shrink-0">
                  <Sparkles class="size-12" />
                </div>
                <div class="flex flex-col gap-2">
                  <h2 class="text-4xl font-semibold">
                    Claim your business with <span class="text-primary"
                      >premium</span
                    >
                  </h2>
                  <p class="text-lg">
                    Upgrade to <span class="text-primary font-semibold"
                      >premium</span
                    > to claim, create, manage events and adverts for your businesses.
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="lg"
                >Go Premium <ArrowRight class="h-4 w-4" /></Button
              >
            </div>
          </div> -->

          <!-- Places Filter -->
          <section class="my-20">
            <div>
              <div class="flex items-center justify-between gap-2 border-b">
                <div class="mb-2 flex items-center justify-between gap-2">
                  <MapPinHouse />
                  <h2 class="text-2xl font-bold">
                    Places in {location.data.name}
                  </h2>
                </div>
                <a
                  href={`/explore?location=${location.data.name.toLowerCase()}`}
                  class="hover:underline">View all</a
                >
              </div>
              <div class="mb-2 mt-3 flex items-center gap-2">
                <Button
                  variant={currentPlaceFilter === "popular"
                    ? "default"
                    : "outline"}
                  size="sm"
                  onclick={() => setPlaceFilter("popular")}
                >
                  <Star />Popular
                </Button>
                <Button
                  variant={currentPlaceFilter === "new" ? "default" : "outline"}
                  size="sm"
                  onclick={() => setPlaceFilter("new")}
                >
                  <Bubbles />New
                </Button>
                <Button
                  variant={currentPlaceFilter === "verified"
                    ? "default"
                    : "outline"}
                  size="sm"
                  onclick={() => setPlaceFilter("verified")}
                >
                  <BadgeCheck />Verified
                </Button>
                <Button
                  variant={currentPlaceFilter === "surprise"
                    ? "default"
                    : "outline"}
                  size="sm"
                  onclick={() => setPlaceFilter("surprise")}
                >
                  <PartyPopper /> Surprise
                </Button>
              </div>
            </div>
            {#if locationPlaces.isLoading}
              <div class="flex min-h-50 w-full items-center justify-center">
                <Spinner />
              </div>
            {:else if locationPlaces.isSuccess}
              {#if locationPlaces.data.places && locationPlaces.data.places.length > 0}
                <div class="my-5 grid grid-cols-4 gap-4">
                  {#each locationPlaces.data.places as place}
                    <PlaceCard
                      id={place.id}
                      name={place.name}
                      rating={place.rating}
                      slug={place.slug}
                      cityName={place.cityName}
                      regionName={place.regionName}
                      imageId={place.imageId}
                      {user}
                      types={place.types}
                      isSaved={place.isSaved}
                      locationPath={place.locationPath}
                      isVerified={place.isVerified}
                    />
                  {/each}
                </div>
                {#if locationPlaces.data.places.length === 20}
                  {#if currentPlaceFilter === "popular"}
                    <a
                      href={`/explore?location=${location.data.name.toLowerCase()}&minRating=4`}
                      class="hover:underline"
                    >
                      <Button>View More</Button>
                    </a>
                  {:else if currentPlaceFilter === "new"}
                    <a
                      href={`/explore?location=${location.data.name.toLowerCase()}&isNew=true`}
                      class="hover:underline"
                    >
                      <Button>View More</Button>
                    </a>
                  {:else if currentPlaceFilter === "verified"}
                    <a
                      href={`/explore?location=${location.data.name.toLowerCase()}&isVerified=true`}
                      class="hover:underline"
                    >
                      <Button>View More</Button>
                    </a>
                  {/if}
                {/if}
              {:else}
                <p class="my-10 text-center text-muted-foreground">
                  No places found in this location
                </p>
              {/if}
            {/if}

            <!-- Events filtering -->
          </section>
        </div>
      </div>
    </div>
  {/if}
</ErrorBoundary>
