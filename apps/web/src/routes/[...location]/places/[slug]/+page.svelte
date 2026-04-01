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
  import type { BAUser, PlaceReview, PlaceWithDetails } from "@woofs/types";
  import type { Tab } from "@woofs/types";
  import { classNames, cn } from "$lib/utils";
  import PlaceHours from "./components/place-hours.svelte";
  import PlaceDetails from "./components/place-details.svelte";
  import PlaceDescription from "./components/place-description.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { PUBLIC_MAPBOX_API_KEY } from "$env/static/public";
  import PlaceMap from "$lib/components/place-map.svelte";
  import PlaceReviewStats from "./components/place-review-stats.svelte";
  import PlaceReviews from "./components/place-reviews.svelte";
  import ReviewDrawer from "$lib/components/review-drawer.svelte";
  import StickyHeader from "./components/sticky-header.svelte";
  import {
    Check,
    CircleCheck,
    Droplet,
    Globe,
    Grip,
    Heart,
    Mail,
    Map,
    MapPin,
    Maximize2,
    Phone,
    Share,
    SquarePen,
    Star,
  } from "@lucide/svelte";
  import PlaceMapDialog from "./components/place-map-dialog.svelte";
  import { map } from "zod";
  import { Separator } from "$lib/components/ui/separator";
  import RecommendedPlaces from "./components/recommended-places.svelte";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { ArrowLeft } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge";

  const mapboxToken = PUBLIC_MAPBOX_API_KEY;

  interface Props {
    data: {
      user: BAUser | null;
      slug: string;
      locationPath: string;
      initialPlace: PlaceWithDetails;
      reviewId: string | null;
    };
  }

  const tabs: Tab[] = [
    { name: "About", href: "#about" },
    { name: "Dog Policy", href: "#dog-policy" },
    { name: "Reviews", href: "#reviews" },
  ];

  const { data }: Props = $props();
  const { user, slug, locationPath, initialPlace, reviewId } = $derived(data);

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
  let reviewDrawerOpen = $state<boolean>(false);

  const coordinates = $derived(() => {
    if (place.isSuccess && place.data.latitude && place.data.longitude) {
      return {
        lat: parseFloat(place.data.latitude),
        lng: parseFloat(place.data.longitude),
      };
    }
    return null;
  });

  const openReviewDrawer = (rating: number = 0) => {
    reviewDrawerOpen = true;
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
    <!-- Sticky Header (desktop only) -->
    <div class="hidden lg:block">
      <StickyHeader
        placeName={place.data.name}
        {user}
        placeId={place.data.id}
        {currentTab}
        {tabs}
        {headerElement}
        {scrollY}
        {showStickyHeader}
        isSaved={place.data.isSaved}
        modalOpen={reviewDrawerOpen || imagesOpen || mapOpen}
      />
    </div>

    <!-- ===================== MOBILE LAYOUT ===================== -->
    <div class="lg:hidden pb-32">
      <!-- Mobile Top Nav -->
      <nav
        class="fixed top-0 w-full z-50 bg-[#fcf9f5]/70 backdrop-blur-md flex items-center justify-between px-6 h-16"
      >
        <div class="flex items-center gap-2">
          <button
            onclick={() => history.back()}
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-subtle transition-colors"
          >
            <ArrowLeft class="size-5 text-primary" />
          </button>
          <span class="text-2xl font-bold font-serif italic text-primary"
            >{place.data.name}</span
          >
        </div>
        <div class="flex gap-2">
          <ShareButton url={page.url.href} name={place.data.name} />
          <SaveButton
            {user}
            placeId={place.data.id}
            isSaved={place.data.isSaved}
          />
        </div>
      </nav>

      <!-- Hero Image -->
      <header class="relative w-full h-99.25 mt-0 overflow-hidden">
        {#if place.data.images[0]}
          <OptimizedImage
            imageId={place.data.images[0].imageId}
            alt={place.data.images[0].caption || place.data.name}
            class="h-full w-full object-cover"
            width="100%"
            height="100%"
          />
        {/if}
        <div
          class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none"
        ></div>
        {#if place.data.memberFavourite}
          <div class="absolute top-20 left-6">
            <span
              class="bg-tertiary-dim text-on-tertiary-fixed px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-lg"
            >
              ★ MEMBER FAVORITE
            </span>
          </div>
        {/if}
        <div class="absolute top-20 right-6">
          <button
            class="bg-white text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-lg"
          >
            <Grip class="size-4" />
            View all photos
          </button>
        </div>
        <div class="absolute bottom-6 left-6 right-6">
          <h1
            class="text-white font-headline font-bold text-4xl leading-tight drop-shadow-md"
          >
            {place.data.name}
          </h1>
          <p class="text-white/90 font-body">
            {place.data.location.name}, {place.data.region.name}
          </p>
        </div>
      </header>

      <!-- Main Content -->
      <main class="px-6 -mt-4 relative z-10 bg-surface rounded-t-3xl pt-8">
        <!-- Rating + Status -->
        <section
          class="flex items-center justify-between mb-8 bg-surface-subtleest p-4 rounded-2xl shadow-sm"
        >
          <div class="flex items-center gap-2">
            <span class="text-4xl font-bold text-primary font-headline"
              >{Number(place.data.rating).toFixed(1)}</span
            >
            <div class="flex flex-col gap-2">
              <div class="flex text-tertiary">
                {#each Array.from({ length: Number(Math.round(place.data.rating)) }, (_, i) => i + 1) as _}
                  <Star
                    class="size-3.5 mr-1 fill-tertiary-text-muted text-tertiary-text-muted"
                  />
                {/each}
              </div>
              <div class="flex items-center gap-2">
                {#each place.data.types as type}
                  <Badge class="rounded-full">{type}</Badge>
                {/each}
              </div>
            </div>
          </div>
        </section>

        <!-- Feature Badges -->
        <section class="flex flex-wrap gap-2 mb-10">
          <span
            class="bg-primary-fixed text-primary-text-muted px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
          >
            <CircleCheck class="size-4" /> Indoor Seating Allowed
          </span>
          <span
            class="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
          >
            <Droplet class="size-4" /> Water Provided
          </span>
        </section>

        <!-- About / The Story -->
        <section class="mb-10">
          <h2 class="font-headline font-bold text-2xl text-primary mb-4">
            About
          </h2>
          <p class="text-text-subtle leading-relaxed text-sm font-body">
            {place.data.description}
          </p>
        </section>

        <!-- Opening Hours -->
        <section class="mb-10">
          <PlaceHours hours={place.data.hours} />
        </section>

        <!-- Contact & Location Bento -->
        <section class="grid grid-cols-2 gap-4 mb-10">
          <!-- Address + Map -->
          <div
            class="bg-surface-subtleest p-4 rounded-2xl shadow-sm col-span-2"
          >
            {#if place.data.address}
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"
                >
                  <MapPin class="text-primary size-5" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase text-primary tracking-widest"
                  >
                    Address
                  </p>
                  <p class="text-sm font-semibold font-body">
                    {place.data.address}
                  </p>
                </div>
              </div>
            {/if}
            {#if coordinates() !== null}
              {@const coords = coordinates()}
              <div class="w-full h-64 rounded-xl overflow-hidden">
                <PlaceMap
                  accessToken={mapboxToken}
                  lng={coords!.lng}
                  lat={coords!.lat}
                  zoom={14}
                  markerLabel={place.data.name}
                  className="h-32 z-0"
                />
              </div>
              <div class="mt-6 flex items-center justify-center">
                <Button class="w-full">
                  View Map
                  <Map class="size-4" />
                </Button>
              </div>
            {/if}
          </div>
          {#if place.data.email}
            <a
              href="mailto:{place.data.email}"
              class="bg-surface-subtleest p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Mail class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-secondary tracking-widest"
                >Email</span
              >
            </a>
          {/if}
          <!-- Call -->
          {#if place.data.phone}
            <a
              href="tel:{place.data.phone}"
              class="bg-surface-subtleest p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Phone class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-secondary tracking-widest"
                >Phone</span
              >
            </a>
          {/if}
          <!-- Website -->
          {#if place.data.website}
            <a
              href={place.data.website}
              target="_blank"
              rel="noopener noreferrer"
              class="bg-surface-subtleest p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Globe class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-secondary tracking-widest"
                >Website</span
              >
            </a>
          {/if}
        </section>

        <!-- Pawsome Rules -->
        <section class="mb-10">
          <h2 class="font-headline font-bold text-2xl text-primary mb-4">
            Pawsome Rules
          </h2>
          <ul class="space-y-4">
            <li class="flex gap-3">
              <CircleCheck
                class="size-5 text-tertiary-dim shrink-0 mt-0.5 stroke-background fill-tertiary-dim"
              />
              <p class="text-sm text-text-subtle font-body">
                Leashes required at all times indoors.
              </p>
            </li>
            <li class="flex gap-3">
              <CircleCheck
                class="size-5 text-tertiary-dim shrink-0 mt-0.5 stroke-background fill-tertiary-dim"
              />
              <p class="text-sm text-text-subtle font-body">
                Please keep paws on the floor (no chairs).
              </p>
            </li>
            <li class="flex gap-3">
              <CircleCheck
                class="size-5 text-tertiary-dim shrink-0 mt-0.5 stroke-background fill-tertiary-dim"
              />
              <p class="text-sm text-text-subtle font-body">
                Dogs must be supervised by owners.
              </p>
            </li>
          </ul>
        </section>

        <!-- Community Reviews -->
        <section class="mb-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-headline font-bold text-2xl text-primary">
              Community reviews
            </h2>
            <button
              onclick={() => openReviewDrawer(0)}
              class="text-primary text-xs font-bold underline"
              >Write Review</button
            >
          </div>
          <PlaceReviews
            placeId={place.data.id}
            placeName={place.data.name}
            {user}
            reviewCount={place.data.reviewsCount}
            {reviewDrawerOpen}
            {openReviewDrawer}
            {reviewId}
          />
        </section>

        <!-- Similar Places -->
        <RecommendedPlaces placeId={place.data.id} {user} />
      </main>

      <MobileBottomNav {user} />
    </div>
    <!-- ===================== END MOBILE LAYOUT ===================== -->

    <Navbar {user} />
    <div class="hidden lg:block mx-auto w-full max-w-screen-2xl px-8">
      <div class="py-2 lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1 mt-1.5">
          <Breadcrumbs items={place.data.breadcrumbs} location={false} />

          <!-- image grid -->
          <ImageGrid
            images={place.data.images}
            {openImageDrawer}
            placeName={place.data.name}
            placeCity={place.data.location.name}
            placeRegion={place.data.region.name}
            memberFavourite={place.data.memberFavourite}
            {user}
            placeId={place.data.id}
            isSaved={place.data.isSaved}
          />
          <ImageDrawer images={place.data.images} bind:imagesOpen />
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Content Column -->
            <div class="lg:col-span-8">
              <div
                class="bg-surface-subtle rounded-xl p-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="bg-tertiary-dim p-4 rounded-xl flex flex-col items-center justify-center text-on-tertiary-fixed"
                  >
                    <span class="text-2xl font-bold font-headline"
                      >{Number(place.data.rating).toFixed(1)}</span
                    >
                    <div class="flex">
                      {#each Array.from({ length: Number(Math.round(place.data.rating)) }, (_, i) => i + 1) as star}
                        <Star class="size-3.5 fill-foreground" />
                      {/each}
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      {#each place.data.types as type}
                        <Badge class="rounded-full">{type}</Badge>
                      {/each}
                    </div>
                    <p class="text-text-subtle font-body">
                      Based on {place.data.reviewsCount} community reviews
                    </p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-3">
                  <span
                    class="px-4 py-2 bg-primary-fixed text-primary-text rounded-full text-sm font-medium flex items-center gap-2 font-body"
                  >
                    <CircleCheck class="size-4" />
                    Indoor Seating Allowed
                  </span>
                  <span
                    class="px-4 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-full text-sm font-medium flex items-center gap-2 font-body"
                  >
                    <Droplet class="size-4" />
                    Water Provided
                  </span>
                </div>
              </div>

              <!-- About -->
              <div class="mb-12">
                <h3 class="text-3xl font-headline font-bold mb-6">About</h3>
                <div
                  class="prose prose-stone max-w-none text-text-subtle font-body leading-relaxed space-y-4"
                >
                  <p>{place.data.description}</p>
                </div>
              </div>

              <!-- Community Review Section -->
              <div class="pt-12 border-t border-border-subtle/30 space-y-12">
                <!-- Section Header & Rating Summary -->
                <div
                  class="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                  <div>
                    <h3 class="text-3xl font-headline font-bold mb-2">
                      Community Reviews
                    </h3>
                    <div class="flex items-center gap-4">
                      <div
                        class="flex items-center text-tertiary-text-muted"
                      >
                        <span class="text-3xl font-bold font-headline mr-2"
                          >{Number(place.data.rating).toFixed(1)}</span
                        >
                        <div class="flex">
                          {#each Array.from({ length: Number(Math.round(place.data.rating)) }, (_, i) => i + 1) as star}
                            <Star
                              class="size-4 fill-tertiary-text-muted mr-1"
                            />
                          {/each}
                        </div>
                      </div>
                      <span class="text-text-subtle font-body"
                        >{place.data.reviewsCount} reviews total</span
                      >
                    </div>
                  </div>
                  {#if user}
                    <Button onclick={() => openReviewDrawer(0)}
                      ><SquarePen />Write a Review</Button
                    >
                  {:else}
                    <a
                      href={`/sign-in?redirect=${page.url.pathname}`}
                      class={cn(buttonVariants({ variant: "default" }))}
                      ><SquarePen />Write a Review</a
                    >
                  {/if}
                </div>

                <!-- Review List -->
                <div class="space-y-8">
                  <PlaceReviews
                    placeId={place.data.id}
                    placeName={place.data.name}
                    {user}
                    reviewCount={place.data.reviewsCount}
                    {reviewDrawerOpen}
                    {openReviewDrawer}
                    {reviewId}
                  />
                </div>
              </div>
            </div>

            <!-- Right Sidebar Column -->
            <div class="lg:col-span-4 space-y-8">
              <!-- Opening Hours Card -->
              <PlaceHours hours={place.data.hours} />
              <!-- Contact & Connect Card -->
              <div
                class="bg-surface-subtleest border border-border-subtle/10 rounded-2xl p-6 shadow-sm"
              >
                <h4 class="text-xl font-headline font-bold mb-6">Contact</h4>
                <div class="space-y-4">
                  {#if place.data.address}
                    <div class="flex items-start gap-4">
                      <div class="bg-primary/10 p-2 rounded-lg">
                        <MapPin class="text-primary" />
                      </div>
                      <div>
                        <p class="font-bold text-sm font-body">Address</p>
                        <p class="text-xs text-text-subtle font-body">
                          {place.data.address}
                        </p>
                      </div>
                    </div>
                  {/if}
                  {#if place.data.phone}
                    <div class="flex items-start gap-4">
                      <div class="bg-primary/10 p-2 rounded-lg">
                        <Phone class="text-primary" />
                      </div>
                      <div>
                        <p class="font-bold text-sm font-body">Phone</p>
                        <p class="text-xs text-text-subtle font-body">
                          {place.data.phone}
                        </p>
                      </div>
                    </div>
                  {/if}
                  {#if place.data.email}
                    <div class="flex items-start gap-4">
                      <div class="bg-primary/10 p-2 rounded-lg">
                        <Mail class="text-primary" />
                      </div>
                      <div>
                        <p class="font-bold text-sm font-body">Email</p>
                        <p class="text-xs text-text-subtle font-body">
                          {place.data.email}
                        </p>
                      </div>
                    </div>
                  {/if}
                  {#if place.data.website}
                    <div class="flex items-start gap-4">
                      <div class="bg-primary/10 p-2 rounded-lg">
                        <Globe class="text-primary" />
                      </div>
                      <div>
                        <p class="font-bold text-sm font-body">Website</p>
                        <a
                          class="text-xs text-primary font-body hover:underline"
                          href={place.data.website}>{place.data.website}</a
                        >
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
              <!-- Location & Amenities Card -->
              <div
                class="bg-surface-subtleest border border-border-subtle/10 rounded-2xl p-6 shadow-sm"
              >
                <h4 class="text-xl font-headline font-bold mb-6">Location</h4>
                <div
                  class="w-full h-48 bg-surface-raised rounded-xl mb-6 relative overflow-hidden"
                >
                  {#if coordinates() !== null}
                    {@const coords = coordinates()}
                    <PlaceMap
                      bind:this={mapComponent}
                      accessToken={mapboxToken}
                      lng={coords!.lng}
                      lat={coords!.lat}
                      zoom={15}
                      markerLabel={place.data.name}
                      className="h-96 z-0"
                    />
                  {/if}
                </div>
                <div class="flex items-center justify-center">
                  <Button class="w-full">
                    View Map
                    <Map class="size-4" />
                  </Button>
                </div>
              </div>

              <!-- Rules & Guidelines Card -->
              <div
                class="bg-secondary-container/30 rounded-2xl p-6 border border-secondary-container"
              >
                <h4
                  class="text-lg font-headline font-bold text-secondary-on-container mb-4 flex items-center gap-2"
                >
                  Pawsome Rules
                </h4>
                <ul class="space-y-3 font-body text-sm text-secondary">
                  <li class="flex gap-2">
                    <span class="font-bold">•</span>
                    Leashes required at all times indoors.
                  </li>
                  <li class="flex gap-2">
                    <span class="font-bold">•</span>
                    Please keep paws on the floor (no chairs).
                  </li>
                  <li class="flex gap-2">
                    <span class="font-bold">•</span>
                    Dogs must be supervised by owners.
                  </li>
                  <li class="flex gap-2">
                    <span class="font-bold">•</span>
                    "Accident" cleaning kits available if needed!
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Similar Places Section -->
          <RecommendedPlaces placeId={place.data.id} {user} />

          <!-- Footer -->
          <Footer />
        </div>
      </div>
    </div>
    <!-- Review Drawer/Dialog -->
    <ReviewDrawer
      open={reviewDrawerOpen}
      onOpenChange={(open) => (reviewDrawerOpen = open)}
      placeId={place.data.id}
      placeName={place.data.name}
    />
    {#if coordinates() !== null}
      {@const coords = coordinates()}
      <PlaceMapDialog
        open={mapOpen}
        lng={coords!.lng}
        lat={coords!.lat}
        accessToken={mapboxToken}
        place={place.data}
        onOpenChange={(open) => (mapOpen = open)}
      />
    {/if}
  {/if}
</ErrorBoundary>
