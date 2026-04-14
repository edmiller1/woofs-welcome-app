<script lang="ts">
  import type { BAUser } from "@woofs/types";
  import lolly from "$lib/assets/lolly.jpeg";
  import { ChevronRight, Heart, PawPrint, Star } from "@lucide/svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import { createQuery, keepPreviousData } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { ChevronLeft } from "@lucide/svelte";

  interface Props {
    data: {
      user: BAUser | null;
    };
  }

  const { data }: Props = $props();
  const { user } = $derived(data);

  const trendingPlaces = createQuery(() => ({
    queryKey: ["trendingPlaces"],
    queryFn: () => api.place.getTrendingPlaces(),
  }));

  const communityStats = createQuery(() => ({
    queryKey: ["communityStats"],
    queryFn: () => api.place.getCommunityStats(),
  }));

  let currentPage = $state(1);

  const communityReviews = createQuery(() => ({
    queryKey: ["communityReviews", { page: currentPage, limit: 10 }],
    queryFn: () =>
      api.review.getCommunityReviews({ page: currentPage, limit: 10 }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  }));

  const upcomingEvents = createQuery(() => ({
    queryKey: ["upcomingEvents", { limit: 10 }],
    queryFn: () => api.event.getUpcomingEvents({ limit: 10 }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  }));
</script>

<HomeNavbar {user} />
<main class="pt-24 pb-32 max-w-7xl mx-auto px-6">
  <!-- Hero -->
  <section class="relative grid md:grid-cols-12 gap-8 items-center mb-24">
    <div class="md:col-span-7 z-10">
      <h1
        class="font-headline text-6xl md:text-8xl text-primary leading-none mb-6"
      >
        Community
      </h1>
      <p class="font-body text-xl text-[#7f5b30] max-w-lg mb-8">
        Discover what's happening in the community this week. From sunrise
        scrambles to weekend beach days, stay connected with fellow explorers
        and their pups.
      </p>
      <div class="flex gap-4">
        <button
          class="bg-primary text-white cursor-pointer px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >Explore More</button
        >
        <button
          class="bg-secondary-container cursor-pointer text-[#7f5b30] px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >Browse Events</button
        >
      </div>
    </div>
    <div class="md:col-span-5 relative">
      <div
        class="aspect-4/5 rounded-4xl overflow-hidden shadow-xl transform rotate-2"
      >
        <img
          alt="main"
          class="w-full h-full object-cover object-center"
          data-alt="A golden retriever dog wearing a bandana looking at mountains"
          src={lolly}
        />
      </div>
      <div
        class="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg max-w-xs transform -rotate-1 border border-outline-variant/10"
      >
        <div class="flex items-center gap-3 mb-3">
          <img
            class="w-10 h-10 rounded-full object-cover"
            alt="Portrait of a smiling young woman community member"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuABAltDyhrRP-qddhHw4VgRTTuK1YsL85tAKB44EE4W6-e8XKpxjJqKWXZWd6Q_s_v6DsTf3oQU8iXssvaS2_sPe9Ln84l2BgHz6wlgBD6fOjkuhoWcXc9WBkkr5jZaXe0nb15wtJVo5XKzGvpdn8iA89reWBivPwqg_kndd7I6Dtr_evSr1Cp46hgajBiCgDKHvkbJD6JkARCAca5mE-IE42wSrp3FogVoV9QPf0W2j_cOoqxdZgUHxm2qQgLP-Tzcglc18WKRKdHj"
          />
          <div>
            <p class="font-bold text-sm">Maya &amp; Barnaby</p>
            <p class="text-[10px] text-secondary uppercase tracking-widest">
              Community Spotlight
            </p>
          </div>
        </div>
        <p class="text-sm italic font-headline">
          "We found our best friends at the Sunday Sunrise Scramble in Peak
          District. Barnaby has never been happier!"
        </p>
      </div>
    </div>
  </section>

  <!-- Trending Places (most checked-in places) -->
  <section class="mb-24">
    <div
      class="flex flex-col md:flex-row md:justify-between md:items-end mb-12"
    >
      <div>
        <h2 class="font-headline text-5xl text-primary">Trending Places</h2>
        <p class="text-secondary">
          The most visited dog-friendly locales this week.
        </p>
      </div>
      <a href="/explore" class="text-primary font-bold hover:underline"
        >View All Destinations</a
      >
    </div>
    <!-- Popular Places for the week (Trending) -->
    {#if trendingPlaces.isPending}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each Array(3) as _}
          <div>
            <div
              class="aspect-square rounded-[2.5rem] bg-secondary-container/30 animate-pulse mb-4"
            ></div>
            <div
              class="h-7 w-3/4 bg-secondary-container/30 animate-pulse rounded-lg mb-2"
            ></div>
            <div
              class="h-4 w-1/2 bg-secondary-container/30 animate-pulse rounded-lg mb-2"
            ></div>
            <div
              class="h-5 w-16 bg-secondary-container/30 animate-pulse rounded-full mt-1"
            ></div>
          </div>
        {/each}
      </div>
    {:else if trendingPlaces.isError}
      <div class="text-center py-16 text-secondary">
        <p>Couldn't load trending places right now. Try again later.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- TODO: Replace with real data from $trendingPlaces.data -->
        <div class="group cursor-pointer">
          <div
            class="aspect-square rounded-[2.5rem] overflow-hidden mb-4 relative"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="A beautiful coastal dog park with white sand and blue water"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNGH5XAbCWlv-FybZ5aMbBtn51JSSzQLrJQHE00ucMEozuYPmNemvSRPuJjSZma8uO-frElpXbFdhnA-YdQ3q_L3Nh3gENZvWCIj-rzqj0zafnUM1pPIWrQRMh83jcYzcUFBmOQRQpT3H97MDqxaZE3KfnJ1iEj5xJ5__9keQavUS9h0XT8sxoUn4tTPpYsjlZcvhAFTwElC1QTzx_DRW47dUQZ-AkBFmtlfz6h1do7i2X7EFi3cKey9lmJADVLsHp9XawvA_EZ1de"
            />
            <div
              class="absolute top-4 left-4 bg-accent text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <PawPrint class="size-4 fill-black" /> 120 Visits
            </div>
            <div class="absolute top-4 right-4 rounded-full">
              <!-- TODO: Switch to heart-button.svelte -->
              <Button
                variant="ghost"
                size="icon"
                class="rounded-full bg-white/80 hover:bg-white"
              >
                <Heart class="size-6" />
              </Button>
            </div>
          </div>
          <h3 class="font-headline text-2xl">Azure Bay Dog Beach</h3>
          <p class="text-secondary text-sm">Nelson, Tasman NZ</p>
          <Badge variant="secondary" class="mt-1">Beach</Badge>
        </div>

        <div class="group cursor-pointer">
          <div
            class="aspect-square rounded-[2.5rem] overflow-hidden mb-4 relative"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Misty pine forest trail with mountain background"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqXUpPHPeOdTvUrbPHXUtjbiE-hN4hN9BwkbbEpeft8aTL7hFYEavoL6jDapNqfIpFAQcZMmKkl7UVWiVlnnMvg-tvaup0-9TamlqjoH_X_EU3lHmkBhZ3PrEffjKwx3M4p1WPZ5UTmJFWHUjeynDfezr9Q7F_qs0h6sj5FOE8WXOPBugKtO1yN0JNFfjpoAp0irQp94ZJv9zEkHyRlEWljkT8IpMUT8A4LNaWf7-Yi8MWTuQCAQ2k8tUylSoXA0k1GlTEH8-IJnTv"
            />
            <div
              class="absolute top-4 left-4 bg-accent text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <PawPrint class="size-4 fill-black" /> 84 Visits
            </div>
            <div class="absolute top-4 right-4 rounded-full">
              <!-- TODO: Switch to heart-button.svelte -->
              <Button
                variant="ghost"
                size="icon"
                class="rounded-full bg-white/80 hover:bg-white"
              >
                <Heart class="size-6" />
              </Button>
            </div>
          </div>
          <h3 class="font-headline text-2xl">Whispering Pine Loop</h3>
          <p class="text-secondary text-sm">British Columbia, CAN</p>
          <Badge variant="secondary" class="mt-1">Trail</Badge>
        </div>

        <div class="group cursor-pointer">
          <div
            class="aspect-square rounded-[2.5rem] overflow-hidden mb-4 relative"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Cozy urban cafe with outdoor seating and flowers"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAXicktENrGlyB0W10sSHlpV4rsImuPOdQB6e7wYiRgL6jGlQEc4ysceX9jez62jeSxwOD3J-KT6Ddb2XIioyOcErrcWCSnSaC5gbr5ltP9kYZz4E16-A-z1-MeLWm7qCV9FO4bRIc1GjU_P3HQxiDLKecKORg015gh_JGQFhh_aVjqFYmym8xlTUx897PgUK-m6Z1G2PYKpWXRA1EOs_APZSUW6K3tCy8Hm0MC9psWSGVlngKWfUNiM-UlTOTvUQzdTPOuuiOqcbF"
            />
            <div
              class="absolute top-4 left-4 bg-accent text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <PawPrint class="size-4 fill-black" /> 205 Visits
            </div>
            <div class="absolute top-4 right-4 rounded-full">
              <!-- TODO: Switch to heart-button.svelte -->
              <Button
                variant="ghost"
                size="icon"
                class="rounded-full bg-white/80 hover:bg-white"
              >
                <Heart class="size-6" />
              </Button>
            </div>
          </div>
          <h3 class="font-headline text-2xl">The Barking Barista</h3>
          <p class="text-secondary text-sm">London, UK</p>
          <Badge variant="secondary" class="mt-1">Café</Badge>
        </div>
      </div>
    {/if}
  </section>

  <!-- Stats Section -->
  {#if communityStats.isSuccess}
    <section class="bg-primary rounded-[3rem] p-12 mb-24 text-center">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <span class="font-headline text-5xl text-primary-accent block mb-2"
            >1.2M+</span
          >
          <span
            class="text-primary-accent uppercase tracking-widest text-xs font-bold"
            >REVIEWS SHARED</span
          >
        </div>
        <div>
          <span class="font-headline text-5xl text-primary-accent block mb-2"
            >8.5k+</span
          >
          <span
            class="text-primary-accent uppercase tracking-widest text-xs font-bold"
            >CHECK-INS TODAY</span
          >
        </div>
        <div>
          <span class="font-headline text-5xl text-primary-accent block mb-2"
            >45k</span
          >
          <span
            class="text-primary-accent uppercase tracking-widest text-xs font-bold"
            >Places Saved</span
          >
        </div>
      </div>
    </section>
  {/if}

  <!-- Reviews and Events Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
    <!-- Reviews -->
    <div class="lg:col-span-2">
      <h2 class="serif-headline text-4xl text-primary mb-8">
        Recent Community Reviews
      </h2>

      {#if communityReviews.isPending}
        <div class="space-y-8">
          {#each Array(2) as _}
            <div
              class="bg-surface-container-lowest p-6 rounded-4xl shadow-sm border border-outline-variant/10 animate-pulse"
            >
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-full bg-secondary-container/30"
                  ></div>
                  <div>
                    <div
                      class="h-4 w-28 bg-secondary-container/30 rounded mb-2"
                    ></div>
                    <div
                      class="h-3 w-20 bg-secondary-container/30 rounded"
                    ></div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <div
                      class="h-3 w-24 bg-secondary-container/30 rounded mb-2"
                    ></div>
                    <div
                      class="h-2 w-20 bg-secondary-container/30 rounded"
                    ></div>
                  </div>
                  <div
                    class="w-10 h-10 rounded-lg bg-secondary-container/30"
                  ></div>
                </div>
              </div>
              <div
                class="h-5 w-48 bg-secondary-container/30 rounded mb-3"
              ></div>
              <div
                class="h-4 w-full bg-secondary-container/30 rounded mb-2"
              ></div>
              <div
                class="h-4 w-3/4 bg-secondary-container/30 rounded mb-4"
              ></div>
              <div
                class="h-5 w-24 bg-secondary-container/30 rounded-full"
              ></div>
            </div>
          {/each}
        </div>
      {:else if communityReviews.isError}
        <!-- silently hide on error -->
      {:else}
        <div class="space-y-8" class:opacity-60={communityReviews.isFetching}>
          <!-- TODO: Replace with review-card.svelte -->
          <div
            class="bg-white p-6 rounded-4xl shadow-sm border border-outline-variant/10"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <img
                  alt="Maya"
                  class="w-12 h-12 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABAltDyhrRP-qddhHw4VgRTTuK1YsL85tAKB44EE4W6-e8XKpxjJqKWXZWd6Q_s_v6DsTf3oQU8iXssvaS2_sPe9Ln84l2BgHz6wlgBD6fOjkuhoWcXc9WBkkr5jZaXe0nb15wtJVo5XKzGvpdn8iA89reWBivPwqg_kndd7I6Dtr_evSr1Cp46hgajBiCgDKHvkbJD6JkARCAca5mE-IE42wSrp3FogVoV9QPf0W2j_cOoqxdZgUHxm2qQgLP-Tzcglc18WKRKdHj"
                />
                <div>
                  <p class="font-bold text-sm">Maya Thompson</p>
                  <div class="flex text-tertiary-fixed-dim text-xs">
                    {#each Array(4) as _, i}
                      <Star class="size-3.5 fill-yellow-500 text-yellow-500" />
                    {/each}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-xs font-bold text-primary">
                    Azure Bay Dog Beach
                  </p>
                  <p class="text-[10px] text-secondary">
                    Reviewed on June 10, 2024
                  </p>
                </div>
                <img
                  alt="Location thumbnail"
                  class="w-10 h-10 rounded-lg object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNGH5XAbCWlv-FybZ5aMbBtn51JSSzQLrJQHE00ucMEozuYPmNemvSRPuJjSZma8uO-frElpXbFdhnA-YdQ3q_L3Nh3gENZvWCIj-rzqj0zafnUM1pPIWrQRMh83jcYzcUFBmOQRQpT3H97MDqxaZE3KfnJ1iEj5xJ5__9keQavUS9h0XT8sxoUn4tTPpYsjlZcvhAFTwElC1QTzx_DRW47dUQZ-AkBFmtlfz6h1do7i2X7EFi3cKey9lmJADVLsHp9XawvA_EZ1de"
                />
              </div>
            </div>
            <h4 class="font-headline text-xl text-primary mb-2">
              A hidden gem for morning walks
            </h4>
            <p class="text-sm text-secondary mb-4 leading-relaxed">
              "The water is shallow enough for splashing, and there's a mobile
              coffee truck on weekends. Barnaby absolutely loved meeting the
              other pups here!"
            </p>
            <div
              class="inline-block bg-secondary-container/30 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            >
              Golden Retriever
            </div>
          </div>
          <div
            class="bg-white p-6 rounded-4xl shadow-sm border border-outline-variant/10"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <img
                  alt="Luna"
                  class="w-12 h-12 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCusQ7Nawx6S_BUvq94MxDa4CuUyKDuvkAkfcRU3zNufDcJpoaqJ74R48QFZCfiXS1Ydz7Q57agLalPzZOu-HBRg81XOt2IXGOwPMzjRjsoCs5FAPho7gcUlt-bIsRdmoJwt6Hjc85y0ezrZsdsMg4hsxSxEm7TN8IJvTpVf_tUxrPMk029GE9vujhb7LzLce1xhBDg-uO7QoYKoK_qDbRDkQ1XKoaf1WS5DTw28LTgYvBO-uD1IUlItwnY6lKONWGCqDX1Dw5gL1AB"
                />
                <div>
                  <p class="font-bold text-sm">Luna Explorer</p>
                  <div class="flex text-tertiary-fixed-dim text-xs">
                    {#each Array(5) as _, i}
                      <Star class="size-3.5 fill-yellow-500 text-yellow-500" />
                    {/each}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-xs font-bold text-primary">
                    Whispering Pine Loop
                  </p>
                  <p class="text-[10px] text-secondary">
                    Reviewed on June 05, 2024
                  </p>
                </div>
                <img
                  alt="Location thumbnail"
                  class="w-10 h-10 rounded-lg object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqXUpPHPeOdTvUrbPHXUtjbiE-hN4hN9BwkbbEpeft8aTL7hFYEavoL6jDapNqfIpFAQcZMmKkl7UVWiVlnnMvg-tvaup0-9TamlqjoH_X_EU3lHmkBhZ3PrEffjKwx3M4p1WPZ5UTmJFWHUjeynDfezr9Q7F_qs0h6sj5FOE8WXOPBugKtO1yN0JNFfjpoAp0irQp94ZJv9zEkHyRlEWljkT8IpMUT8A4LNaWf7-Yi8MWTuQCAQ2k8tUylSoXA0k1GlTEH8-IJnTv"
                />
              </div>
            </div>
            <h4 class="font-headline text-xl text-primary mb-2">
              Stunning views, bring extra water
            </h4>
            <p class="text-sm text-secondary mb-4 leading-relaxed">
              "Just finished the High Ridge Summit. The views are unmatched!
              Note that the creek is dry this time of year, so pack
              accordingly."
            </p>
            <div
              class="inline-block bg-secondary-container/30 text-secondary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            >
              Black Labrador
            </div>
          </div>
        </div>

        <!-- Pagination -->
        {#if communityReviews.data?.pagination && communityReviews.data.pagination.totalPages > 1}
          <div class="flex items-center justify-between mt-8">
            <button
              onclick={() => (currentPage -= 1)}
              disabled={currentPage === 1}
              class="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm border border-outline-variant/20 hover:bg-secondary-container/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="size-4" /> Previous
            </button>
            <span class="text-sm text-secondary">
              Page {currentPage} of {communityReviews.data.pagination
                .totalPages}
            </span>
            <button
              onclick={() => (currentPage += 1)}
              disabled={!communityReviews.data.pagination.hasNextPage}
              class="flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm border border-outline-variant/20 hover:bg-secondary-container/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight class="size-4" />
            </button>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Events -->
    <div class="bg-[#f7f3f0] p-8 rounded-[3rem]">
      <h2 class="serif-headline text-3xl text-primary mb-6">Upcoming Events</h2>

      {#if upcomingEvents.isPending}
        <div class="space-y-4">
          {#each Array(3) as _}
            <div
              class="bg-white p-5 rounded-2xl flex items-center gap-4 border border-outline-variant/10 shadow-sm animate-pulse"
            >
              <div
                class="w-12 h-12 bg-secondary-container/30 rounded-full shrink-0"
              ></div>
              <div class="flex-1">
                <div
                  class="h-4 w-3/4 bg-secondary-container/30 rounded mb-2"
                ></div>
                <div class="h-3 w-1/2 bg-secondary-container/30 rounded"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if upcomingEvents.isError}
        <!-- silently hide on error -->
      {:else}
        <div class="space-y-4">
          <!-- TODO: Replace with actual events -> event-card.svelte -->
          <div
            class="bg-white p-5 rounded-2xl flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer border border-outline-variant/10 shadow-sm"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-secondary-container rounded-full flex flex-col items-center justify-center"
              >
                <span class="text-[10px] font-bold uppercase leading-none"
                  >Jun</span
                >
                <span class="text-lg font-bold leading-none">12</span>
              </div>
              <div>
                <h5 class="font-bold text-sm">Sunday Sunrise Scramble</h5>
                <p class="text-[10px] text-secondary">
                  Peak District • 6:30 AM
                </p>
              </div>
            </div>
            <ChevronRight class="size-4" />
          </div>
          <div
            class="bg-white p-5 rounded-2xl flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer border border-outline-variant/10 shadow-sm"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-secondary-container rounded-full flex flex-col items-center justify-center"
              >
                <span class="text-[10px] font-bold uppercase leading-none"
                  >Jun</span
                >
                <span class="text-lg font-bold leading-none">15</span>
              </div>
              <div>
                <h5 class="font-bold text-sm">Golden Retriever Beach Day</h5>
                <p class="text-[10px] text-secondary">Azure Bay • 10:00 AM</p>
              </div>
            </div>
            <ChevronRight class="size-4" />
          </div>
          <div
            class="bg-white p-5 rounded-2xl flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer border border-outline-variant/10 shadow-sm"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-secondary-container rounded-full flex flex-col items-center justify-center"
              >
                <span class="text-[10px] font-bold uppercase leading-none"
                  >Jun</span
                >
                <span class="text-lg font-bold leading-none">18</span>
              </div>
              <div>
                <h5 class="font-bold text-sm">Urban Agility Workshop</h5>
                <p class="text-[10px] text-secondary">
                  Greenwich Park • 2:00 PM
                </p>
              </div>
            </div>
            <ChevronRight class="size-4" />
          </div>
        </div>
      {/if}

      <button
        class="w-full mt-8 py-4 border-2 border-primary text-primary font-bold rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all"
        >Explore All Events</button
      >
    </div>
  </div>
</main>
<Footer />
<MobileBottomNav {user} />
