<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { MapPin, Search, Star, TrendingUp, Users, Zap } from "@lucide/svelte";

  const { data } = $props();
  const { user } = $derived(data);

  const placements = [
    {
      name: "Location Pages",
      description:
        "Your business appears at the top of high-intent location pages like Christchurch, Auckland, Queenstown, and more. Dog owners browsing a specific area see your ad first.",
      icon: MapPin,
      examples: [
        "Christchurch",
        "Auckland",
        "Queenstown",
        "Wellington",
        "West Coast",
        "Northland",
      ],
      badge: "High intent",
      badgeClass: "bg-primary/10 text-primary",
    },
    {
      name: "Explore Map",
      description:
        "Appear as a featured listing in the explore map view. Shown to users actively searching for dog-friendly places across New Zealand.",
      icon: Search,
      examples: ["Explore map results", "Filter results", "Nearby places"],
      badge: "High reach",
      badgeClass: "bg-blue-500/10 text-blue-600",
    },
    {
      name: "Place Pages",
      description:
        "Your business appears in the Similar Places section on individual place pages — reaching dog owners who are already in discovery mode and ready to explore more.",
      icon: TrendingUp,
      examples: ["Similar Places", "Place detail pages", "Search results"],
      badge: "Wide exposure",
      badgeClass: "bg-orange-500/10 text-orange-600",
    },
  ];

  const stats = [
    { value: "100%", label: "Dog owners" },
    { value: "NZ", label: "Focused audience" },
    { value: "Growing", label: "Community" },
  ];

  const platformStats = [
    { value: "500+", label: "Monthly active users" },
    { value: "200+", label: "Places listed" },
    { value: "50+", label: "Reviews" },
    { value: "10+", label: "Regions covered" },
  ];

  const adInventory = [
    {
      location: "Christchurch",
      type: "City",
      monthlyViews: "Coming soon",
      places: 18,
      spotsAvailable: 1,
    },
    {
      location: "Auckland",
      type: "City",
      monthlyViews: "Coming soon",
      places: 24,
      spotsAvailable: 1,
    },
    {
      location: "Queenstown",
      type: "City",
      monthlyViews: "Coming soon",
      places: 12,
      spotsAvailable: 1,
    },
    {
      location: "Wellington",
      type: "City",
      monthlyViews: "Coming soon",
      places: 15,
      spotsAvailable: 1,
    },
    {
      location: "Canterbury",
      type: "Region",
      monthlyViews: "Coming soon",
      places: 30,
      spotsAvailable: 1,
    },
    {
      location: "Northland",
      type: "Region",
      monthlyViews: "Coming soon",
      places: 8,
      spotsAvailable: 1,
    },
  ];
</script>

<svelte:head>
  <title>Advertise on Woofs Welcome | Reach Dog Owners in New Zealand</title>
  <meta
    name="description"
    content="Reach thousands of dog owners across New Zealand. Feature your business on location pages, the explore map, and place lists on Woofs Welcome."
  />
  <meta property="og:title" content="Advertise on Woofs Welcome" />
  <meta
    property="og:description"
    content="Reach thousands of dog owners across New Zealand."
  />
  <meta property="og:url" content="https://woofswelcome.app/advertise" />
  <link rel="canonical" href="https://woofswelcome.app/advertise" />
</svelte:head>

