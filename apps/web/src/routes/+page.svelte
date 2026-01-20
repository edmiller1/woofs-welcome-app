<script lang="ts">
  import {
    Search,
    ChevronDown,
    ArrowRight,
    MapPin,
    SlidersHorizontal,
    Share,
    Camera,
    Star,
    Heart,
  } from "@lucide/svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { fade } from "svelte/transition";
  import hero from "$lib/assets/hero.png";
  import HomeNavbar from "$lib/components/home-navbar.svelte";

  let { data } = $props();
  const user = $derived(data.user);

  let selectedCity = $state<string>("");
  let selectedType = $state<string>("");
  let exploreUrl = $state<string>("/explore");
</script>

<div class="bg-background min-h-screen">
  <!-- Navbar -->
  <HomeNavbar {user} />
  <div class="-lg:px-8 -md:px-5 mx-auto w-full px-12">
    <div class="max-w-screen-3xl mx-auto">
      <div
        class="xs:-mt-20 grid items-center gap-x-20 gap-y-7 py-12 xl:min-h-screen xl:grid-cols-[760px_auto] xl:py-20"
      >
        <div class="flex flex-col">
          <h1 class="text-foreground mb-6 text-2xl font-bold md:text-6xl">
            <span class="text-primary">Discover</span> and
            <span class="text-primary">explore</span>
            New Zealand's <span class="text-primary">dog-friendly</span> places
          </h1>
          <h2 class="text-foregound mb-8 text-xl">
            Find your next adventure with your furry companions.
          </h2>
          <div
            class="mt-8 flex h-16 w-full flex-col rounded-full bg-white shadow-lg shadow-black/10 md:max-w-135 md:flex-row xl:mt-10"
          >
            <div class="flex w-full items-center">
              <div class="pl-4 pr-2">
                <Search class="text-muted-foreground h-5 w-5" />
              </div>

              <div class="w-full">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger class="w-full px-1">
                    <button
                      class="text-foreground hover:bg-muted focus:ring-ring mt-2 h-full w-full cursor-pointer rounded-full px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 xl:mt-0"
                    >
                      <div class="flex w-full items-center justify-between">
                        <span class="text-base font-medium"
                          >{selectedCity ? selectedCity : "All Cities"}</span
                        >
                        <ChevronDown
                          class="text-muted-foreground h-4 w-4 shrink-0"
                        />
                      </div>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content></DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
              <div class="bg-border mx-2 h-8 w-px"></div>
              <div class="w-full">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger class="w-full px-1">
                    <button
                      class="text-foreground hover:bg-muted focus:ring-ring mt-2 w-full cursor-pointer rounded-full px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 xl:mt-0"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-base font-medium"
                          >{selectedType ? selectedType : "All Types"}</span
                        >
                        <ChevronDown class="text-muted-foreground h-4 w-4" />
                      </div>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    class="absolute top-1 -ml-72 mt-3 max-h-64 w-130 overflow-y-auto"
                    align="start"
                    side="bottom"
                  ></DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>

          <div class="mt-7 xl:mt-8">
            <a href={exploreUrl}>
              <button
                class="border-background bg-secondary text-background hover:bg-secondary-hoverinline-flex group flex cursor-pointer items-center rounded-full border px-20 py-5 duration-200"
                >Start Exploring <ArrowRight
                  class="ml-2 size-5 transition-transform group-hover:translate-x-2"
                />
              </button>
            </a>
          </div>
        </div>

        <div
          class="rounded-4xl order-first m-auto w-full overflow-hidden xl:order-last"
        >
          <img class="h-auto w-200 rounded-xl" src={hero} alt="--" />
        </div>
      </div>
    </div>
  </div>

  <!-- Carousel -->

  <!-- App Features -->
  <div class="bg-[#fefaf5] py-16 lg:py-24">
    <div class="mx-auto w-full px-12">
      <div class="max-w-screen-3xl mx-auto">
        <!-- Section Header -->
        <div class="mb-16 text-center" transition:fade>
          <h2 class="text-3xl md:text-[44px] md:leading-15">
            Take your adventures on the go
          </h2>
          <p class="mx-auto max-w-2xl text-xl text-zinc-500 md:leading-7.5">
            Download the Woofs Welcome mobile app for free
          </p>
        </div>

        <!-- Feature Block 1 -->
        <div class="mb-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <!-- iPhone mockup -->
          <div class="order-2 flex justify-center lg:order-1">
            <div class="relative">
              <!-- iPhone frame -->
              <div
                class="relative rounded-[55px] bg-[#1a1a1a] p-3.5 shadow-2xl"
              >
                <!-- Side buttons -->
                <div
                  class="absolute -left-0.75 top-28 h-8 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -left-0.75 top-44 h-12 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -left-0.75 top-60 h-12 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -right-0.75 top-36 h-16 w-0.75 rounded-r-sm bg-[#2a2a2a]"
                ></div>

                <!-- Screen bezel -->
                <div
                  class="relative h-150 w-70 overflow-hidden rounded-[41px] bg-black"
                >
                  <!-- Screen content -->
                  <div class="relative h-full w-full overflow-hidden bg-white">
                    <!-- Dynamic Island -->
                    <div
                      class="absolute left-1/2 top-3 z-20 h-8.5 w-30 -translate-x-1/2 rounded-full bg-black"
                    ></div>

                    <!-- Status bar -->
                    <div
                      class="relative z-10 flex h-12 items-end justify-between bg-white px-6 pb-1"
                    >
                      <div class="text-sm font-semibold">9:41</div>
                      <div class="flex items-center space-x-1">
                        <svg
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
                          />
                        </svg>
                        <div
                          class="flex h-4 w-7 items-center rounded-sm border border-black/40 px-0.5"
                        >
                          <div class="h-2.5 w-4 rounded-sm bg-black"></div>
                        </div>
                      </div>
                    </div>

                    <!-- App screenshot placeholder -->
                    <div
                      class="flex h-[calc(100%-48px)] flex-col bg-linear-to-b from-[#fbecd9] to-[#f5e6d3]"
                    >
                      <!-- App header -->
                      <div class="bg-white p-4 shadow-sm">
                        <div class="flex items-center justify-between">
                          <div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
                          <div class="text-lg font-semibold text-[#2a2a2a]">
                            Explore
                          </div>
                          <div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
                        </div>
                      </div>
                      <!-- Map placeholder -->
                      <div class="relative flex-1 bg-[#e8f4e8]">
                        <div
                          class="absolute inset-3 rounded-lg bg-[#d4e8d4]"
                        ></div>
                        <!-- Location pins -->
                        <div
                          class="absolute left-8 top-8 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 shadow-md"
                        >
                          <div class="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div
                          class="absolute right-10 top-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-md"
                        >
                          <div class="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div
                          class="absolute bottom-32 left-12 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-md"
                        >
                          <div class="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <!-- Bottom card -->
                      <div
                        class="rounded-t-3xl bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                      >
                        <div
                          class="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300"
                        ></div>
                        <div
                          class="mb-2 h-4 w-3/4 rounded-full bg-gray-200"
                        ></div>
                        <div
                          class="mb-2 h-3 w-1/2 rounded-full bg-gray-100"
                        ></div>
                        <div class="h-3 w-2/3 rounded-full bg-gray-100"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Home indicator -->
                <div
                  class="absolute bottom-5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-black/20"
                ></div>
              </div>
            </div>
          </div>

          <!-- Features list -->
          <div class="order-1 lg:order-2">
            <h3 class="mb-8 text-2xl md:text-[36px] md:leading-15">
              Find dog-friendly places anywhere
            </h3>
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <MapPin class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Discover Nearby Places
                  </h4>
                  <p class="text-gray-600">
                    Use GPS to find dog-friendly spots within walking distance
                    or plan your next road trip adventure.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <SlidersHorizontal class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Smart Filters
                  </h4>
                  <p class="text-gray-600">
                    Filter by location, place type, indoor/outdoor access, and
                    more to find exactly what you need.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <Share class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Share
                  </h4>
                  <p class="text-gray-600">
                    Share your favorite spots with friends and family.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Block 2 -->
        <div class="mb-24 grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <!-- Features list -->
          <div class="order-1">
            <h3 class="mb-8 text-2xl font-bold text-[#2a2a2a] md:text-4xl">
              Save and review your experiences
            </h3>
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <Heart class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Save Favorites
                  </h4>
                  <p class="text-gray-600">
                    Create your personal list of must-visit places and access
                    them offline when you need them most.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <Star class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Rate & Review
                  </h4>
                  <p class="text-gray-600">
                    Help other dog owners by sharing your experiences and
                    reading authentic reviews from the community.
                  </p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f9e2f5]"
                >
                  <Camera class="size-6" />
                </div>
                <div>
                  <h4 class="mb-2 text-lg font-semibold text-[#2a2a2a]">
                    Add Photos
                  </h4>
                  <p class="text-gray-600">
                    Capture and share moments with your furry friend to help
                    others visualize their next adventure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- iPhone mockup -->
          <div class="order-2 flex justify-center">
            <div class="relative">
              <!-- iPhone frame -->
              <div
                class="relative rounded-[55px] bg-[#1a1a1a] p-3.5 shadow-2xl"
              >
                <!-- Side buttons -->
                <div
                  class="absolute -left-0.75 top-28 h-8 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -left-0.75 top-44 h-12 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -left-0.75 top-60 h-12 w-0.75 rounded-l-sm bg-[#2a2a2a]"
                ></div>
                <div
                  class="absolute -right-0.75 top-36 h-16 w-0.75 rounded-r-sm bg-[#2a2a2a]"
                ></div>

                <!-- Screen bezel -->
                <div
                  class="relative h-150 w-70 overflow-hidden rounded-[41px] bg-black"
                >
                  <!-- Screen content -->
                  <div class="relative h-full w-full overflow-hidden bg-white">
                    <!-- Dynamic Island -->
                    <div
                      class="absolute left-1/2 top-3 z-20 h-8.5 w-30 -translate-x-1/2 rounded-full bg-black"
                    ></div>

                    <!-- Status bar -->
                    <div
                      class="relative z-10 flex h-12 items-end justify-between bg-white px-6 pb-1"
                    >
                      <div class="text-sm font-semibold">9:41</div>
                      <div class="flex items-center space-x-1">
                        <svg
                          class="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
                          />
                        </svg>
                        <div
                          class="flex h-4 w-7 items-center rounded-sm border border-black/40 px-0.5"
                        >
                          <div class="h-2.5 w-4 rounded-sm bg-black"></div>
                        </div>
                      </div>
                    </div>

                    <!-- App screenshot placeholder -->
                    <div
                      class="flex h-[calc(100%-48px)] flex-col bg-linear-to-b from-[#fbecd9] to-[#f5e6d3]"
                    >
                      <!-- App header -->
                      <div class="bg-white p-4 shadow-sm">
                        <div class="flex items-center justify-between">
                          <div class="h-8 w-8 rounded-full bg-[#fbecd9]"></div>
                          <div class="text-lg font-semibold text-[#2a2a2a]">
                            Favorites
                          </div>
                          <div
                            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#fbecd9]"
                          >
                            <svg
                              class="h-4 w-4 text-[#2a2a2a]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <!-- Favorites list -->
                      <div class="flex-1 space-y-3 overflow-hidden p-4">
                        <!-- Favorite item 1 -->
                        <div class="rounded-xl bg-white p-3 shadow-sm">
                          <div class="flex items-center space-x-3">
                            <div
                              class="h-12 w-12 rounded-lg bg-green-200"
                            ></div>
                            <div class="flex-1">
                              <div
                                class="mb-1 h-3 w-3/4 rounded-full bg-gray-200"
                              ></div>
                              <div
                                class="h-2 w-1/2 rounded-full bg-gray-100"
                              ></div>
                            </div>
                            <svg
                              class="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <!-- Favorite item 2 -->
                        <div class="rounded-xl bg-white p-3 shadow-sm">
                          <div class="flex items-center space-x-3">
                            <div class="h-12 w-12 rounded-lg bg-blue-200"></div>
                            <div class="flex-1">
                              <div
                                class="mb-1 h-3 w-2/3 rounded-full bg-gray-200"
                              ></div>
                              <div
                                class="h-2 w-3/4 rounded-full bg-gray-100"
                              ></div>
                            </div>
                            <svg
                              class="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <!-- Favorite item 3 -->
                        <div class="rounded-xl bg-white p-3 shadow-sm">
                          <div class="flex items-center space-x-3">
                            <div
                              class="h-12 w-12 rounded-lg bg-amber-200"
                            ></div>
                            <div class="flex-1">
                              <div
                                class="mb-1 h-3 w-4/5 rounded-full bg-gray-200"
                              ></div>
                              <div
                                class="h-2 w-1/3 rounded-full bg-gray-100"
                              ></div>
                            </div>
                            <svg
                              class="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <!-- Favorite item 4 -->
                        <div class="rounded-xl bg-white p-3 shadow-sm">
                          <div class="flex items-center space-x-3">
                            <div
                              class="h-12 w-12 rounded-lg bg-purple-200"
                            ></div>
                            <div class="flex-1">
                              <div
                                class="mb-1 h-3 w-1/2 rounded-full bg-gray-200"
                              ></div>
                              <div
                                class="h-2 w-2/3 rounded-full bg-gray-100"
                              ></div>
                            </div>
                            <svg
                              class="h-5 w-5 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Home indicator -->
                <div
                  class="absolute bottom-5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-black/20"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Download CTA -->
        <div class="text-center">
          <h3 class="mb-6 text-2xl font-bold text-[#2a2a2a] md:text-3xl">
            Ready to start exploring?
          </h3>
          <p class="mx-auto mb-8 max-w-xl text-lg text-gray-600">
            Join thousands of dog owners who trust our app to find the perfect
            spots for their furry friends.
          </p>
          <div
            class="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <!-- App Store Button -->
            <a
              href="/"
              class="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              <svg class="mr-3 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              <div class="text-left">
                <div class="text-xs">Download on the</div>
                <div class="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <!-- Google Play Button -->
            <a
              href="/"
              class="inline-flex items-center rounded-xl bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              <svg class="mr-3 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                />
              </svg>
              <div class="text-left">
                <div class="text-xs">Get it on</div>
                <div class="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
