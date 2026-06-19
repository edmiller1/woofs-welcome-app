<script lang="ts">
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import hero from "$lib/assets/hero.jpg";
  import { ArrowRight, MapPin } from "@lucide/svelte";
  import type { FeaturedLocation, PopularPlace } from "@woofs/types";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import PlaceCard from "$lib/components/place-card.svelte";

  let { data } = $props();
  const user = $derived(data.user);
  const featuredLocations = $derived(
    (data.featuredLocations ?? []) as FeaturedLocation[],
  );
  const popularPlaces = $derived((data.popularPlaces ?? []) as PopularPlace[]);
  const row1 = $derived(featuredLocations.slice(0, 2));
  const row2 = $derived(featuredLocations.slice(2, 4));
</script>

<div class="bg-background min-h-screen">
  <HomeNavbar {user} />

  <main class="pt-18 pb-16">
    <!-- Hero Section -->
    <section
      class="relative h-217.5 w-full overflow-hidden flex items-center px-5 md:px-12"
    >
      <div class="absolute inset-0 z-0">
        <img
          class="w-full h-full object-cover hero-mask"
          alt="A majestic Australian Shepherd sitting on a rocky overlook at sunrise with misty evergreen forests behind them."
          src={hero}
        />
        <div
          class="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent"
        ></div>
      </div>

      <div class="relative z-10 max-w-2xl space-y-6">
        <h1
          class="font-headline text-5xl md:text-[48px] md:leading-14 font-extrabold text-on-surface tracking-tight"
        >
          Adventure is better with <span class="text-primary">four paws.</span>
        </h1>
        <p class="font-body text-lg leading-7 text-on-surface-variant">
          Discover thousands of verified dog-friendly trails, hidden parks, and
          local outdoor communities tailored for you and your best friend.
        </p>
        <div class="flex flex-col sm:flex-row gap-2 pt-6">
          <a
            href="/explore"
            class="px-16 py-3 text-center bg-primary hover:bg-primary/90 text-white font-headline font-bold text-base rounded-full shadow-lg active:scale-95 transition-transform duration-200 cursor-pointer"
          >
            Start Exploring
          </a>
          <!-- <a
            href="/community"
            class="px-16 py-3 text-center border-2 border-primary text-primary font-headline font-bold text-base rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
          >
            Community
          </a> -->
        </div>
      </div>
    </section>

    <!-- Featured Destinations Bento Grid -->
    <section class="px-5 md:px-12 py-16 space-y-10">
      <div class="flex justify-between items-end">
        <div class="space-y-1">
          <h2
            class="font-headline text-[32px] leading-10 font-bold text-on-surface"
          >
            Featured Destinations
          </h2>
          <p class="font-body sm:text-base text-sm">
            Dog-friendly locations for your next adventure or relaxing day out.
          </p>
        </div>
        <button
          class="text-primary font-label sm:text-sm text-xs font-semibold flex items-center gap-1 hover:underline transition-all cursor-pointer"
        >
          View more <ArrowRight class="size-4" />
        </button>
      </div>

      {#if featuredLocations.length > 0}
        <div class="flex flex-col gap-2">
          <!-- Row 1: wide left, narrow right -->
          <div class="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-2 h-96">
            {#each row1 as loc, i}
              <a
                href={`/location/${loc.path}`}
                class="group relative rounded-3xl h-full cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all border border-outline/10"
              >
                {#if loc.image}
                  <OptimizedImage
                    class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    alt={loc.name}
                    imageId={loc.image}
                    height="100%"
                  />
                {:else}
                  <div
                    class="w-full h-full bg-muted flex items-center justify-center"
                  >
                    <MapPin class="size-12 text-muted-foreground/30" />
                  </div>
                {/if}
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
                ></div>
                <div
                  class="absolute bottom-0 left-0 {i === 0
                    ? 'p-6'
                    : 'p-5'} text-white"
                >
                  <span
                    class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide mb-2 inline-block capitalize"
                  >
                    {loc.type}
                  </span>
                  <h3
                    class="font-headline {i === 0
                      ? 'text-2xl'
                      : 'text-xl'} font-bold"
                  >
                    {loc.name}
                  </h3>
                  <p class="font-body text-sm opacity-80">
                    {loc.placeCount} places · {Number(
                      loc.averageRating,
                    ).toFixed(1)} avg rating
                  </p>
                </div>
              </a>
            {/each}
          </div>

          <!-- Row 2: narrow left, wide right -->
          <div class="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-2 h-96">
            {#each row2 as loc, i}
              <a
                href={`/location/${loc.path}`}
                class="group relative rounded-3xl h-full overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all border border-outline/10"
              >
                {#if loc.image}
                  <OptimizedImage
                    class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    alt={loc.name}
                    imageId={loc.image}
                    height="100%"
                  />
                {:else}
                  <div
                    class="w-full h-full bg-muted flex items-center justify-center"
                  >
                    <MapPin class="size-12 text-muted-foreground/30" />
                  </div>
                {/if}
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
                ></div>
                <div
                  class="absolute bottom-0 left-0 {i === 1
                    ? 'p-6'
                    : 'p-5'} text-white"
                >
                  <span
                    class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide mb-2 inline-block capitalize"
                  >
                    {loc.type}
                  </span>
                  <h3
                    class="font-headline {i === 1
                      ? 'text-2xl'
                      : 'text-xl'} font-bold"
                  >
                    {loc.name}
                  </h3>
                  <p class="font-body text-sm opacity-80">
                    {loc.placeCount} places · {Number(
                      loc.averageRating,
                    ).toFixed(1)} avg rating
                  </p>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {:else}
        <div
          class="h-48 flex items-center justify-center text-muted-foreground"
        >
          No featured destinations yet.
        </div>
      {/if}
    </section>

    <!-- Popular Places -->
    <section class="py-16 px-5 md:px-12">
      <div class="max-w-full mx-auto space-y-10">
        <div class="flex justify-between items-end">
          <div class="space-y-1">
            <h2
              class="font-headline text-[32px] leading-10 font-bold text-on-surface"
            >
              Popular Places
            </h2>
            <p class="font-body sm:text-base text-sm">
              Our most loved dog-friendly spots.
            </p>
          </div>
          <a
            href="/explore"
            class="text-primary font-label sm:text-sm text-xs font-semibold flex items-center gap-1 hover:underline transition-all"
          >
            View all <ArrowRight class="size-4" />
          </a>
        </div>

        {#if popularPlaces.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {#each popularPlaces as place}
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
                imageId={place.imageId ?? undefined}
                cityName={place.cityName}
                regionName={place.regionName ?? ""}
                locationPath={place.locationPath}
                isSaved={place.isSaved}
                memberFavourite={place.memberFavourite}
                {user}
              />
            {/each}
          </div>
        {:else}
          <div
            class="h-48 flex items-center justify-center text-on-surface-variant"
          >
            No popular places yet.
          </div>
        {/if}
      </div>
    </section>

    <!-- App CTA Section -->
    <section class="py-16 px-5 md:px-12 overflow-hidden">
      <div
        class="max-w-7xl mx-auto bg-primary rounded-[40px] p-10 md:p-16 relative flex flex-col md:flex-row items-center gap-16"
      >
        <div class="flex-1 space-y-6 z-10">
          <span
            class="bg-orange-500 text-foreground px-6 py-1 rounded-full font-label text-sm font-semibold uppercase tracking-wider"
            >Coming Soon</span
          >
          <h2
            class="font-headline text-[48px] leading-14 font-extrabold text-white tracking-tight"
          >
            Adventure in your pocket.
          </h2>
          <p class="font-body text-lg text-white leading-7 opacity-80">
            Download the Woofs Welcome app for on the go adventures.
          </p>
          <div class="flex flex-wrap gap-6 pt-3">
            <button
              class="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
            >
              <span class="material-symbols-outlined" style="font-size:32px"
                >ios</span
              >
              <div class="text-left">
                <p class="text-[10px] uppercase font-bold leading-none">
                  Download on the
                </p>
                <p class="text-lg font-bold leading-none">App Store</p>
              </div>
            </button>
            <button
              class="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
            >
              <span class="material-symbols-outlined" style="font-size:32px"
                >play_arrow</span
              >
              <div class="text-left">
                <p class="text-[10px] uppercase font-bold leading-none">
                  Get it on
                </p>
                <p class="text-lg font-bold leading-none">Google Play</p>
              </div>
            </button>
          </div>
        </div>

        <div class="flex-1 relative flex justify-center">
          <div
            class="relative w-70 md:w-[320px] aspect-9/19 bg-slate-800 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden"
          >
            <img
              class="w-full h-full object-cover"
              alt="Mobile app UI showing an interactive trail map with markers and trail details."
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80"
            />
          </div>
          <div
            class="absolute -top-10 -right-10 w-64 h-64 bg-primary-container rounded-full blur-[80px] opacity-20"
          ></div>
          <div
            class="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary-fixed rounded-full blur-[80px] opacity-20"
          ></div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
