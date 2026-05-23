<script lang="ts">
  import type { BAUser } from "@woofs/types";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import { ArrowRight, Star } from "@lucide/svelte";
  import community from "$lib/assets/community.jpg";
  import { api } from "$lib/api-helper";
  import { createQuery, keepPreviousData } from "@tanstack/svelte-query";
  import "@aejkatappaja/phantom-ui";

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

<phantom-ui
  loading={trendingPlaces.isLoading ||
    communityStats.isLoading ||
    communityReviews.isLoading ||
    upcomingEvents.isLoading}
>
  <div class="bg-surface text-on-surface overflow-x-hidden">
    <HomeNavbar {user} />

    <!-- Hero -->
    <header
      class="relative w-full h-153.5 flex items-center overflow-hidden pt-18"
    >
      <div class="absolute inset-0 z-0">
        <img
          alt="A diverse group of happy dogs and their owners playing in a lush green park during golden hour."
          class="w-full h-full object-cover hero-mask"
          src={community}
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-on-surface/50 to-transparent"
        ></div>
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-12 w-full">
        <div class="max-w-2xl">
          <h1
            class="font-headline text-5xl md:text-[48px] md:leading-14 font-extrabold text-white mb-3"
          >
            Community
          </h1>
          <p class="font-body text-lg leading-7 text-white mb-6">
            Join the largest community of four-legged explorers and their
            humans. Share experiences, find nearby events, and discover the
            world together.
          </p>
          <!-- <div class="flex flex-wrap gap-3">
          <a
            href="/explore"
            class="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-label font-semibold hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
          >
            Join the Pack
          </a>
          <button
            class="bg-surface/80 backdrop-blur border border-outline/20 text-on-surface px-8 py-3 rounded-full font-label font-semibold hover:bg-surface transition-colors cursor-pointer"
          >
            Watch Film
          </button>
        </div> -->
        </div>
      </div>
    </header>

    <!-- Stats Bar -->
    <section class="bg-primary-container py-10">
      <div class="max-w-7xl mx-auto px-5 md:px-12">
        <div
          class="flex flex-col md:flex-row justify-around items-center gap-8 text-center"
        >
          <div>
            <span
              class="font-headline text-[32px] leading-10 font-bold text-on-primary-container block"
              >{communityStats.data?.checkIns ?? "0"}</span
            >
            <span
              class="font-label text-sm font-semibold text-on-primary-container/70 uppercase tracking-widest"
              >Check-ins</span
            >
          </div>
          <div
            class="h-12 w-px bg-on-primary-container/20 hidden md:block"
          ></div>
          <div>
            <span
              class="font-headline text-[32px] leading-10 font-bold text-on-primary-container block"
              >{communityStats.data?.placesSaved ?? "0"}</span
            >
            <span
              class="font-label text-sm font-semibold text-on-primary-container/70 uppercase tracking-widest"
              >Places Saved</span
            >
          </div>
          <div
            class="h-12 w-px bg-on-primary-container/20 hidden md:block"
          ></div>
          <div>
            <span
              class="font-headline text-[32px] leading-10 font-bold text-on-primary-container block"
              >{communityStats.data?.totalReviews ?? "0"}</span
            >
            <span
              class="font-label text-sm font-semibold text-on-primary-container/70 uppercase tracking-widest"
              >Reviews</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Events & Meetups -->
    <section class="py-16 max-w-7xl mx-auto px-5 md:px-12">
      <div class="flex justify-between items-end mb-10">
        <div>
          <span
            class="text-primary font-label text-xs font-bold uppercase tracking-widest mb-1 block"
            >Local Activity</span
          >
          <h2
            class="font-headline text-[32px] leading-10 font-bold text-on-surface"
          >
            Happening this Week
          </h2>
        </div>
        <button
          class="text-primary font-label text-sm font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          View all events <ArrowRight class="size-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Event Card 1 -->
        <div
          class="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/10 hover:shadow-md transition-all"
        >
          <div class="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              alt="Dogs running along a sandy shoreline at sunset."
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80"
            />
            <div
              class="absolute top-3 right-3 bg-surface/90 backdrop-blur px-3 py-1 rounded-full font-label text-xs font-bold text-on-surface"
            >
              OCT 24
            </div>
          </div>
          <h3 class="font-headline text-2xl font-bold text-on-surface mb-1">
            Golden Hour Beach Run
          </h3>
          <div
            class="flex items-center gap-1 text-on-surface-variant font-label text-sm font-semibold mb-6"
          >
            <span class="material-symbols-outlined" style="font-size:16px"
              >location_on</span
            >
            Sunset Cove, Malibu
          </div>
          <div class="flex justify-between items-center">
            <div class="flex -space-x-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-200"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-300"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary-container text-[10px] flex items-center justify-center font-bold"
              >
                +18
              </div>
            </div>
            <button
              class="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >RSVP</button
            >
          </div>
        </div>

        <!-- Event Card 2 -->
        <div
          class="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/10 hover:shadow-md transition-all"
        >
          <div class="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              alt="Dogs being led on a winding trail through a lush rainforest."
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"
            />
            <div
              class="absolute top-3 right-3 bg-surface/90 backdrop-blur px-3 py-1 rounded-full font-label text-xs font-bold text-on-surface"
            >
              OCT 26
            </div>
          </div>
          <h3 class="font-headline text-2xl font-bold text-on-surface mb-1">
            Mossy Trail Social Hike
          </h3>
          <div
            class="flex items-center gap-1 text-on-surface-variant font-label text-sm font-semibold mb-6"
          >
            <span class="material-symbols-outlined" style="font-size:16px"
              >location_on</span
            >
            Pine Ridge Trailhead
          </div>
          <div class="flex justify-between items-center">
            <div class="flex -space-x-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-400"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-500"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary-container text-[10px] flex items-center justify-center font-bold"
              >
                +12
              </div>
            </div>
            <button
              class="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >RSVP</button
            >
          </div>
        </div>

        <!-- Event Card 3 -->
        <div
          class="group bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/10 hover:shadow-md transition-all"
        >
          <div class="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              alt="Modern urban dog park at sunset with city dogs interacting."
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80"
            />
            <div
              class="absolute top-3 right-3 bg-surface/90 backdrop-blur px-3 py-1 rounded-full font-label text-xs font-bold text-on-surface"
            >
              OCT 27
            </div>
          </div>
          <h3 class="font-headline text-2xl font-bold text-on-surface mb-1">
            Urban Paws Mixer
          </h3>
          <div
            class="flex items-center gap-1 text-on-surface-variant font-label text-sm font-semibold mb-6"
          >
            <span class="material-symbols-outlined" style="font-size:16px"
              >location_on</span
            >
            Skyline Bark Park
          </div>
          <div class="flex justify-between items-center">
            <div class="flex -space-x-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-100"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-slate-600"
              ></div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface bg-primary-container text-on-primary-container text-[10px] flex items-center justify-center font-bold"
              >
                +25
              </div>
            </div>
            <button
              class="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >RSVP</button
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Community Reviews -->
    <section class="py-16 bg-surface-container-low">
      <div class="max-w-7xl mx-auto px-5 md:px-12">
        <div class="mb-10">
          <span
            class="text-secondary font-label text-xs font-bold uppercase tracking-widest mb-1 block"
            >Field Reports</span
          >
          <h2
            class="font-headline text-[32px] leading-10 font-bold text-on-surface"
          >
            Latest from the Field
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Review 1 -->
          <div
            class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/5 hover:-translate-y-1 transition-transform"
          >
            <div class="flex items-center gap-3 mb-6">
              <img
                alt="Sarah Miller"
                class="w-10 h-10 rounded-full object-cover"
                src="https://i.pravatar.cc/150?img=5"
              />
              <div class="flex-1">
                <h4 class="font-label text-sm font-semibold text-on-surface">
                  Sarah Miller
                </h4>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4, 5] as _}
                    <Star class="size-3 fill-primary-tint text-primary-tint" />
                  {/each}
                </div>
              </div>
            </div>
            <p
              class="text-on-surface-variant font-body text-base mb-6 line-clamp-3"
            >
              "Absolute hidden gem! The trail was perfectly marked and the water
              station at the midpoint was a lifesaver for Cooper."
            </p>
            <div class="relative h-40 rounded-2xl overflow-hidden group">
              <img
                alt="Bluebell Reserve"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80"
              />
              <div
                class="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded font-label text-xs text-white"
              >
                Bluebell Reserve
              </div>
            </div>
          </div>

          <!-- Review 2 -->
          <div
            class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/5 hover:-translate-y-1 transition-transform"
          >
            <div class="flex items-center gap-3 mb-6">
              <img
                alt="Marcus Chen"
                class="w-10 h-10 rounded-full object-cover"
                src="https://i.pravatar.cc/150?img=11"
              />
              <div class="flex-1">
                <h4 class="font-label text-sm font-semibold text-on-surface">
                  Marcus Chen
                </h4>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4] as _}
                    <Star class="size-3 fill-primary-tint text-primary-tint" />
                  {/each}
                  <Star class="size-3 text-primary-tint" />
                </div>
              </div>
            </div>
            <p
              class="text-on-surface-variant font-body text-base mb-6 line-clamp-3"
            >
              "Great elevation for a workout, but quite busy on weekends. The
              panoramic view of the city at the peak makes it all worth it."
            </p>
            <div class="relative h-40 rounded-2xl overflow-hidden group">
              <img
                alt="Summit Ridge"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"
              />
              <div
                class="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded font-label text-xs text-white"
              >
                Summit Ridge
              </div>
            </div>
          </div>

          <!-- Review 3 -->
          <div
            class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline/5 hover:-translate-y-1 transition-transform"
          >
            <div class="flex items-center gap-3 mb-6">
              <img
                alt="Elena Rossi"
                class="w-10 h-10 rounded-full object-cover"
                src="https://i.pravatar.cc/150?img=9"
              />
              <div class="flex-1">
                <h4 class="font-label text-sm font-semibold text-on-surface">
                  Elena Rossi
                </h4>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4, 5] as _}
                    <Star class="size-3 fill-primary-tint text-primary-tint" />
                  {/each}
                </div>
              </div>
            </div>
            <p
              class="text-on-surface-variant font-body text-base mb-6 line-clamp-3"
            >
              "Perfect for senior dogs. Very flat, paved paths and plenty of
              benches to stop and take in the lake views."
            </p>
            <div class="relative h-40 rounded-2xl overflow-hidden group">
              <img
                alt="Silver Lake Loop"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80"
              />
              <div
                class="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded font-label text-xs text-white"
              >
                Silver Lake Loop
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
    <MobileBottomNav {user} />
  </div>
</phantom-ui>
