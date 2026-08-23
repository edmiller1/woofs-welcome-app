<script lang="ts">
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import hero from "$lib/assets/hero.jpg";
  import stays from "$lib/assets/stays.jpg";
  import eats from "$lib/assets/eats.jpeg";
  import adventure from "$lib/assets/adventure.jpg";
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

<svelte:head>
  <title>Woofs Welcome — Dog-Friendly Places in New Zealand</title>
  <meta
    name="description"
    content="Find dog-friendly cafes, restaurants, accommodation, walks and more across New Zealand. Discover places that welcome your dog."
  />
  <meta
    property="og:title"
    content="Woofs Welcome — Dog-Friendly Places in New Zealand"
  />
  <meta
    property="og:description"
    content="Find dog-friendly cafes, restaurants, accommodation, walks and more across New Zealand. Discover places that welcome your dog."
  />
  <meta property="og:url" content="https://woofswelcome.app" />
  <link rel="canonical" href="https://woofswelcome.app" />
</svelte:head>

<div class="bg-background text-foreground font-sans antialiased">
  <div class="mx-auto w-full bg-card">
    <!-- Hero -->
    <header class="relative md:h-160 h-130">
      <div class="absolute inset-0">
        <img
          class="w-full h-full object-cover"
          alt="4 dogs posing on a field"
          src={hero}
        />

        <div
          class="pointer-events-none absolute inset-0"
          style="background:var(--overlay-hero)"
        ></div>
      </div>

      <nav
        class="absolute inset-x-0 top-0 flex items-center gap-7 px-6 py-5 sm:px-10"
      >
        <a
          href="/"
          class="text-[21px] font-extrabold tracking-[-0.02em] text-[#fdf9f3] no-underline"
          >Woofs Welcome</a
        >
        <div
          class="hidden gap-6 text-sm font-semibold text-[#fdf9f3]/85 md:flex"
        >
          <a href="/explore" class="no-underline hover:text-[#fdf9f3]"
            >Explore</a
          >
          <a href="/about" class="no-underline hover:text-[#fdf9f3]">About</a>
          <a href="/contact" class="no-underline hover:text-[#fdf9f3]"
            >Contact</a
          >
        </div>
        <div class="flex-1"></div>
        <a
          href="/sign-in"
          class="rounded-full border-[1.5px] border-primary px-4 py-2 text-[13px] font-bold text-primary no-underline hover:bg-primary/20 dark:border-walnut dark:text-walnut dark:hover:bg-walnut/20"
          >Sign in</a
        >
      </nav>

      <div class="absolute bottom-10 left-6 max-w-155 sm:left-10 sm:bottom-11">
        <span
          class="inline-block rounded-full bg-tan px-2.75 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#3f2d1d]"
          >All of New Zealand</span
        >
        <h1
          class="m-0 mt-3.5 text-[40px] leading-[1.02] tracking-[-0.035em] text-[#fdf9f3] sm:text-[56px]"
        >
          Take the dog.<br />Everywhere.
        </h1>
        <p class="mt-3.5 max-w-115 text-[17px] text-[#fdf9f3]/90">
          Discover thousands of verified dog-friendly cafés, parks, stays and
          more across New Zealand.
        </p>
        <form
          class="mt-6 flex max-w-140 flex-col items-stretch gap-2 rounded-2xl bg-popover p-2 sm:flex-row sm:items-center sm:rounded-full"
        >
          <label class="flex flex-1 items-center gap-2.5 px-3.5 py-1.5">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--muted-foreground)"
              stroke-width="2.2"
              ><circle cx="11" cy="11" r="7" /><path d="M20 20l-4.3-4.3" /></svg
            >
            <span class="sr-only">Search destinations</span>
            <input
              type="search"
              placeholder="Where are you headed?"
              class="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
          <button
            type="submit"
            class="cursor-pointer rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground hover:bg-walnut dark:hover:bg-primary/80"
            >Explore</button
          >
        </form>
      </div>
    </header>

    <!-- Types section -->
    <section id="types" class="px-6 py-8 sm:px-10">
      <div class="flex flex-wrap items-cend justify-between gap-3">
        <div>
          <h2 class="m-0 text-[30px] tracking-[-0.025em] font-extrabold">
            Plenty of places
          </h2>
          <p class="mt-1.5 text-[15px] text-muted-foreground">
            Find dog-friendly accomodation, adventures, and more.
          </p>
        </div>
        <a
          href="/explore"
          class="text-sm font-bold text-link no-underline hover:underline"
          >Explore more →</a
        >
      </div>
      <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <a
          href="/explore?types=Hotel%2CMotel%2CAirBnb"
          aria-label="stays"
          class="group relative block h-75 overflow-hidden rounded-xl no-underline"
        >
          <div
            class="photo absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
            data-photo="Queenstown lake trail"
          >
            <img src={stays} alt="stays" class="w-full h-full object-cover" />
            <div
              class="pointer-events-none absolute inset-0"
              style="background:var(--overlay-card)"
            ></div>
            <div class="absolute inset-x-4 bottom-4">
              <!-- <div
                class="text-[11px] font-bold uppercase tracking-widest text-tan-soft"
              >
                3 days · 18 places
              </div> -->
              <div
                class="mt-1 text-[21px] font-extrabold tracking-[-0.02em] text-[#fdf9f3]"
              >
                Stays
              </div>
              <div class="mt-0.5 text-[13px] text-[#fdf9f3]/85">
                Dog-friendly hotels and motels
              </div>
            </div>
          </div>
        </a>
        <a
          href="/explore?types=Hike%2CTrail%2CRiver%2CLake"
          aria-label="adventures"
          class="group relative block h-75 overflow-hidden rounded-xl no-underline"
        >
          <div
            class="photo absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
            data-photo="Auckland café terrace"
          >
            <img
              src={adventure}
              alt="adventure"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="pointer-events-none absolute inset-0"
            style="background:var(--overlay-card)"
          ></div>
          <div class="absolute inset-x-4 bottom-4">
            <!-- <div
              class="text-[11px] font-bold uppercase tracking-widest text-tan-soft"
            >
              Half day · 9 places
            </div> -->
            <div
              class="mt-1 text-[21px] font-extrabold tracking-[-0.02em] text-[#fdf9f3]"
            >
              Adventures
            </div>
            <div class="mt-0.5 text-[13px] text-[#fdf9f3]/85">
              Dog-friendly hikes, trails, and rivers
            </div>
          </div>
        </a>
        <a
          href="/explore?types=Restaurant%2CCafé%2CBar%2CWinery"
          aria-label="eats"
          class="group relative block h-75 overflow-hidden rounded-xl no-underline"
        >
          <div
            class="photo absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]"
            data-photo="Coromandel coastline"
          >
            <img src={eats} alt="eats" class="w-full h-full object-cover" />
          </div>
          <div
            class="pointer-events-none absolute inset-0"
            style="background:var(--overlay-card)"
          ></div>
          <div class="absolute inset-x-4 bottom-4">
            <!-- <div
              class="text-[11px] font-bold uppercase tracking-[0.1em] text-tan-soft"
            >
              Weekend · 12 places
            </div> -->
            <div
              class="mt-1 text-[21px] font-extrabold tracking-[-0.02em] text-[#fdf9f3]"
            >
              Eats
            </div>
            <div class="mt-0.5 text-[13px] text-[#fdf9f3]/85">
              Dog-friendly cafés, restaurants, and wineries
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- Banner -->
    <section
      class="mx-6 mt-10 flex flex-col items-start gap-8 rounded-2xl bg-walnut px-8 py-7 sm:mx-10 lg:flex-row lg:items-center"
    >
      <div class="flex-1">
        <h3
          class="font-extrabold m-0 text-[26px] tracking-[-0.02em] text-walnut-foreground"
        >
          Verified dog-friendly places
        </h3>
        <p class="mt-2 max-w-130 text-[15px] text-walnut-foreground/85">
          Every listing records where dogs are allowed, rules for dogs and any
          dog specific amenities.
        </p>
      </div>
      <dl class="m-0 flex gap-6 sm:gap-6.5">
        <div>
          <dd class="m-0 text-[28px] font-extrabold text-tan-soft">4,100</dd>
          <dt
            class="text-[11.5px] uppercase tracking-[0.08em] text-walnut-foreground/72"
          >
            Places
          </dt>
        </div>
        <div>
          <dd class="m-0 text-[28px] font-extrabold text-tan-soft">12k</dd>
          <dt
            class="text-[11.5px] uppercase tracking-[0.08em] text-walnut-foreground/72"
          >
            Collections
          </dt>
        </div>
      </dl>
    </section>

    <!-- Featured destinations -->
    <section class="px-6 pt-14 sm:px-10">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="font-extrabold m-0 text-[30px] tracking-[-0.025em]">
            Featured destinations
          </h2>
          <p class="mt-1.5 text-[15px] text-muted-foreground">
            Dog-friendly towns for your next adventure or slow day out.
          </p>
        </div>
        <a
          href="/explore"
          class="text-sm font-bold text-link no-underline hover:underline"
          >View more →</a
        >
      </div>
      {#if featuredLocations.length > 0}
        <div class="flex flex-col gap-2 mt-5">
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
                    class="inline-block rounded-full bg-[#fdf9f3]/90 px-2.5 py-1.25 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-[#3f2d1d]"
                  >
                    {loc.type}
                  </span>
                  <h3
                    class="mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-[#fdf9f3]"
                  >
                    {loc.name}
                  </h3>
                  <p class="mt-0.5 text-[13.5px] text-[#fdf9f3]/85">
                    {loc.placeCount} places · {Number(
                      loc.averageRating,
                    ).toFixed(1)} avg rating
                  </p>
                </div>
              </a>
            {/each}
          </div>

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
      {/if}
    </section>

    <!-- Popular places -->
    <section class="px-6 pt-14 sm:px-10">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="font-extrabold m-0 text-[30px] tracking-[-0.025em]">
            Popular places
          </h2>
          <p class="mt-1.5 text-[15px] text-muted-foreground">
            Our most loved dog-friendly spots.
          </p>
        </div>
        <a
          href="/explore?rating=5"
          class="text-sm font-bold text-link no-underline hover:underline"
          >View all →</a
        >
      </div>
      {#if popularPlaces.length > 0}
        <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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
              difficulty={place.difficulty}
              {user}
            />
          {/each}
        </div>
      {/if}
    </section>

    <!-- App CTA -->
    <section
      class="mx-6 mt-14 grid gap-8 overflow-hidden rounded-[20px] bg-walnut sm:mx-10 lg:grid-cols-[1fr_380px]"
    >
      <div class="px-8 py-12 sm:px-12 sm:py-14">
        <span
          class="inline-block rounded-full bg-tan px-2.75 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-espresso"
          >Coming soon</span
        >
        <h2
          class="m-0 mt-4 font-extrabold text-[34px] leading-[1.04] tracking-[-0.03em] text-walnut-foreground sm:text-[44px]"
        >
          Adventure in<br />your pocket.
        </h2>
        <p class="mt-3.5 max-w-100 text-base text-walnut-foreground/82">
          Download the Woofs Welcome app for on the go adventures.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a
            href="/"
            class="flex items-center gap-2.75 rounded-xl bg-espresso px-5 py-3 text-left text-walnut-foreground no-underline hover:bg-espresso/80"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
              ><path
                d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.7-2.2c.9-1.2 1.2-2.4 1.2-2.5 0 0-2.2-.9-2.2-3.6zM14.2 5.3c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"
              /></svg
            >
            <span
              ><span
                class="block text-[9.5px] font-bold uppercase tracking-widest opacity-72"
                >Download on the</span
              ><span class="block text-[15px] font-extrabold">App Store</span
              ></span
            >
          </a>
          <a
            href="/"
            class="flex items-center gap-2.75 rounded-xl bg-espresso px-5 py-3 text-left text-walnut-foreground no-underline hover:bg-espresso/80"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
              ><path
                d="M4 2.8v18.4c0 .5.5.9 1 .6l13.4-8.9c.5-.3.5-1 0-1.3L5 2.2c-.5-.3-1 .1-1 .6z"
              /></svg
            >
            <span
              ><span
                class="block text-[9.5px] font-bold uppercase tracking-widest opacity-72"
                >Get it on</span
              ><span class="block text-[15px] font-extrabold">Google Play</span
              ></span
            >
          </a>
        </div>
        <div class="h-32"></div>
        <!-- <form class="mt-6 flex flex-wrap items-center gap-2.5">
          <label class="contents">
            <span class="sr-only">Email address</span>
            <input
              type="email"
              placeholder="Email me when it lands"
              class="w-62.5 rounded-full border border-[#fdf9f3]/28 bg-[#fdf9f3]/8 px-4 py-3 text-sm text-walnut-foreground outline-none placeholder:text-walnut-foreground/62"
            />
          </label>
          <button
            type="submit"
            class="cursor-pointer rounded-full border-0 bg-tan-soft px-[22px] py-3 text-[13.5px] font-extrabold text-[#3f2d1d] hover:bg-[#f0d9b8]"
            >Notify me</button
          >
        </form> -->
      </div>
      <div class="flex justify-center px-8 pt-10 sm:px-0">
        <div
          class="relative aspect-9/19 h-100 w-70.5 lg:h-full lg:aspect-auto overflow-hidden rounded-t-[34px] border-[9px] border-b-0 border-espresso"
        >
          <div class="photo absolute inset-0" data-photo="App screen"></div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</div>
