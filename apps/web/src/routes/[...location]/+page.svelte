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
  import type { BAUser, PlaceFilter } from "@woofs/types";
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

  const zoom = $derived(
    location.data?.type === "country"
      ? 6
      : location.data?.type === "region"
        ? 9
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

  const locationCards = [
    {
      name: "Canterbury",
      places: "120+ Places",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANHPqqfOy56DNfgPJz6GZC79hFh5PpE3ZPK4p2LwiNP-iKZTakyrEi8_WHxwwuBykaqwH6TEk5lx3hSY47WDQdsEddRjScA5PGuNOTzsg5XOcuFMEdD8GkHcXDII0MzSFRCFtJuH8w2uw0z_npL450GnNKd3b4RUYV9N_G-u_6bpNjU0C-fUTbzqZfJdWz74cBArCfia2wdn5KN_cF-R9Ehde4OkPzKoatOvcbZXBEUpajzrGsB10nD_p0L3s8bO6RZ7fHSxpm8sZ-",
    },
    {
      name: "Auckland",
      places: "180+ Places",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANHPqqfOy56DNfgPJz6GZC79hFh5PpE3ZPK4p2LwiNP-iKZTakyrEi8_WHxwwuBykaqwH6TEk5lx3hSY47WDQdsEddRjScA5PGuNOTzsg5XOcuFMEdD8GkHcXDII0MzSFRCFtJuH8w2uw0z_npL450GnNKd3b4RUYV9N_G-u_6bpNjU0C-fUTbzqZfJdWz74cBArCfia2wdn5KN_cF-R9Ehde4OkPzKoatOvcbZXBEUpajzrGsB10nD_p0L3s8bO6RZ7fHSxpm8sZ-",
    },
    {
      name: "Wellington",
      places: "140+ Places",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqRUlXPoY0Y801bdbLkGD7QZ9Kwk2Y7YjT8badxUUhWG1gwzf9s8J9emsYKkQFj0WCsNegRqq7ZD6AxJvKn_Fw7ve8I6szD3vuY4cPw1VyxaG6EGmwhWshcs-mRJz3JaSWbmzSJCwGODGjtE0J7wFIauDDiO6jQ25P6ZMqmSZaEoTOR1oBSgzaOfwicdcxYtNo-oPe82tt6OLb2MVJ-ec6RWIDK_FYl2IhGU459A3OEcwPWPpZuXuu0kTfjWqcg0u1D-W2MWZQzHcM",
    },
    {
      name: "Queenstown",
      places: "210+ Places",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqRUlXPoY0Y801bdbLkGD7QZ9Kwk2Y7YjT8badxUUhWG1gwzf9s8J9emsYKkQFj0WCsNegRqq7ZD6AxJvKn_Fw7ve8I6szD3vuY4cPw1VyxaG6EGmwhWshcs-mRJz3JaSWbmzSJCwGODGjtE0J7wFIauDDiO6jQ25P6ZMqmSZaEoTOR1oBSgzaOfwicdcxYtNo-oPe82tt6OLb2MVJ-ec6RWIDK_FYl2IhGU459A3OEcwPWPpZuXuu0kTfjWqcg0u1D-W2MWZQzHcM",
    },
    {
      name: "Fiordland",
      places: "90+ Places",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuABLnDjAVjUcpliclE2UCswRDzrHJiQLP-I2TOmS5mHfHoZTNuwJdzCa945qXIITTuwJZ9FEOmuD0OtWBBDtET4Psoeiom0LbpzIn3z09neC8jFcx6JmaVm_JPq4_8h0-t7Vv1pgPg-sP8f2k7_yn9H7aWj3j6TIxxGsP9MABTvj756LJwxfBSHPdQJvEaPDcQnw8FOf1_CoxLUIj5Tf-G_VVUSUzqg8gkth6mbD9rrYviY36-O-jtQ86PxQhkuUD-85vs9AGaumhbo",
    },
  ];
</script>

<ErrorBoundary error={location.error}>
  {#if location.isLoading}
    <Navbar {user} />
    <!-- Hero skeleton -->
    <div class="relative h-screen w-full min-h-200 overflow-hidden">
      <Skeleton class="absolute inset-0 w-full h-full rounded-none" />
      <div class="relative max-w-7xl mx-auto px-8 flex flex-col justify-end h-full pb-24 gap-6">
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
        class="relative h-screen w-full min-h-200 overflow-hidden flex items-center"
      >
        <OptimizedImage
          imageId={location.data.image}
          alt={location.data.name + " landscape"}
          sizes="100vw"
          class="absolute inset-0w-full h-full object-cover object-center"
          variant="xlarge"
          height="100%"
        />
        <div class="absolute inset-0 adventure-gradient"></div>
        <div
          class="relative w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pb-24"
        >
          <div class="lg:col-span-8">
            <h1
              class="text-white font-serif text-4xl md:text-8xl lg:text-[100px] mb-8"
            >
              Dog-Friendly places in {location.data.name}
            </h1>
            <div class="flex gap-6">
              <a
                href={`/explore?lat=${location.data.latitude}&lng=${location.data.longitude}&zoom=${zoom}`}
                class="bg-primary-container px-10 py-5 rounded-lg text-white font-bold text-sm tracking-widest hover:brightness-110 transition-all shadow-2xl uppercase"
                >Start Exploring</a
              >
              <button
                class="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 px-10 py-5 rounded-lg text-white font-bold text-sm tracking-widest hover:bg-white/20 transition-all uppercase"
                >View Gallery</button
              >
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
                    class="flex items-center gap-1 text-secondary font-bold text-xs tracking-wide uppercase mb-2"
                  >
                    <Star class="size-3.5 fill-secondary text-secondary" />
                    {location.data.averageRating} ({location.data.totalReviews} reviews)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Images section -->
      <section class="py-24 bg-surface-container-low">
        <div class="max-w-7xl mx-auto px-8">
          <div class="flex items-end justify-between mb-16">
            <div>
              <h2 class="font-serif text-5xl text-on-surface mb-4">
                Community Moments
              </h2>
              <p class="text-on-surface-variant text-lg max-w-lg">
                Captured moments from our community's most memorable journeys.
              </p>
            </div>
            <button
              aria-label="View all photos from the community"
              class="cursor-pointer text-primary-tint font-bold text-sm tracking-widest flex items-center gap-3 group uppercase"
            >
              View All Photos <ArrowRight
                class="size-4 transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              class="group relative aspect-3/4 overflow-hidden rounded-xl cursor-pointer shadow-lg"
            >
              <img
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Hobbiton Hideaway"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqRUlXPoY0Y801bdbLkGD7QZ9Kwk2Y7YjT8badxUUhWG1gwzf9s8J9emsYKkQFj0WCsNegRqq7ZD6AxJvKn_Fw7ve8I6szD3vuY4cPw1VyxaG6EGmwhWshcs-mRJz3JaSWbmzSJCwGODGjtE0J7wFIauDDiO6jQ25P6ZMqmSZaEoTOR1oBSgzaOfwicdcxYtNo-oPe82tt6OLb2MVJ-ec6RWIDK_FYl2IhGU459A3OEcwPWPpZuXuu0kTfjWqcg0u1D-W2MWZQzHcM"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8"
              >
                <span class="text-white font-serif text-2xl mb-1"
                  >Hobbiton Hideaway</span
                >
                <span class="text-white/70 text-xs tracking-widest uppercase"
                  >Matamata</span
                >
              </div>
            </div>
            <div
              class="group relative aspect-3/4 overflow-hidden rounded-xl cursor-pointer shadow-lg"
            >
              <img
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Piha Beach Run"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEX16tRsywGw41Qr7qwGIdt18OKRgnt80-wSR8tF8ckwJ5yTm8XkPTiIbzpjXF8Lis_60BKQmpeml4jlToD0FAWU-xbzGcaez9alkqVDDY4v1PAj4yEueYx_D8JFcrjIjFC6Gi_wyQqgULwvZGwg1OuIbemCk1gytBD8x8vydIOLPvvpTQG4y3hlF8wsidMMj0CDUaWJvqCEEPLOCGI2I7eL2dCx1PmnlEjKTG2UD3LVpuFu5dGYxEdJta8_dFgixe9p5_TbJn81ZG"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8"
              >
                <span class="text-white font-serif text-2xl mb-1"
                  >Black Sand Dash</span
                >
                <span class="text-white/70 text-xs tracking-widest uppercase"
                  >Piha Beach</span
                >
              </div>
            </div>
            <div
              class="group relative aspect-3/4 overflow-hidden rounded-xl cursor-pointer shadow-lg"
            >
              <img
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt="Hooker Valley Track"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABLnDjAVjUcpliclE2UCswRDzrHJiQLP-I2TOmS5mHfHoZTNuwJdzCa945qXIITTuwJZ9FEOmuD0OtWBBDtET4Psoeiom0LbpzIn3z09neC8jFcx6JmaVm_JPq4_8h0-t7Vv1pgPg-sP8f2k7_yn9H7aWj3j6TIxxGsP9MABTvj756LJwxfBSHPdQJvEaPDcQnw8FOf1_CoxLUIj5Tf-G_VVUSUzqg8gkth6mbD9rrYviY36-O-jtQ86PxQhkuUD-85vs9AGaumhbo"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8"
              >
                <span class="text-white font-serif text-2xl mb-1"
                  >Alpine Wander</span
                >
                <span class="text-white/70 text-xs tracking-widest uppercase"
                  >Hooker Valley</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Places section -->
      <section class="py-32 max-w-7xl mx-auto px-8">
        <div class="text-center mb-20">
          <h2 class="font-serif text-5xl text-on-surface mb-4">
            Popular Picks
          </h2>
          <div class="w-24 h-1 bg-primary-container mx-auto"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <!-- TODO: Replace with Place Card component -->
          <div class="flex flex-col group">
            <div class="aspect-video overflow-hidden rounded-xl mb-6 relative">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Lolly's Cafe Wanaka"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp0iUrZmtG857zlA0Ek-mU0M6iaA0cBCWt1RpGQiQkxYvYWtU0Qy0ZV8gbSGKsFo1FRYf-85IHCImnN_NYlPTSu4zzI_nZoubHoINKwHAkWfKBYqdzcVUZ25uhWB5itUWCOftA3bX0KOMwuiZ-QJW1WYpZvACuyCyae4S7Of2dO9tcWf_deAvGoBpOt59D9hGX8yyV50ejptp_0EDCIDmZo8-H-x4J6OGVjENktxbsl1ED0xd9OxpDui42pQbQldMnjCvhUk8LkMh2"
              />
              <span
                class="absolute top-4 left-4 bg-primary-container px-3 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest"
                >Eat</span
              >
            </div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-serif text-2xl text-on-surface">Lolly's Cafe</h3>
              <div class="flex items-center text-primary-container">
                <span
                  class="material-symbols-outlined text-sm"
                  style="font-variation-settings: 'FILL' 1;">star</span
                >
                <span class="text-on-surface font-bold text-sm ml-1">4.9</span>
              </div>
            </div>
            <p class="text-on-surface-variant text-base leading-relaxed mb-6">
              Wanaka's finest coffee with a lakeside view and a dedicated dog
              biscuit menu.
            </p>
            <div class="flex gap-4">
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >Lakeside</span
              >
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >Dog Friendly</span
              >
            </div>
          </div>
          <!-- TODO: Replace with Place Card component -->
          <div class="flex flex-col group">
            <div class="aspect-video overflow-hidden rounded-xl mb-6 relative">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="The Hermitage Hotel"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfw5uHbaSgwlCB_kB9OSYxxXXGFQ9EaSXgGQONMeHFIGRR8mAUB-I9uL-goqWct_QWGW0usS0lj0wK3gg3t5fMm5G3mwrmdyDqtlPRBafV4AbjwUGinxQwxATqXz1uqzxHFGFRldaS6nZ7FEQBHR3sYXxG6XQYaO88UPHjNDsILPX2Uwc-Bx8sBt-pmw8nDfZqFVGKmXngKEfw-jBqae1wbuM4wtnP_90lC8Oq4_2GQrTorS0fuTT1zplYAwNoNGGrbBlQ-6k3U9rE"
              />
              <span
                class="absolute top-4 left-4 bg-primary-container px-3 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest"
                >Stay</span
              >
            </div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-serif text-2xl text-on-surface">The Hermitage</h3>
              <div class="flex items-center text-primary-container">
                <span
                  class="material-symbols-outlined text-sm"
                  style="font-variation-settings: 'FILL' 1;">star</span
                >
                <span class="text-on-surface font-bold text-sm ml-1">4.8</span>
              </div>
            </div>
            <p class="text-on-surface-variant text-base leading-relaxed mb-6">
              Alpine luxury at the foot of Aoraki. Special dog-friendly wings
              available for hikers.
            </p>
            <div class="flex gap-4">
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >Alpine</span
              >
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >Luxury</span
              >
            </div>
          </div>
          <!-- TODO: Replace with Place Card component -->
          <div class="flex flex-col group">
            <div class="aspect-video overflow-hidden rounded-xl mb-6 relative">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt="Hooker Valley Track"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABLnDjAVjUcpliclE2UCswRDzrHJiQLP-I2TOmS5mHfHoZTNuwJdzCa945qXIITTuwJZ9FEOmuD0OtWBBDtET4Psoeiom0LbpzIn3z09neC8jFcx6JmaVm_JPq4_8h0-t7Vv1pgPg-sP8f2k7_yn9H7aWj3j6TIxxGsP9MABTvj756LJwxfBSHPdQJvEaPDcQnw8FOf1_CoxLUIj5Tf-G_VVUSUzqg8gkth6mbD9rrYviY36-O-jtQ86PxQhkuUD-85vs9AGaumhbo"
              />
              <span
                class="absolute top-4 left-4 bg-primary-container px-3 py-1 rounded text-white text-[10px] font-bold uppercase tracking-widest"
                >Trail</span
              >
            </div>
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-serif text-2xl text-on-surface">Hooker Valley</h3>
              <div class="flex items-center text-primary-container">
                <span
                  class="material-symbols-outlined text-sm"
                  style="font-variation-settings: 'FILL' 1;">star</span
                >
                <span class="text-on-surface font-bold text-sm ml-1">5.0</span>
              </div>
            </div>
            <p class="text-on-surface-variant text-base leading-relaxed mb-6">
              A stunning, flat boardwalk trail through the heart of the Southern
              Alps.
            </p>
            <div class="flex gap-4">
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >10km Loop</span
              >
              <span
                class="text-[10px] text-on-surface-variant tracking-widest font-bold uppercase"
                >Easy</span
              >
            </div>
          </div>
        </div>
        <div class="mt-12 flex items-center justify-center">
          <a
            href={`/explore?lat=${location.data.latitude}&lng=${location.data.longitude}&zoom=${zoom}`}
            class="bg-primary py-3 px-4 rounded-lg text-white hover:bg-primary/90 cursor-pointer"
            >Explore {location.data.name}</a
          >
        </div>
      </section>

      <!-- locations section -->
      {#if location.data.type !== "city"}
        <section class="py-32 bg-surface-container-low">
          <div class="max-w-7xl mx-auto px-8">
            <div class="mb-16">
              <h2 class="font-serif text-5xl text-on-surface mb-4">
                Top locations in {location.data.name}
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
                  class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-12 h-12 rounded-full bg-surface shadow-xl border border-outline/10 flex items-center justify-center text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft class="size-5" />
                </button>
              {/if}

              <!-- Right arrow -->
              {#if canScrollRight && carouselHovered}
                <button
                  onclick={scrollRight}
                  class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-12 h-12 rounded-full bg-surface shadow-xl border border-outline/10 flex items-center justify-center text-on-surface hover:bg-surface-container transition-all cursor-pointer"
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
                {#each locationCards as card}
                  <div
                    class="flex-none w-87.5 aspect-3/4 relative rounded-xl overflow-hidden group/card cursor-pointer shadow-xl"
                  >
                    <img
                      alt={card.name}
                      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      src={card.src}
                    />
                    <div
                      class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8"
                    >
                      <h3 class="text-white font-serif text-3xl mb-2">
                        {card.name}
                      </h3>
                      <div
                        class="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest"
                      >
                        <MapPin class="size-3.5 fill-white/80" />
                        <span>{card.places}</span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </section>
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
    <MobileBottomNav {user} />
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
