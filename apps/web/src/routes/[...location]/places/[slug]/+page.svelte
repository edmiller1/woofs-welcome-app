<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import ImageGrid from "$lib/components/image-grid.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import SaveButton from "$lib/components/save-button.svelte";
  import ShareButton from "$lib/components/share-button.svelte";
  import ImageDrawer from "$lib/components/image-drawer.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, PlaceWithDetails } from "@woofs/types";
  import type { Tab } from "@woofs/types";
  import { classNames } from "$lib/utils";
  import PlaceHours from "./components/place-hours.svelte";
  import PlaceDetails from "./components/place-details.svelte";
  import PlaceDescription from "./components/place-description.svelte";
  import { Button } from "$lib/components/ui/button";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import PlaceMap from "$lib/components/place-map.svelte";
  import PlaceReviewStats from "./components/place-review-stats.svelte";
  import PlaceReviews from "./components/place-reviews.svelte";

  const mapboxToken = PUBLIC_MAPBOX_API_KEY;

  interface Props {
    data: {
      user: BAUser | null;
      slug: string;
      locationPath: string;
      initialPlace: PlaceWithDetails;
    };
  }

  const tabs: Tab[] = [
    { name: "About", href: "#about" },
    { name: "Dog Policy", href: "#dog-policy" },
    { name: "Reviews", href: "#reviews" },
  ];

  const { data }: Props = $props();
  const { user, slug, locationPath, initialPlace } = $derived(data);

  const place = createQuery(() => ({
    queryKey: ["place", locationPath, slug],
    queryFn: () => api.place.getPlace(`${locationPath}/${slug}`),
    initialData: initialPlace,
  }));

  let imagesOpen = $state<boolean>(false);
  let currentTab = $state<string>("About");
  let mapComponent = $state<any>();
  let scrollY = $state(0);
  let headerElement = $state<HTMLElement>();
  let showStickyHeader = $state(false);
  let mapOpen = $state<boolean>(false);
  let currentPage = $state<number>(1);

  const coordinates = $derived(() => {
    if (place.isSuccess && place.data.latitude && place.data.longitude) {
      return {
        lat: parseFloat(place.data.latitude),
        lng: parseFloat(place.data.longitude),
      };
    }
    return null;
  });

  const changePage = (newPage: number) => {
    currentPage = newPage;
  };

  $effect(() => {
    const hash = page.url.hash;
    if (hash) {
      const match = tabs.find((t) => t.href === hash);
      if (match) {
        currentTab = match.name;
      }
    }
  });

  const openImageDrawer = () => {
    imagesOpen = true;
  };

  const handleMapOpen = () => {
    mapOpen = true;
  };

  $effect(() => {
    if (headerElement && scrollY > 0) {
      const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
      showStickyHeader = scrollY > headerBottom;
    }
  });
</script>

<svelte:window bind:scrollY />

<ErrorBoundary error={place.error}>
  {#if place.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if place.isSuccess}
    <!-- Sticky Header -->
    <div class="mx-auto max-w-375 px-2 sm:px-4 lg:px-8">
      <Navbar {user} />

      <div class="py-2 lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <Breadcrumbs items={place.data.breadcrumbs} />
          <div
            bind:this={headerElement}
            class="my-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <h2
                class="text-2xl/7 font-bold sm:truncate sm:text-4xl sm:tracking-tight"
              >
                {place.data.name}
              </h2>
            </div>
            <div class="flex items-center gap-4">
              <ShareButton url={page.url.href} name={place.data.name} />
              <SaveButton
                {user}
                placeId={place.data.id}
                isSaved={place.data.isSaved}
              />
            </div>
          </div>

          <!-- image grid -->
          <ImageGrid images={place.data.images} {openImageDrawer} />
          <ImageDrawer images={place.data.images} bind:imagesOpen />
          <div class="flex">
            <div class="mr-3 w-2/3">
              <div class="hidden sm:block">
                <div class="border-b border-gray-200 dark:border-white/10">
                  <nav
                    aria-label="Tabs"
                    class="-mb-px flex space-x-8 font-semibold"
                  >
                    {#each tabs as tab}
                      <a
                        href={tab.href}
                        aria-current={currentTab === tab.name
                          ? "page"
                          : undefined}
                        class={classNames(
                          currentTab === tab.name
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 px-1 py-4 text-sm",
                        )}>{tab.name}</a
                      >
                    {/each}
                  </nav>
                </div>
              </div>
              <!-- Main details -->
              <div id="about" data-tab="About" class="py-4">
                <PlaceDetails
                  address={place.data.address}
                  website={place.data.website ?? ""}
                  email={place.data.email}
                  phone={place.data.phone ?? ""}
                />
                <PlaceDescription description={place.data.description} {user} />
              </div>
              <!-- Dog Policy -->
              <div id="dog-policy" data-tab="Dog Policy" class="py-4">
                <h3 class="text-2xl font-semibold">Dog Policy</h3>
                {#if place.data.dogPolicy}
                  <div
                    class="mt-4 rounded-lg border border-primary bg-accent p-4"
                  >
                    <p class="text-primary">
                      {place.data.dogPolicy}
                    </p>
                  </div>
                  <div class="mt-4 flex gap-4">
                    {#if place.data.indoorAllowed}
                      <div
                        class="flex items-center gap-2 text-green-700 dark:text-green-400"
                      >
                        <div class="h-2 w-2 rounded-full bg-green-500"></div>
                        <span class="text-sm">Indoor allowed</span>
                      </div>
                    {/if}
                    {#if place.data.outdoorAllowed}
                      <div
                        class="flex items-center gap-2 text-green-700 dark:text-green-400"
                      >
                        <div class="h-2 w-2 rounded-full bg-green-500"></div>
                        <span class="text-sm">Outdoor allowed</span>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <p class="mt-2 italic text-gray-500 dark:text-gray-400">
                    Dog policy information not available.
                  </p>
                {/if}
              </div>
            </div>
            <div class="flex w-1/3 flex-col gap-5">
              <!-- Hours -->
              {#if place.data.hours}
                <PlaceHours hours={place.data.hours} />
              {/if}
              <!-- Map -->
              {#if coordinates() !== null}
                {@const coords = coordinates()}
                <div class="rounded-xl border p-4 shadow">
                  <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold">Location</h4>
                    <Button
                      variant="link"
                      class="rounded-full px-0"
                      onclick={handleMapOpen}
                      >View larger map
                    </Button>
                  </div>
                  <PlaceMap
                    bind:this={mapComponent}
                    accessToken={mapboxToken}
                    lng={coords!.lng}
                    lat={coords!.lat}
                    zoom={15}
                    markerLabel={place.data.name}
                    className="h-96"
                  />
                </div>
              {:else}
                <div class="mt-4 text-red-600">Location not available</div>
              {/if}
            </div>
          </div>
          <!-- Reviews -->
          <div id="reviews" data-tab="Reviews" class="py-4">
            <PlaceReviewStats
              placeId={place.data.id}
              placeSlug={place.data.slug}
              reviewStats={place.data.reviewStats}
            />
            <PlaceReviews
              {user}
              placeId={place.data.id}
              placeName={place.data.name}
              reviewCount={place.data.reviewsCount}
            />
          </div>
        </div>
      </div>
      <!-- Footer -->
    </div>
  {/if}
</ErrorBoundary>
