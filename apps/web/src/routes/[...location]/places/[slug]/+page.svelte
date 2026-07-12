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
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, PlaceWithDetails } from "@woofs/types";
  import type { Tab } from "@woofs/types";
  import { cn } from "$lib/utils";
  import PlaceHours from "./components/place-hours.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import PlaceMap from "$lib/components/place-map.svelte";
  import PlaceReviews from "./components/place-reviews.svelte";
  import ReviewDrawer from "$lib/components/review-drawer.svelte";
  import StickyHeader from "./components/sticky-header.svelte";
  import {
    CircleCheck,
    Globe,
    Images,
    Mail,
    Map,
    MapPin,
    Pencil,
    Phone,
    ShieldAlert,
    Star,
  } from "@lucide/svelte";
  import PlaceMapDialog from "./components/place-map-dialog.svelte";
  import RecommendedPlaces from "./components/recommended-places.svelte";
  import Footer from "$lib/components/footer.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import SuggestEditDialog from "$lib/components/suggest-edit-dialog.svelte";
  import { buildImageUrl } from "@woofs/image-config";

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
  let suggestEditOpen = $state<boolean>(false);
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

<svelte:head>
  <title>{initialPlace.name} — Dog-Friendly | Woofs Welcome</title>
  <meta
    name="description"
    content={initialPlace.description
      ? initialPlace.description.slice(0, 155)
      : `${initialPlace.name} is a dog-friendly place in New Zealand. Read reviews, see photos and find out more on Woofs Welcome.`}
  />
  <meta
    property="og:title"
    content="{initialPlace.name} — Dog-Friendly | Woofs Welcome"
  />
  <meta
    property="og:description"
    content={initialPlace.description
      ? initialPlace.description.slice(0, 155)
      : `${initialPlace.name} is a dog-friendly place in New Zealand. Read reviews, see photos and find out more on Woofs Welcome.`}
  />
  {#if initialPlace.images?.[0]}
    <meta
      property="og:image"
      content={buildImageUrl(initialPlace.images[0].imageId, "medium")}
    />
  {/if}
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://woofswelcome.app/location/{locationPath}/places/{slug}"
  />
  <link
    rel="canonical"
    href="https://woofswelcome.app/location/{locationPath}/places/{slug}"
  />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: initialPlace.name,
    description: initialPlace.description || undefined,
    url: `https://woofswelcome.app/location/${locationPath}/places/${slug}`,
    ...(initialPlace.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: initialPlace.address,
            addressCountry: initialPlace.countryCode,
          },
        }
      : {}),
    ...(initialPlace.phone ? { telephone: initialPlace.phone } : {}),
    ...(initialPlace.email ? { email: initialPlace.email } : {}),
    ...(initialPlace.website ? { sameAs: initialPlace.website } : {}),
    ...(initialPlace.latitude && initialPlace.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: initialPlace.latitude,
            longitude: initialPlace.longitude,
          },
        }
      : {}),
    ...(initialPlace.images?.[0] ? { image: initialPlace.images[0] } : {}),
    ...(initialPlace.reviewsCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(initialPlace.rating).toFixed(1),
            reviewCount: initialPlace.reviewsCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  })}</script>`}
</svelte:head>

<svelte:window bind:scrollY />

<ErrorBoundary error={place.error}>
  {#if place.isLoading}
    <div class="lg:hidden pb-32">
      <Skeleton class="w-full h-99.25" />
      <div class="px-6 pt-8 space-y-4">
        <Skeleton class="h-10 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-4 w-full mt-6" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-5/6" />
      </div>
    </div>
    <div class="hidden lg:block mx-auto w-full max-w-screen-2xl px-8">
      <Skeleton class="h-6 w-64 mt-4 mb-6" />
      <div class="grid grid-cols-2 gap-2 mb-8">
        <Skeleton class="aspect-[1.4] rounded-xl" />
        <div class="grid grid-cols-2 gap-2">
          {#each Array(4) as _}
            <Skeleton class="aspect-square rounded-xl" />
          {/each}
        </div>
      </div>
      <div class="grid grid-cols-12 gap-12">
        <div class="col-span-8 space-y-4">
          <Skeleton class="h-16 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-full mt-8" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-5/6" />
        </div>
        <div class="col-span-4 space-y-4">
          <Skeleton class="h-48 rounded-2xl" />
          <Skeleton class="h-64 rounded-2xl" />
        </div>
      </div>
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
    <Navbar {user} />
    <div class="lg:hidden pb-32">
      <Breadcrumbs items={place.data.breadcrumbs} location={false} />
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
          <div class="absolute top-5 left-6">
            <span
              class="bg-secondary text-foreground px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-lg"
            >
              <Star class="size-3 text-foreground fill-foreground" /> MEMBER FAVOURITE
            </span>
          </div>
        {/if}
        <div class="absolute top-5 right-5">
          <button
            onclick={openImageDrawer}
            aria-label="View all images"
            class="bg-white text-foreground px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1 shadow-lg"
          >
            <Images class="size-4" />
            View all photos
          </button>
        </div>
        <div class="absolute bottom-10 left-5">
          <div class="flex gap-2">
            <ShareButton url={page.url.href} name={place.data.name} />
            <SaveButton
              {user}
              placeId={place.data.id}
              isSaved={place.data.isSaved}
            />
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="px-6 -mt-4 relative z-10 pt-8">
        <section class="px-margin-2">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="font-semibold text-4xl truncate">
                {place.data.name}
              </h2>
              <div class="flex items-center gap-2 mt-1 text-sm">
                <span class="flex items-center">
                  <MapPin class="size-4 text-foreground mr-1" />
                  <span class="text-foreground"
                    >{place.data.location.name}, {place.data.region.name}</span
                  >
                </span>
                <span>•</span>
                <Star class="size-4 text-foreground fill-foreground" />
                <span class="font-bold text-foreground"
                  >{Number(place.data.rating).toFixed(1)}</span
                >
                <a href="#reviews" class="opacity-70"
                  >({place.data.reviewsCount} reviews)</a
                >
                <span>•</span>
                <span
                  class="text-primary px-2 py-0.5 bg-muted-foreground/10 rounded-lg"
                  >$$</span
                >
              </div>
            </div>
            {#if user}
              <Button
                variant="ghost"
                size="sm"
                class="text-muted-foreground shrink-0 mt-2"
                onclick={() => (suggestEditOpen = true)}
              >
                <Pencil class="size-4" />
              </Button>
            {:else}
              <a
                href={`/sign-in?redirect=${page.url.pathname}`}
                class={cn(
                  buttonVariants({ variant: "ghost" }),
                  "text-muted-foreground shrink-0 mt-2",
                )}
              >
                <Pencil class="size-4" />
              </a>
            {/if}
          </div>
        </section>
        <!-- About -->
        <section class="mt-10">
          {#if place.data.description}
            <h2 class="font-bold text-2xl mb-4">About</h2>
            <p class=" leading-relaxed text-sm">
              {place.data.description}
            </p>
          {/if}
          <div class="my-6 space-y-3">
            <h4 class="text-xl font-semibold">Amenities</h4>
            <div class="flex flex-wrap gap-2">
              {#each place.data.dogAmenities as amenity}
                <li class="flex items-center gap-2 mb-2 text-sm font-medium">
                  <CircleCheck class="size-4 text-primary hrink-0" />
                  {amenity}
                </li>
              {/each}
            </div>
          </div>
        </section>

        <!-- Opening Hours -->
        <section class="mb-10">
          <PlaceHours hours={place.data.hours} />
        </section>

        <!-- Contact & Location Bento -->
        <section class="grid grid-cols-2 gap-4 mb-10">
          <!-- Address + Map -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border col-span-2">
            {#if place.data.address}
              <div class="flex items-center gap-3 mb-3">
                <div
                  class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"
                >
                  <MapPin class="text-primary-tint size-5" />
                </div>
                <div>
                  <p
                    class="text-[10px] font-bold uppercase text-primary-tint tracking-widest"
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
              <div class="w-full h-48 rounded-xl overflow-hidden">
                <PlaceMap
                  lng={coords!.lng}
                  lat={coords!.lat}
                  zoom={14}
                  markerLabel={place.data.name}
                  className="h-48 z-0"
                  onclick={handleMapOpen}
                />
              </div>
              <div class="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  class="flex-1"
                  onclick={handleMapOpen}
                >
                  <Map class="size-4" />
                  View Map
                </Button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${coords!.lat},${coords!.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={buttonVariants({
                    variant: "default",
                    class: "flex-1",
                  })}
                >
                  <MapPin class="size-4" />
                  Get Directions
                </a>
              </div>
            {/if}
          </div>
          {#if place.data.email}
            <a
              href="mailto:{place.data.email}"
              class="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Mail class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-primary tracking-widest"
                >Email</span
              >
            </a>
          {/if}
          <!-- Call -->
          {#if place.data.phone}
            <a
              href="tel:{place.data.phone}"
              class="bg-white p-4 border rounded-2xl shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Phone class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-primary tracking-widest"
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
              class="bg-white p-4 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center"
            >
              <Globe class="text-primary size-5 mb-2" />
              <span
                class="text-[10px] font-bold uppercase text-primary tracking-widest"
                >Website</span
              >
            </a>
          {/if}
        </section>

        <!-- Rules & Guidelines Card -->
        {#if place.data.dogRules && place.data.dogRules.length > 0}
          <div
            class="mb-10 bg-primary/10 rounded-3xl border-2 border-dashed border-primary p-4"
          >
            <div class="flex items-center gap-2 mb-2 text-primaryt">
              <ShieldAlert />
              <h3 class="font-semibold text-xl">Rules</h3>
            </div>
            <ul class="space-y-3 font-body text-sm text-primary">
              {#each place.data.dogRules as rule}
                <li class="flex gap-2">
                  <span class="font-bold">•</span>
                  {rule}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Community Reviews -->
        <section id="reviews" class="mb-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-headline font-bold text-2xl">Community reviews</h2>
            <button
              onclick={() => openReviewDrawer(0)}
              class="text-primary decoration-primary text-xs font-bold underline"
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
    </div>
    <!-- ===================== END MOBILE LAYOUT ===================== -->

    <div class="hidden lg:block mx-auto w-full max-w-screen-2xl px-8">
      <div class="py-2 lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1 mt-1.5">
          <div class="flex items-center justify-between">
            <Breadcrumbs items={place.data.breadcrumbs} location={false} />
            {#if user}
              <button
                class={cn(
                  buttonVariants({ variant: "link" }),
                  "group text-xs text-foreground hover:text-primary",
                )}
                onclick={() => (suggestEditOpen = true)}
                ><Pencil class="text-foreground group-hover:text-primary" /> Suggest
                an edit</button
              >
            {:else}
              <a
                href={`/sign-in?redirect=${page.url.pathname}`}
                class={cn(
                  buttonVariants({ variant: "link" }),
                  "group text-xs text-foreground hover:text-primary",
                )}
                ><Pencil class="text-foreground group-hover:text-primary" /> Suggest
                an edit</a
              >
            {/if}
          </div>

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

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <!-- Left Content Column -->
            <div class="lg:col-span-8">
              <h1 class="text-4xl md:text-6xl font-headline font-bold mb-4">
                {place.data.name}
              </h1>
              <div class="flex items-center gap-2 mb-4">
                <span class="flex items-center">
                  <MapPin class="size-4" />
                  <span class="ml-1"
                    >{place.data.location.name}, {place.data.region.name}</span
                  >
                </span>
                <span>•</span>
                <span class="flex items-center">
                  <Star class="size-4 text-primary fill-primary mr-1" />
                  <span class="font-bold"
                    >{Number(place.data.rating).toFixed(1)}</span
                  >
                  <span class="ml-1 opacity-70"
                    >({place.data.reviewsCount} reviews)</span
                  >
                </span>
                <span>•</span>
                <span class="font-label-md px-2 py-0.5 bg-input rounded-lg"
                  >$$</span
                >
              </div>
              <div class="flex flex-wrap gap-2 mb-6">
                {#each place.data.types as type}
                  <Badge variant="secondary" class="py-1.5">{type}</Badge>
                {/each}
              </div>

              <!-- About -->
              <div class="mb-12">
                {#if place.data.description}
                  <h3 class="text-3xl font-headline font-bold mb-3">About</h3>
                  <div
                    class="max-w-none text-text-subtle font-body leading-relaxed space-y-4"
                  >
                    <p>{place.data.description}</p>
                  </div>
                {/if}
                <ul class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-sm">
                  {#each place.data.dogAmenities as amenity}
                    <li
                      class="flex items-center gap-2 mb-2 text-base font-medium"
                    >
                      <CircleCheck class="size-5 text-primary hrink-0" />
                      {amenity}
                    </li>
                  {/each}
                </ul>
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
                      <div class="flex items-center text-primary-tint">
                        <span class="text-3xl font-bold font-headline mr-2"
                          >{Number(place.data.rating).toFixed(1)}</span
                        >
                        <div class="flex">
                          {#each Array.from({ length: Number(Math.round(place.data.rating)) }, (_, i) => i + 1) as star}
                            <Star
                              class="size-4 fill-primary text-primary mr-1"
                            />
                          {/each}
                        </div>
                      </div>
                      <span class="text-primary-tint font-body"
                        >{place.data.reviewsCount} reviews total</span
                      >
                    </div>
                  </div>
                  {#if user}
                    <Button
                      variant="link"
                      class="text-primary-tint decoration-primary-tint"
                      onclick={() => openReviewDrawer(0)}>Write a Review</Button
                    >
                  {:else}
                    <a
                      href={`/sign-in?redirect=${page.url.pathname}`}
                      class={cn(buttonVariants({ variant: "link" }))}
                      >Write a Review</a
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
                class="bg-white border border-border-subtle/10 rounded-2xl p-6 shadow-sm"
              >
                <h4 class="text-xl font-headline font-bold mb-6">Contact</h4>
                <div class="space-y-4">
                  {#if place.data.address}
                    <div class="flex items-start gap-4">
                      <div class="bg-primary/20 p-2 rounded-lg">
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
                      <div class="bg-primary/20 p-2 rounded-lg">
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
                      <div class="bg-primary/20 p-2 rounded-lg">
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
                      <div class="bg-primary/20 p-2 rounded-lg">
                        <Globe class="text-primary" />
                      </div>
                      <div>
                        <p class="font-bold text-sm font-body">Website</p>
                        <a
                          class="text-xs text-primary-tint font-body hover:underline"
                          href={place.data.website}
                          target="_blank">{place.data.website}</a
                        >
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
              <!-- Location & Amenities Card -->
              <div
                class="bg-white border border-border-subtle/10 rounded-2xl p-6 shadow-sm"
              >
                <h4 class="text-xl font-headline font-bold mb-6">Location</h4>
                {#if coordinates() !== null}
                  {@const coords = coordinates()}
                  <div class="w-full h-48 rounded-xl mb-3 overflow-hidden">
                    <PlaceMap
                      bind:this={mapComponent}
                      lng={coords!.lng}
                      lat={coords!.lat}
                      zoom={15}
                      markerLabel={place.data.name}
                      className="h-48 z-0"
                      onclick={handleMapOpen}
                    />
                  </div>
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      class="flex-1"
                      onclick={handleMapOpen}
                    >
                      <Map class="size-4" />
                      View Map
                    </Button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${coords!.lat},${coords!.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class={buttonVariants({
                        variant: "default",
                        class: "flex-1",
                      })}
                    >
                      <MapPin class="size-4" />
                      Get Directions
                    </a>
                  </div>
                {/if}
              </div>

              <!-- Rules & Guidelines Card -->
              {#if place.data.dogRules && place.data.dogRules.length > 0}
                <div
                  class="bg-primary/10 rounded-3xl border-2 border-dashed border-primary p-4"
                >
                  <div class="flex items-center gap-2 mb-2 text-primary">
                    <ShieldAlert />
                    <h3 class="font-semibold text-xl">Rules</h3>
                  </div>
                  <ul class="space-y-3 font-body text-sm text-primary-tint">
                    {#each place.data.dogRules as rule}
                      <li class="flex gap-2">
                        <span class="font-bold">•</span>
                        {rule}
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          </div>

          <!-- Similar Places Section -->
          <RecommendedPlaces placeId={place.data.id} {user} />
        </div>
      </div>
    </div>
    <!-- Footer -->
    <Footer />
    <!-- Review Drawer/Dialog -->
    <ReviewDrawer
      open={reviewDrawerOpen}
      onOpenChange={(open) => (reviewDrawerOpen = open)}
      placeId={place.data.id}
      placeName={place.data.name}
      {user}
    />
    {#if coordinates() !== null}
      {@const coords = coordinates()}
      <PlaceMapDialog
        open={mapOpen}
        lng={coords!.lng}
        lat={coords!.lat}
        place={place.data}
        onOpenChange={(open) => (mapOpen = open)}
      />
    {/if}

    {#if user}
      <SuggestEditDialog bind:open={suggestEditOpen} place={place.data} />
    {/if}
  {/if}
</ErrorBoundary>
