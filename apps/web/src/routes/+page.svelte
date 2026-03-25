<script lang="ts">
  import {
    ArrowRight,
    Star,
    Compass,
    Coffee,
    Trees,
    Bed,
    Stethoscope,
    ChevronRight,
  } from "@lucide/svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import Footer from "$lib/components/footer.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Navbar from "$lib/components/navbar.svelte";

  let { data } = $props();
  const user = $derived(data.user);

  let selectedCity = $state<string>("");
  let selectedType = $state<string>("");
  let exploreUrl = $state<string>("/explore");
</script>

<div class="bg-surface min-h-screen">
  <!-- Navbar -->
  <HomeNavbar {user} />
  <main class="pt-24 max-w-screen-2xl mx-auto px-8 md:px-16">
    <!-- Hero Section -->
    <section
      class="relative px-8 lg:px-16 py-12 lg:py-24 max-w-screen-2xl mx-auto"
    >
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 z-10">
          <h1
            class="font-headline text-5xl lg:text-7xl font-bold text-on-surface leading-tight mb-6"
          >
            Explore new Zealand's <br />
            <span class="italic text-primary">dog-friendly places.</span>
          </h1>
          <p class="text-lg text-stone-600 max-w-xl mb-10 leading-relaxed">
            The modern guide to exploration with your best friend. From alpine
            trails to coastal cafes, we curate the finest dog-friendly
            experiences.
          </p>
          <!-- Global Search Bar -->
          <div
            class="bg-white p-2 rounded-full shadow-sm flex items-center max-w-2xl border border-outline-variant/20"
          >
            <div class="flex flex-1 items-center px-6 gap-3">
              <Compass class="text-primary size-5" />
              <input
                class="w-full border-none outline-none ring-none rounded-full font-medium py-3 text-on-surface"
                placeholder="Where are you and your pups headed?"
                type="text"
              />
            </div>
            <Button class="px-8 py-3 rounded-full font-bold">Search</Button>
          </div>
        </div>
        <!-- Hero Image -->
        <div class="lg:col-span-5 relative">
          <div
            class="relative rounded-2xl overflow-hidden aspect-4/5 shadow--sm transform rotate-2"
          >
            <img
              alt="main"
              class="w-full h-full object-cover"
              data-alt="A golden retriever dog wearing a bandana looking at mountains"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnZ2PCel_OFmRSW8pgRBglwszyWlEdVPOfmodbCu8GsUCI3t5-HPjau8VkkzVWFweXoPSOuAAB3G3-IoiCb7-xRh5b7RuUuOhivuhXFggj1HB5ESA9avEls5g1xGVwyC9VHJY3V4QncoInpoVuE2Vn6CAeyeJN8ePSgWrJZ4CWDfNmhuI-8epxEjrHcsVrAfabq1j98XibBeqvKz6BBXNR-K-Yq-M8usKG7AKNqXDweJKKHFfjoE3I4clqjYwcnjPyeHN4jeIOBFDQ"
            />
          </div>
          <div
            class="absolute -bottom-8 -left-8 bg-secondary-container p-6 rounded-2xl shadow-sm transform -rotate-3 max-w-xs hidden md:block"
          >
            <p
              class="font-headline italic text-secondary text-xl font-bold mb-2"
            >
              "The best travel companion I've ever had."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-fixed"></div>
              <span class="text-sm font-bold text-on-secondary-container"
                >Courteney & the fluffs, Canterbury</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Places Section -->
    <section class="bg-surface-container-low py-20 px-8 lg:px-16">
      <div class="max-w-screen-2xl mx-auto">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="font-headline text-3xl font-bold mb-2">
              Explore thousands of locations
            </h2>
            <p class="text-stone-500">
              From cafés to accomodations to dog-friendly parks, we've got you
              covered.
            </p>
          </div>
          <a
            class={cn(buttonVariants({ variant: "link" }), "text-base group")}
            href="/"
          >
            View All
            <ArrowRight
              class="text-primary group-hover:translate-x-1 transition-transform duration-150"
            />
          </a>
        </div>
        <!-- Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            class="group bg-white p-8 rounded-xl shadow-sm transition-all duration-300 cursor-pointer"
          >
            <div
              class="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors"
            >
              <Coffee class="text-on-secondary-fixed-variant" />
            </div>
            <h3 class="text-xl font-bold group-hover:text-on-primary">
              Places to eat
            </h3>
            <p
              class="text-stone-500 group-hover:text-on-primary-container text-sm mt-2"
            >
              1,240+ locations
            </p>
          </div>
          <div
            class="group bg-white p-8 rounded-xl shadow-sm transition-all duration-300 cursor-pointer"
          >
            <div
              class="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors"
            >
              <Trees class="text-on-primary-fixed-variant" />
            </div>
            <h3 class="text-xl font-bold group-hover:text-on-primary">
              Adventures
            </h3>
            <p
              class="text-stone-500 group-hover:text-on-primary-container text-sm mt-2"
            >
              3,500+ trails
            </p>
          </div>
          <div
            class="group bg-white p-8 rounded-xl shadow-sm transition-all duration-300 cursor-pointer"
          >
            <div
              class="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors"
            >
              <Bed class="text-on-tertiary-fixed-variant" />
            </div>
            <h3 class="text-xl font-bold group-hover:text-on-primary">
              Accomodation
            </h3>
            <p
              class="text-stone-500 group-hover:text-on-primary-container text-sm mt-2"
            >
              850+ stays
            </p>
          </div>
          <div
            class="group bg-white p-8 rounded-xl shadow-sm transition-all duration-300 cursor-pointer"
          >
            <div
              class="w-14 h-14 rounded-full bg-outline-variant/30 flex items-center justify-center mb-6 group-hover:bg-primary-container transition-colors"
            >
              <Stethoscope class="text-stone-700" />
            </div>
            <h3 class="text-xl font-bold group-hover:text-on-primary">
              Services
            </h3>
            <p
              class="text-stone-500 group-hover:text-on-primary-container text-sm mt-2"
            >
              2,100+ businesses
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Destinations -->
    <section class="py-24 px-8 lg:px-16 max-w-screen-2xl mx-auto">
      <div class="mb-16 text-center max-w-2xl mx-auto">
        <span class="text-primary font-bold tracking-widest text-xs uppercase"
          >Curated Collections
        </span>
        <h2 class="font-headline text-4xl lg:text-5xl font-bold mt-4 mb-6">
          Dog-Friendly Destinations
        </h2>
        <p class="text-stone-600">
          Hand-picked escapes where the landscape is as welcoming as the people.
        </p>
      </div>
      <!-- Bento-style Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <!-- Large card -->
        <div
          class="md:col-span-8 group relative overflow-hidden rounded-2xl h-125 shadow-sm"
        >
          <img
            alt="location"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-alt="Two small dogs running on a sunny beach with white sand"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjLNY_39HkjSsJ4xA0DUQHFcwP2l9JJr6xEktiT_XNxC2RKLcK1dvfJEbj4uGf406FQMn7-CbddX0ntZhitwG2wBwwv5ziV4nY8pLzaY-DJqR2P0pdQCiiqedBXJYGHaI5LwUEKp8GU8rMFnYPHRs5xUT57PBbW3xkyySavdWyzTi_ZWercovBMEtF356t_Lv2qX05dlUM7c2WQeQTnZScqmni6Bg4EyHVTxzRJzNdPrjfT4lGtucGf8mE6N7kthFajblhGjnBnZvt"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-on-surface/80 to-transparent"
          ></div>
          <div class="absolute bottom-0 p-10">
            <!-- <div class="flex gap-2 mb-4">
              <span
                class="bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs px-3 py-1 rounded-full"
                >MUST VISIT</span
              >
              <span
                class="bg-primary-fixed text-on-primary-fixed font-bold text-xs px-3 py-1 rounded-full"
                >BEACHES</span
              >
            </div> -->
            <h3 class="font-headline text-4xl text-white font-bold mb-4">
              The Golden Coast of Portugal
            </h3>
            <p class="text-stone-200 max-w-lg mb-6">
              Endless dunes and dog-friendly cliffside paths await you in the
              Algarve region.
            </p>
            <button
              class="cursor-pointer bg-white text-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all"
            >
              Explore Algarve
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
        <!-- Vertical card -->
        <div
          class="md:col-span-4 group relative overflow-hidden rounded-2xl h-125 shadow-sm cursor-pointer"
        >
          <img
            alt="loaction"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-alt="A dog sitting calmly on a vintage wooden boat in a lake"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFIEtilVSLkK0MSPSX6sqkV4jIIptsvaPQIk38RiohVmTuTk_idKwdmHO20mNrMRZpFeOZbqS5PZxhZ8sKeMA7gy0DGRCTDL2IlArsXtuvo8W6P-mzFnZAfP0UmGg5sw-qffN37zu77isVHengExFyJW0Y9gBVGWQTlhLSyrjk2h8SXxTWES1c50rZU6nLXfB7Qgl2lx39k9lbh4BzmUN1M--GMOQzZMPgmd8vIVhq4Smo_VYMIhDhg3TQrg0j3LpOntaxnEtDmLXD"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-on-surface/80 to-transparent"
          ></div>
          <div class="absolute bottom-0 p-8">
            <!-- <div class="flex gap-2 mb-4">
              <span
                class="bg-secondary-fixed text-on-secondary-fixed font-bold text-xs px-3 py-1 rounded-full"
                >SERENE</span
              >
            </div> -->
            <h3 class="font-headline text-2xl text-white font-bold mb-3">
              Lake Como Retreats
            </h3>
            <p class="text-stone-300 text-sm mb-4">
              Luxury villas that welcome four-legged royalty.
            </p>
            <!-- <a
              class="text-tertiary-fixed-dim font-bold text-sm underline underline-offset-4"
              href="/">Read the Guide</a
            > -->
          </div>
        </div>
        <!-- Bottom Row -->
        <div
          class="md:col-span-6 group relative overflow-hidden rounded-2xl h-87.5 shadow-sm cursor-pointer"
        >
          <img
            alt="location"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-alt="A hiker and their dog looking at the Dolomite mountains in Italy"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCycaOdJDLNNW2AvR7HEXQsSuFs4-t2fqRYPDFT_ixP5VkCw2Lehy_y-PnyKTXzwgQTwKryh7jc9BxqoNv6wQacKOcPn47sUbkye6uaK4_ReEjM_s806UhrdnRILVAO6wSrDf3O9c6hYC-RwVvChNIHbd1vhGKiSCkwDwMajUbhj3RvYVQNMi43Hrmf_r14-WXXbRMnomri-h3Vo3hSFu3hDujwvrwtJOAHeUOEJU4exiais0B3YZVrP_0end_SMRcl9a3A-25MYFYW"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-on-surface/80 to-transparent"
          ></div>
          <div class="absolute bottom-0 p-8">
            <h3 class="font-headline text-2xl text-white font-bold">
              Dolomite Hiking Trails
            </h3>
            <p class="text-stone-300 text-sm">
              High-altitude adventure for energetic breeds.
            </p>
          </div>
        </div>
        <div
          class="md:col-span-6 group relative overflow-hidden rounded-2xl h-87.5 shadow-sm cursor-pointer"
        >
          <img
            alt="location"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-alt="A dog sitting outside a charming Parisian cafe"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2R_F8G5Nwr0H8J8UcKRDNViriTFyW6AQoKUHJtg36ObMzgvQS3XTh5ZciQsaKHPAjrr0kcHWcCKZcqFCLQef1YBFeKUZ14QrL-iPseHFRfUh3tBsqv0xF7zoVVXLlf8N9rWbFpjSqhYayWXsnHN4SlaaTwoMk3X4N3ZlahkGny5N96XAIktEADeLtCPfmPUX8vPRLpw4o42ri4lJwQpp8H2P62xA-aqXJwatbZNLO-9NEdh8dwbbRmT3buuG2zH1BSo6nPn-S1fIs"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-on-surface/80 to-transparent"
          ></div>
          <div class="absolute bottom-0 p-8">
            <h3 class="font-headline text-2xl text-white font-bold">
              Parisian Patio Culture
            </h3>
            <p class="text-stone-300 text-sm">
              The chicest dog-friendly brasseries in the 7th.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile App Promotion Section -->
    <section
      class="bg-surface-container-low py-24 px-8 lg:px-16 overflow-hidden"
    >
      <div
        class="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div class="order-2 lg:order-1 flex justify-center lg:justify-start">
          <div
            class="relative w-full max-w-[320px] aspect-[9/19.5] bg-on-surface rounded-[3rem] border-8 border-on-surface mockup-shadow overflow-hidden"
          >
            <div
              class="absolute top-0 inset-x-0 h-6 bg-on-surface z-20 flex justify-center"
            >
              <div class="w-24 h-5 bg-on-surface rounded-b-2xl"></div>
            </div>
            <div class="w-full h-full bg-white relative overflow-hidden">
              <div
                class="w-full h-full border-none pointer-events-none scale-[1.01]"
              ></div>
            </div>
          </div>
        </div>
        <div class="order-1 lg:order-2 space-y-8">
          <h2
            class="font-headline text-4xl lg:text-5xl font-bold text-on-surface leading-tight"
          >
            Adventure in your pocket.
          </h2>
          <p class="text-lg text-stone-600 leading-relaxed max-w-xl">
            The Pawsport Explorer app is the perfect field companion for you and
            your dog. Find nearby spots, get turn-by-turn directions, and share
            moments with the community on the go.
          </p>
          <div class="flex flex-wrap gap-4 pt-4">
            <!-- App Store Badge -->
            <a
              class="inline-block transition-transform hover:scale-105 active:scale-95"
              href="/"
              aria-label="Download on the App Store"
            >
              <svg
                class="h-12 w-auto"
                viewBox="0 0 135 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="135" height="40" rx="7" fill="#000" />
                <path
                  d="M24.768 20.3c-.028-3.22 2.635-4.79 2.756-4.864-1.504-2.196-3.839-2.496-4.664-2.523-1.967-.201-3.875 1.174-4.878 1.174-1.021 0-2.567-1.154-4.228-1.12-2.143.033-4.143 1.265-5.244 3.18-2.267 3.919-.578 9.687 1.594 12.853 1.085 1.553 2.356 3.287 4.018 3.226 1.623-.066 2.23-1.034 4.19-1.034 1.943 0 2.511 1.034 4.21.996 1.746-.029 2.845-1.56 3.896-3.125 1.248-1.78 1.754-3.527 1.773-3.616-.04-.015-3.388-1.294-3.423-5.147z"
                  fill="#fff"
                />
                <path
                  d="M21.594 11.52c.876-1.093 1.474-2.587 1.307-4.102-1.265.054-2.838.872-3.75 1.94-.808.94-1.527 2.488-1.338 3.947 1.42.107 2.875-.713 3.781-1.785z"
                  fill="#fff"
                />
                <text
                  x="42"
                  y="14"
                  fill="#fff"
                  font-family="-apple-system,BlinkMacSystemFont,sans-serif"
                  font-size="7.5">Download on the</text
                >
                <text
                  x="41"
                  y="27"
                  fill="#fff"
                  font-family="-apple-system,BlinkMacSystemFont,sans-serif"
                  font-size="14"
                  font-weight="600"
                  letter-spacing="-0.3">App Store</text
                >
              </svg>
            </a>
            <!-- Google Play Badge -->
            <a
              class="inline-block transition-transform hover:scale-105 active:scale-95"
              href="/"
              aria-label="Get it on Google Play"
            >
              <svg
                class="h-12 w-auto"
                viewBox="0 0 135 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="135" height="40" rx="7" fill="#000" />
                <path
                  d="M7.5 7.02A1.5 1.5 0 0 0 7 8.22v23.56a1.5 1.5 0 0 0 .5 1.2l.06.06 13.2-13.2v-.31L7.56 6.96l-.06.06z"
                  fill="url(#gp-a)"
                />
                <path
                  d="M24.76 23.8l-4.4-4.4v-.32l4.4-4.4.1.06 5.2 2.96c1.49.84 1.49 2.22 0 3.07l-5.2 2.96-.1.07z"
                  fill="url(#gp-b)"
                />
                <path
                  d="M24.86 23.74L20.36 19.2 7.5 32.04c.49.52 1.3.58 2.21.07l15.15-8.37"
                  fill="url(#gp-c)"
                />
                <path
                  d="M24.86 16.26L9.71 7.9C8.8 7.38 7.99 7.45 7.5 7.97L20.36 20.8l4.5-4.54z"
                  fill="url(#gp-d)"
                />
                <defs>
                  <linearGradient
                    id="gp-a"
                    x1="20.03"
                    y1="8.22"
                    x2="4.63"
                    y2="23.62"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#00A0FF" />
                    <stop offset="1" stop-color="#00BFFF" />
                  </linearGradient>
                  <linearGradient
                    id="gp-b"
                    x1="31.8"
                    y1="20"
                    x2="6.96"
                    y2="20"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#FFE000" />
                    <stop offset="1" stop-color="#FFBD00" />
                  </linearGradient>
                  <linearGradient
                    id="gp-c"
                    x1="22.83"
                    y1="22.3"
                    x2="2.07"
                    y2="43.06"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#FF3A44" />
                    <stop offset="1" stop-color="#C31162" />
                  </linearGradient>
                  <linearGradient
                    id="gp-d"
                    x1="4.19"
                    y1="1.8"
                    x2="13.43"
                    y2="11.04"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#32A071" />
                    <stop offset="1" stop-color="#2DA771" />
                  </linearGradient>
                </defs>
                <text
                  x="42"
                  y="14"
                  fill="#fff"
                  font-family="-apple-system,BlinkMacSystemFont,sans-serif"
                  font-size="7.5">GET IT ON</text
                >
                <text
                  x="41"
                  y="27"
                  fill="#fff"
                  font-family="-apple-system,BlinkMacSystemFont,sans-serif"
                  font-size="14"
                  font-weight="600"
                  letter-spacing="-0.3">Google Play</text
                >
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Places Section -->
    <section class="bg-surface py-24 px-8 lg:px-16">
      <div class="max-w-screen-2xl mx-auto">
        <div class="text-center mb-16">
          <h2
            class="font-headline text-4xl lg:text-5xl font-bold text-primary mb-6"
          >
            The Dog-Friendly Field Guide
          </h2>
          <p class="text-lg text-stone-600 max-w-2xl mx-auto">
            Verified reports from our community of explorers, documenting the
            most pristine and pup-friendly spaces across the New Zealand.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <!-- Card 1 -->
          <div
            class="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary/30 transition-all group editorial-shadow"
          >
            <div class="aspect-16/10 overflow-hidden relative">
              <img
                alt="Mountain trail with pine trees"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCycaOdJDLNNW2AvR7HEXQsSuFs4-t2fqRYPDFT_ixP5VkCw2Lehy_y-PnyKTXzwgQTwKryh7jc9BxqoNv6wQacKOcPn47sUbkye6uaK4_ReEjM_s806UhrdnRILVAO6wSrDf3O9c6hYC-RwVvChNIHbd1vhGKiSCkwDwMajUbhj3RvYVQNMi43Hrmf_r14-WXXbRMnomri-h3Vo3hSFu3hDujwvrwtJOAHeUOEJU4exiais0B3YZVrP_0end_SMRcl9a3A-25MYFYW"
              />
              <div class="absolute top-4 left-4">
                <Badge class="">Hike</Badge>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-1 mb-3">
                {#each Array(5) as _}
                  <Star class="size-3.5 fill-yellow-400 text-yellow-400" />
                {/each}
                <span class="text-xs font-bold text-stone-400 ml-1">4.9</span>
              </div>
              <h3 class="font-headline text-2xl font-bold text-on-surface mb-3">
                Whistler’s Peak Ascent
              </h3>
              <p
                class="text-sm text-stone-500 leading-relaxed italic border-l-2 border-primary-fixed pl-4"
              >
                "Field Report: The morning mist cleared to reveal wide,
                pine-scented paths. Cooper handled the elevation gain with ease.
                Perfect shade coverage."
              </p>
            </div>
          </div>
          <!-- Card 2 -->
          <div
            class="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary/30 transition-all group editorial-shadow"
          >
            <div class="aspect-16/10 overflow-hidden relative">
              <img
                alt="Rugged coastline with clear blue water"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjLNY_39HkjSsJ4xA0DUQHFcwP2l9JJr6xEktiT_XNxC2RKLcK1dvfJEbj4uGf406FQMn7-CbddX0ntZhitwG2wBwwv5ziV4nY8pLzaY-DJqR2P0pdQCiiqedBXJYGHaI5LwUEKp8GU8rMFnYPHRs5xUT57PBbW3xkyySavdWyzTi_ZWercovBMEtF356t_Lv2qX05dlUM7c2WQeQTnZScqmni6Bg4EyHVTxzRJzNdPrjfT4lGtucGf8mE6N7kthFajblhGjnBnZvt"
              />
              <div class="absolute top-4 left-4">
                <Badge variant="secondary" class="">Beach</Badge>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-1 mb-3">
                {#each Array(4) as _}
                  <Star class="size-3.5 fill-yellow-400 text-yellow-400" />
                {/each}
                <span class="text-xs font-bold text-stone-400 ml-1">4.2</span>
              </div>
              <h3 class="font-headline text-2xl font-bold text-on-surface mb-3">
                Azure Cove Inlet
              </h3>
              <p
                class="text-sm text-stone-500 leading-relaxed italic border-l-2 border-primary-fixed pl-4"
              >
                "Field Report: A steep descent, but the reward is a private
                crystalline bay. Off-leash is common here during sunrise hours.
                Watch for tide pools."
              </p>
            </div>
          </div>
          <!-- Card 3 -->
          <div
            class="bg-white rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary/30 transition-all group editorial-shadow"
          >
            <div class="aspect-16/10 overflow-hidden relative">
              <img
                alt="Dense lush forest trail"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnZ2PCel_OFmRSW8pgRBglwszyWlEdVPOfmodbCu8GsUCI3t5-HPjau8VkkzVWFweXoPSOuAAB3G3-IoiCb7-xRh5b7RuUuOhivuhXFggj1HB5ESA9avEls5g1xGVwyC9VHJY3V4QncoInpoVuE2Vn6CAeyeJN8ePSgWrJZ4CWDfNmhuI-8epxEjrHcsVrAfabq1j98XibBeqvKz6BBXNR-K-Yq-M8usKG7AKNqXDweJKKHFfjoE3I4clqjYwcnjPyeHN4jeIOBFDQ"
              />
              <div class="absolute top-4 left-4">
                <Badge class="">Trail</Badge>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-1 mb-3">
                {#each Array(5) as _}
                  <Star class="size-3.5 fill-yellow-400 text-yellow-400" />
                {/each}
                <span class="text-xs font-bold text-stone-400 ml-1">5.0</span>
              </div>
              <h3 class="font-headline text-2xl font-bold text-on-surface mb-3">
                Emerald Canopy Walk
              </h3>
              <p
                class="text-sm text-stone-500 leading-relaxed italic border-l-2 border-primary-fixed pl-4"
              >
                "Field Report: The mossy floor is incredibly soft on paws. We
                encountered three other groups, all with well-behaved
                companions. Truly magical light."
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <Button size="lg">Browse More Places</Button>
        </div>
      </div>
    </section>
  </main>
  <Footer />
  <MobileBottomNav {user} />
</div>
