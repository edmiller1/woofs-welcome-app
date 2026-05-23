<script lang="ts">
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import hero from "$lib/assets/hero.jpg";
  import { ArrowRight } from "@lucide/svelte";

  let { data } = $props();
  const user = $derived(data.user);
</script>

<div class="bg-surface min-h-screen text-on-surface">
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
          Adventure is better with <span class="text-primary-container"
            >four paws.</span
          >
        </h1>
        <p class="font-body text-lg leading-7 text-on-surface-variant">
          Discover thousands of verified dog-friendly trails, hidden parks, and
          local outdoor communities tailored for you and your best friend.
        </p>
        <div class="flex flex-col sm:flex-row gap-2 pt-6">
          <a
            href="/explore"
            class="px-16 py-3 bg-primary-container text-on-primary-container font-headline font-bold text-base rounded-full shadow-lg active:scale-95 transition-transform duration-200 cursor-pointer"
          >
            Start Exploring
          </a>
          <a
            href="/community"
            class="px-16 py-3 border-2 border-secondary text-secondary font-headline font-bold text-base rounded-full hover:bg-secondary/10 transition-colors cursor-pointer"
          >
            Community
          </a>
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
          <p class="font-body text-base text-on-surface-variant">
            Hand-picked wild spots for your next weekend escape.
          </p>
        </div>
        <button
          class="text-primary font-label text-sm font-semibold flex items-center gap-1 hover:underline transition-all cursor-pointer"
        >
          View all spots <ArrowRight class="size-4" />
        </button>
      </div>

      <div class="flex flex-col gap-2">
        <!-- Row 1: wide left, narrow right -->
        <div class="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-2 h-96">
          <div
            class="group relative rounded-3xl cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all border border-outline/10"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="A breathtaking view of a winding trail through the Swiss Alps with snow-capped peaks."
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-6 text-white">
              <div class="flex gap-2 mb-2">
                <span
                  class="bg-secondary-container/90 text-on-secondary-container px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide"
                  >Moderate</span
                >
                <span
                  class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide"
                  >8.2 miles</span
                >
              </div>
              <h3 class="font-headline text-2xl font-bold">
                Silver Peak Ridge
              </h3>
              <p class="font-body text-sm opacity-90">Snoqualmie Region, WA</p>
            </div>
          </div>

          <div
            class="group relative rounded-3xl cursor-pointer overflow-hidden shadow-lg border border-outline/10"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="A lush forest path lined with giant ferns and towering redwoods."
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-5 text-white">
              <span
                class="bg-primary-container/90 text-on-primary-container px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide mb-2 inline-block"
                >Easy</span
              >
              <h4 class="font-headline text-xl font-bold">Fern Canyon Loop</h4>
            </div>
          </div>
        </div>

        <!-- Row 2: narrow left, wide right -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-2 h-96">
          <div
            class="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg border border-outline/10"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="A serene alpine lake with crystal clear turquoise water."
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-5 text-white">
              <span
                class="bg-destructive/90 text-white px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide mb-2 inline-block"
                >Hard</span
              >
              <h4 class="font-headline text-xl font-bold">Azure Lake Trail</h4>
            </div>
          </div>

          <div
            class="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all border border-outline/10"
          >
            <img
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="A dramatic coastal trail with crashing waves and rugged cliffs."
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-6 text-white">
              <div class="flex gap-2 mb-2">
                <span
                  class="bg-destructive/90 text-white px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide"
                  >Hard</span
                >
                <span
                  class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-label text-xs font-bold tracking-wide"
                  >11.6 miles</span
                >
              </div>
              <h3 class="font-headline text-2xl font-bold">
                Coastal Cliffs Loop
              </h3>
              <p class="font-body text-sm opacity-90">Big Sur, CA</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Community Reviews -->
    <section class="bg-surface-container-low py-16 px-5 md:px-12">
      <div class="max-w-7xl mx-auto space-y-10">
        <div class="text-center space-y-1">
          <h2
            class="font-headline text-[32px] leading-10 font-bold text-on-surface"
          >
            Recent Activity
          </h2>
          <p class="font-body text-base text-on-surface-variant">
            The latest reviews from our community.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Review 1 -->
          <div
            class="bg-surface p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-outline/5 space-y-3"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-12 h-12 rounded-full object-cover"
                alt="Mark Thompson"
                src="https://i.pravatar.cc/150?img=11"
              />
              <div>
                <p class="font-label text-sm font-semibold text-on-surface">
                  Mark Thompson
                </p>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4, 5] as _}
                    <span
                      class="material-symbols-outlined"
                      style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24"
                      >star</span
                    >
                  {/each}
                </div>
              </div>
            </div>
            <p class="font-body text-base text-on-surface-variant italic">
              "Found the best off-leash area through the map filters. Bella had
              the time of her life at Silver Peak Ridge!"
            </p>
            <div
              class="pt-2 border-t border-outline/10 text-xs text-secondary font-label font-bold flex items-center gap-1"
            >
              <span class="material-symbols-outlined" style="font-size:14px"
                >location_on</span
              > Silver Peak Ridge
            </div>
          </div>

          <!-- Review 2 -->
          <div
            class="bg-surface p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-outline/5 space-y-3"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-12 h-12 rounded-full object-cover"
                alt="Sarah Jenkins"
                src="https://i.pravatar.cc/150?img=5"
              />
              <div>
                <p class="font-label text-sm font-semibold text-on-surface">
                  Sarah Jenkins
                </p>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4] as _}
                    <span
                      class="material-symbols-outlined"
                      style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24"
                      >star</span
                    >
                  {/each}
                  <span class="material-symbols-outlined" style="font-size:16px"
                    >star</span
                  >
                </div>
              </div>
            </div>
            <p class="font-body text-base text-on-surface-variant italic">
              "The trail difficulty ratings are spot on. Helped me choose the
              right path for my senior pup."
            </p>
            <div
              class="pt-2 border-t border-outline/10 text-xs text-secondary font-label font-bold flex items-center gap-1"
            >
              <span class="material-symbols-outlined" style="font-size:14px"
                >location_on</span
              > Fern Canyon Loop
            </div>
          </div>

          <!-- Review 3 -->
          <div
            class="bg-surface p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-outline/5 space-y-3"
          >
            <div class="flex items-center gap-3">
              <img
                class="w-12 h-12 rounded-full object-cover"
                alt="Alex Rivera"
                src="https://i.pravatar.cc/150?img=15"
              />
              <div>
                <p class="font-label text-sm font-semibold text-on-surface">
                  Alex Rivera
                </p>
                <div class="flex text-primary-container">
                  {#each [1, 2, 3, 4] as _}
                    <span
                      class="material-symbols-outlined"
                      style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24"
                      >star</span
                    >
                  {/each}
                  <span
                    class="material-symbols-outlined"
                    style="font-size:16px;font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24"
                    >star_half</span
                  >
                </div>
              </div>
            </div>
            <p class="font-body text-base text-on-surface-variant italic">
              "Woofs Welcome has changed how we hike. The community reviews are
              incredibly helpful!"
            </p>
            <div
              class="pt-2 border-t border-outline/10 text-xs text-secondary font-label font-bold flex items-center gap-1"
            >
              <span class="material-symbols-outlined" style="font-size:14px"
                >location_on</span
              > Azure Lake Trail
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- App CTA Section -->
    <section class="py-16 px-5 md:px-12 overflow-hidden">
      <div
        class="max-w-7xl mx-auto bg-secondary text-on-secondary rounded-[40px] p-10 md:p-16 relative flex flex-col md:flex-row items-center gap-16"
      >
        <div class="flex-1 space-y-6 z-10">
          <span
            class="bg-primary-container text-on-primary-container px-6 py-1 rounded-full font-label text-sm font-semibold uppercase tracking-wider"
            >Coming Soon</span
          >
          <h2
            class="font-headline text-[48px] leading-14 font-extrabold text-white tracking-tight"
          >
            Adventure in your pocket.
          </h2>
          <p class="font-body text-lg leading-7 opacity-80">
            Download the Woofs Welcome app for offline maps, real-time weather
            alerts, and a digital passport for your dog's achievements.
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
  <MobileBottomNav {user} />
</div>