<HomeNavbar {user} />
<main class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto px-4 py-6 sm:py-12">
    <Breadcrumb.Root class="mt-10 mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Advertise</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <!-- Hero -->
    <section class="mb-20 pt-4">
      <div class="max-w-3xl">
        <h1 class="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Reach dog owners<br />where they're searching
        </h1>
        <p class="text-lg sm:text-xl text-muted-foreground mb-8">
          Woofs Welcome is New Zealand's dog-friendly places directory. Every
          visitor is a dog owner actively looking for places to take their dog —
          making it one of the most targeted audiences you can reach.
        </p>
        <a
          href="/contact?subject=partnership"
          class={cn(
            buttonVariants({ variant: "default" }),
            "px-8 py-6 text-base font-bold",
          )}
        >
          Get in touch
        </a>
      </div>

      <div class="grid grid-cols-3 gap-6 mt-16 max-w-lg">
        {#each stats as stat}
          <div class="text-center">
            <p class="text-2xl sm:text-3xl font-bold text-primary">
              {stat.value}
            </p>
            <p class="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Platform stats -->
    <section class="mb-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">Our audience</h2>
      <p class="text-muted-foreground mb-10 max-w-2xl">
        Woofs Welcome is growing fast. Here's a snapshot of the platform today.
      </p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {#each platformStats as stat}
          <div class="rounded-2xl border border-border p-6 text-center">
            <p class="text-3xl font-bold text-primary mb-1">{stat.value}</p>
            <p class="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Placement options -->
    <section class="mb-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">Placement options</h2>
      <p class="text-muted-foreground mb-10 max-w-2xl">
        Choose where your business appears, or run across all placements for
        maximum visibility.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each placements as placement}
          <div class="rounded-2xl border border-border p-6 space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="rounded-xl bg-muted p-3">
                <placement.icon class="size-5 text-foreground" />
              </div>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full {placement.badgeClass}"
              >
                {placement.badge}
              </span>
            </div>
            <div>
              <h3 class="font-bold text-lg mb-2">{placement.name}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {placement.description}
              </p>
            </div>
            <div class="pt-2">
              <p
                class="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide"
              >
                Examples
              </p>
              <div class="flex flex-wrap gap-1.5">
                {#each placement.examples as example}
                  <span class="text-xs bg-muted px-2.5 py-1 rounded-full"
                    >{example}</span
                  >
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Ad inventory -->
    <section class="mb-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">Available placements</h2>
      <p class="text-muted-foreground mb-10 max-w-2xl">
        Each location page has a single featured spot — first in, first served.
      </p>
      <div class="rounded-2xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="text-left px-6 py-4 font-semibold">Location</th>
                <th class="text-left px-6 py-4 font-semibold">Type</th>
                <th class="text-left px-6 py-4 font-semibold">Places listed</th>
                <th class="text-left px-6 py-4 font-semibold">Monthly views</th>
                <th class="text-left px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {#each adInventory as row, i}
                <tr
                  class="border-b border-border last:border-0 {i % 2 === 1
                    ? 'bg-muted/20'
                    : ''}"
                >
                  <td class="px-6 py-4 font-medium">{row.location}</td>
                  <td class="px-6 py-4 text-muted-foreground">{row.type}</td>
                  <td class="px-6 py-4 text-muted-foreground">{row.places}</td>
                  <td class="px-6 py-4 text-muted-foreground"
                    >{row.monthlyViews}</td
                  >
                  <td class="px-6 py-4">
                    {#if row.spotsAvailable > 0}
                      <span
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400"
                      >
                        <span
                          class="size-1.5 rounded-full bg-green-500 inline-block"
                        ></span>
                        Available
                      </span>
                    {:else}
                      <span
                        class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                      >
                        Taken
                      </span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 bg-muted/30 border-t border-border">
          <p class="text-xs text-muted-foreground">
            Don't see your location? <a
              href="/contact?subject=partnership"
              class="underline text-foreground">Get in touch</a
            > — we're adding new locations regularly.
          </p>
        </div>
      </div>
    </section>

    <!-- Mockups -->
    <section class="mb-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-4">What it looks like</h2>
      <p class="text-muted-foreground mb-10 max-w-2xl">
        Ads appear as featured listings — native to the design, clearly
        labelled, and positioned where users are already looking.
      </p>
      <div class="space-y-8">

        <!-- Explore mockup -->
        <div class="rounded-2xl border border-border overflow-hidden">
          <div class="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
            <div class="size-2.5 rounded-full bg-red-400"></div>
            <div class="size-2.5 rounded-full bg-yellow-400"></div>
            <div class="size-2.5 rounded-full bg-green-400"></div>
            <span class="text-xs text-muted-foreground ml-2">woofswelcome.app/explore</span>
          </div>
          <div class="flex h-72 overflow-hidden">
            <!-- Left panel -->
            <div class="w-85 shrink-0 border-r border-border flex flex-col overflow-hidden">
              <!-- Filter bar -->
              <div class="px-3 py-2 border-b border-border flex gap-2 bg-background">
                {#each ["Distance away", "Rating", "Type"] as f}
                  <div class="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground flex items-center gap-1">
                    {f} <span class="opacity-50">▾</span>
                  </div>
                {/each}
              </div>
              <div class="p-3 space-y-2 overflow-hidden">
                <p class="text-[10px] font-semibold text-muted-foreground px-1">Explore places · 8 places</p>
                <!-- Featured ad card -->
                <div class="rounded-xl border-2 border-primary/30 bg-primary/5 p-3 relative">
                  <span class="absolute top-2 right-2 text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                  <div class="aspect-[2.2] rounded-lg bg-muted mb-2 flex items-center justify-center">
                    <span class="text-[10px] text-muted-foreground">Your photo</span>
                  </div>
                  <p class="font-semibold text-[11px]">Your Business Name</p>
                  <p class="text-[10px] text-muted-foreground">Christchurch · Café · $$</p>
                </div>
                <!-- Regular place cards -->
                {#each [1, 2] as _}
                  <div class="rounded-xl border border-border p-3 space-y-1.5">
                    <div class="aspect-[2.2] bg-muted rounded-lg"></div>
                    <div class="h-2 bg-muted rounded w-3/4"></div>
                    <div class="h-1.5 bg-muted rounded w-1/2"></div>
                  </div>
                {/each}
              </div>
            </div>
            <!-- Map panel -->
            <div class="flex-1 bg-[#e8e0d5] relative overflow-hidden">
              <!-- Fake map roads -->
              <svg class="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 300 288" preserveAspectRatio="xMidYMid slice">
                <line x1="0" y1="100" x2="300" y2="120" stroke="#b5a898" stroke-width="3"/>
                <line x1="80" y1="0" x2="100" y2="288" stroke="#b5a898" stroke-width="2"/>
                <line x1="150" y1="0" x2="160" y2="288" stroke="#b5a898" stroke-width="1.5"/>
                <line x1="0" y1="180" x2="300" y2="160" stroke="#b5a898" stroke-width="1.5"/>
                <line x1="0" y1="240" x2="300" y2="230" stroke="#c4bab0" stroke-width="1"/>
                <path d="M0,60 Q100,80 200,50 T300,70" stroke="#b5a898" stroke-width="1" fill="none"/>
              </svg>
              <!-- Map pins -->
              <div class="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2">
                <div class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">4.2</div>
              </div>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md ring-2 ring-white">Featured</div>
              </div>
              <div class="absolute top-2/3 left-2/3 -translate-x-1/2 -translate-y-1/2">
                <div class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">3.8</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Location page mockup -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div class="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
              <div class="size-2.5 rounded-full bg-red-400"></div>
              <div class="size-2.5 rounded-full bg-yellow-400"></div>
              <div class="size-2.5 rounded-full bg-green-400"></div>
              <span class="text-xs text-muted-foreground ml-2">woofswelcome.app/christchurch</span>
            </div>
            <div class="overflow-hidden">
              <!-- Hero image area -->
              <div class="bg-linear-to-br from-slate-700 to-slate-900 h-24 flex items-end p-4 relative">
                <div>
                  <p class="text-white/60 text-[10px] uppercase tracking-widest">Dog-friendly places in</p>
                  <p class="text-white font-bold text-lg">Christchurch</p>
                </div>
                <div class="absolute top-3 right-3 bg-white/10 backdrop-blur rounded-lg px-3 py-1.5 text-white text-[10px]">
                  <p class="font-semibold">18 places</p>
                  <p class="opacity-60">★ 4.1 avg</p>
                </div>
              </div>
              <!-- Featured ad below hero -->
              <div class="px-4 pt-4 pb-2">
                <div class="rounded-xl border-2 border-primary/30 bg-primary/5 p-3 relative">
                  <span class="absolute top-2.5 right-2.5 text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                  <div class="flex gap-3">
                    <div class="size-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                      <Star class="size-4 text-muted-foreground" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-[11px]">Your Business Name</p>
                      <p class="text-[10px] text-muted-foreground">Christchurch · $$</p>
                      <p class="text-[10px] text-muted-foreground mt-0.5">Your dog-friendly tagline here</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Regular cards -->
              <div class="px-4 pb-4 space-y-2 mt-2">
                {#each [1, 2] as _}
                  <div class="rounded-xl border border-border p-3">
                    <div class="flex gap-3">
                      <div class="size-12 rounded-lg bg-muted shrink-0"></div>
                      <div class="space-y-1.5 flex-1">
                        <div class="h-2.5 bg-muted rounded w-3/4"></div>
                        <div class="h-2 bg-muted rounded w-1/2"></div>
                        <div class="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Place detail / Similar Places mockup -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div class="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2">
              <div class="size-2.5 rounded-full bg-red-400"></div>
              <div class="size-2.5 rounded-full bg-yellow-400"></div>
              <div class="size-2.5 rounded-full bg-green-400"></div>
              <span class="text-xs text-muted-foreground ml-2">woofswelcome.app/.../places/robert-harris</span>
            </div>
            <div class="p-4 space-y-3">
              <!-- Place hero stub -->
              <div class="rounded-xl bg-muted h-20 flex items-center justify-center">
                <span class="text-xs text-muted-foreground">Place photos</span>
              </div>
              <div class="space-y-1">
                <div class="h-3 bg-muted rounded w-1/2"></div>
                <div class="h-2.5 bg-muted rounded w-1/3"></div>
              </div>
              <div class="border-t border-border pt-3">
                <p class="text-xs font-bold mb-2">Similar Places</p>
                <div class="flex gap-2 overflow-hidden">
                  <!-- Featured ad card -->
                  <div class="shrink-0 w-28 rounded-xl border-2 border-primary/30 bg-primary/5 p-2 relative">
                    <span class="absolute top-1.5 right-1.5 text-[8px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                    <div class="aspect-[1.2] bg-muted rounded-lg mb-1.5 flex items-center justify-center">
                      <Star class="size-3 text-muted-foreground" />
                    </div>
                    <p class="text-[10px] font-semibold leading-tight">Your Business</p>
                    <p class="text-[9px] text-muted-foreground">Ashburton</p>
                  </div>
                  <!-- Regular cards -->
                  {#each [1, 2] as _}
                    <div class="shrink-0 w-28 rounded-xl border border-border p-2 space-y-1.5">
                      <div class="aspect-[1.2] bg-muted rounded-lg"></div>
                      <div class="h-2 bg-muted rounded w-3/4"></div>
                      <div class="h-1.5 bg-muted rounded w-1/2"></div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why advertise -->
    <section class="mb-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-10">
        Why advertise with us
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div class="space-y-3">
          <div
            class="rounded-xl bg-muted w-10 h-10 flex items-center justify-center"
          >
            <Users class="size-5" />
          </div>
          <h3 class="font-bold">100% dog owner audience</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Every person on Woofs Welcome is a dog owner. No wasted impressions
            on people who'll never visit a dog-friendly business.
          </p>
        </div>
        <div class="space-y-3">
          <div
            class="rounded-xl bg-muted w-10 h-10 flex items-center justify-center"
          >
            <Zap class="size-5" />
          </div>
          <h3 class="font-bold">High purchase intent</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Users on Woofs Welcome are actively looking for somewhere to go.
            They're ready to visit — your ad meets them at the right moment.
          </p>
        </div>
        <div class="space-y-3">
          <div
            class="rounded-xl bg-muted w-10 h-10 flex items-center justify-center"
          >
            <MapPin class="size-5" />
          </div>
          <h3 class="font-bold">Location-targeted</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Pin your ad to specific regions or cities so you only reach dog
            owners who are local or planning to visit your area.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mb-20">
      <div class="rounded-2xl bg-primary/5 border border-primary/20 p-8 sm:p-12 max-w-2xl">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4">See what your ad looks like</h2>
        <p class="text-muted-foreground mb-8">
          Upload your image, add your details, and get an instant live preview of your ad across every placement — free, no payment required.
        </p>
        <div class="flex flex-wrap gap-4">
          <a
            href="/advertise/preview"
            class={cn(buttonVariants({ variant: "default" }), "px-8 py-6 text-base font-bold")}
          >
            Create a free preview
          </a>
          <a
            href="/contact?subject=partnership"
            class={cn(buttonVariants({ variant: "outline" }), "px-8 py-6 text-base")}
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  </div>
  <Footer />
</main>
