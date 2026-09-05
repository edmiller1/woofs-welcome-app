<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { MapPin, Search, Star, TrendingUp, Users, Zap } from "@lucide/svelte";
  import type { AppStats } from "../../../../../packages/api/src/api/app/getAppStats.js";
  import { formatStatCount } from "$lib/helpers/index.js";

  const { data } = $props();
  const { user } = $derived(data);

  const appStats = $derived(data.appStats) as AppStats;

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
      badgeClass: "bg-secondary text-secondary-foreground",
    },
    {
      name: "Explore Map",
      description:
        "Appear as a featured listing in the explore map view. Shown to users actively searching for dog-friendly places across New Zealand.",
      icon: Search,
      examples: ["Explore map results", "Filter results", "Nearby places"],
      badge: "High reach",
      badgeClass: "bg-accent text-accent-foreground",
    },
    {
      name: "Place Pages",
      description:
        "Your business appears in the Similar Places section on individual place pages — reaching dog owners who are already in discovery mode and ready to explore more.",
      icon: TrendingUp,
      examples: ["Similar Places", "Place detail pages", "Search results"],
      badge: "Wide exposure",
      badgeClass: "bg-primary text-primary-foreground",
    },
  ];

  const stats = [
    { value: "100%", label: "Dog owners" },
    { value: "NZ", label: "Focused audience" },
    { value: "Growing", label: "Community" },
  ];

  const platformStats = [
    {
      value: formatStatCount(appStats.monthlyActiveUsers),
      label: "Monthly active users",
    },
    { value: formatStatCount(appStats.totalPlaces), label: "Places listed" },
    { value: formatStatCount(appStats.totalReviews), label: "Reviews" },
    {
      value: formatStatCount(appStats.totalLocations),
      label: "Locations covered",
    },
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
    <Breadcrumb.Root class="mt-16 sm:mt-10 mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href="/"
            class="text-muted-foreground no-underline hover:text-primary"
            >Home</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page class="font-bold text-primary"
            >Advertise</Breadcrumb.Page
          >
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <!-- Hero -->
    <section class="mb-14 pt-4">
      <div class="max-w-3xl">
        <h1
          class="m-0 max-w-190 text-[52px] leading-[1.06] tracking-[-0.035em]"
        >
          Reach dog owners where they're searching
        </h1>
        <p class="mt-5 max-w-150 text-base leading-[1.6] text-pretty">
          Woofs Welcome is New Zealand's dog-friendly places directory. Every
          visitor is a dog owner actively looking for places to take their dog —
          making it one of the most targeted audiences you can reach.
        </p>
        <a
          href="/contact?subject=partnership"
          class="mt-6 inline-block rounded-lg bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground no-underline hover:brightness-95"
          >Get in touch</a
        >
        <dl class="m-0 mt-11 flex flex-wrap gap-14">
          {#each stats as stat}
            <div>
              <dd
                class="m-0 text-[26px] font-extrabold tracking-[-0.02em] text-primary"
              >
                {stat.value}
              </dd>
              <dt class="mt-1 text-[13px] text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          {/each}
        </dl>
      </div>
    </section>

    <!-- Platform stats -->
    <section class="py-14">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">Our audience</h2>
      <p class="mt-2.5 text-[14.5px] text-muted-foreground">
        Woofs Welcome is growing fast. Here's a snapshot of the platform today.
      </p>
      <div class="m-0 mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each platformStats as stat}
          <div
            class="rounded-xl border border-border p-6 text-center px-5 py-6 bg-card"
          >
            <p class="text-3xl font-bold text-primary mb-1">{stat.value}</p>
            <p class="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Placement options -->
    <section class="py-14">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">Placement options</h2>
      <p class="mt-2.5 max-w-140 text-[14.5px] text-muted-foreground">
        Choose where your business appears, or run across all placements for
        maximum visibility.
      </p>
      <div class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each placements as placement}
          <div class="rounded-xl bg-card border border-border p-6 space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div class="rounded-xl bg-muted p-3">
                <placement.icon class="size-5 text-foreground" />
              </div>
              <span
                class="rounded-full px-2.5 py-1.5 text-[11px] font-bold {placement.badgeClass}"
              >
                {placement.badge}
              </span>
            </div>
            <div>
              <h3
                class="m-0 mt-4 text-[17px] font-extrabold tracking-[-0.02em]"
              >
                {placement.name}
              </h3>
              <p class="mt-2.5 text-[13.5px] leading-[1.6] text-pretty">
                {placement.description}
              </p>
            </div>
            <div class="pt-2">
              <p
                class="mt-4 text-[10.5px] font-extrabold uppercase tracking-widest text-muted-foreground"
              >
                Examples
              </p>
              <div class="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
                {#each placement.examples as example}
                  <span
                    class="rounded-md bg-secondary px-2.5 py-1.5 text-[11.5px] font-semibold text-secondary-foreground"
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
    <section class="py-14">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">Available placements</h2>
      <p class="mt-2.5 text-[14.5px] text-muted-foreground">
        Each location page has a single featured spot — first in, first served.
      </p>
      <div class="mt-5 rounded-xl border border-border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-[13.5px]">
            <thead
              class="bg-secondary text-[12px] font-extrabold text-secondary-foreground"
            >
              <tr
                ><th class="px-5 py-3.5 font-extrabold">Location</th><th
                  class="px-5 py-3.5 font-extrabold">Type</th
                ><th class="px-5 py-3.5 font-extrabold">Places listed</th><th
                  class="px-5 py-3.5 font-extrabold">Monthly views</th
                ><th class="px-5 py-3.5 font-extrabold">Status</th></tr
              >
            </thead>
            <tbody class="bg-card">
              {#each adInventory as row, i}
                <tr class="border-t border-border">
                  <td class="px-5 py-3.5 font-bold">{row.location}</td>
                  <td class="px-5 py-3.5">{row.type}</td>
                  <td class="px-5 py-3.5">{row.places}</td>
                  <td class="px-5 py-3.5 text-muted-foreground"
                    >{row.monthlyViews}</td
                  >
                  <td class="px-5 py-3.5">
                    {#if row.spotsAvailable > 0}
                      <span
                        class="flex items-center gap-2 font-bold text-[#4b7c5c]"
                      >
                        <span class="size-1.5 rounded-full bg-[#4b7c5c]"></span>
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
          <p
            class="m-0 border-t border-border bg-muted px-5 py-3.5 text-[12.5px] text-muted-foreground"
          >
            Don't see your location? <a
              href="/contact?subject=partnership"
              class="font-bold text-foreground hover:underline">Get in touch</a
            > — we're adding new locations regularly.
          </p>
        </div>
      </div>
    </section>

    <!-- Mockups -->
    <section class="py-14">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">What it looks like</h2>
      <p class="mt-2.5 max-w-145 text-[14.5px] text-muted-foreground">
        Ads appear as featured listings — native to the design, clearly
        labelled, and positioned where users are already looking.
      </p>

      <figure
        class="m-0 mt-5 overflow-hidden rounded-xl border border-border bg-card"
      >
        <div
          class="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5"
        >
          <span class="flex gap-1.5">
            <span class="size-2.5 rounded-full bg-[#d98a72]"></span>
            <span class="size-2.5 rounded-full bg-[#d9b872]"></span>
            <span class="size-2.5 rounded-full bg-[#8fb894]"></span>
          </span>
          <span class="font-mono text-[11.5px] text-muted-foreground"
            >woofswelcome.app/explore</span
          >
        </div>
        <div class="flex h-70">
          <div class="w-[34%] border-r border-border p-3">
            <div class="flex flex-wrap gap-1.5">
              <span
                class="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold"
                >Distance away ⌄</span
              >
              <span
                class="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold"
                >Rating ⌄</span
              >
              <span
                class="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-semibold"
                >Type ⌄</span
              >
            </div>
            <div class="mt-3 text-[11.5px] font-bold text-muted-foreground">
              Explore places · 8 places
            </div>
            <div
              class="mt-2.5 rounded-[10px] border border-primary/45 bg-muted p-2.5"
            >
              <div
                class="text-right text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary"
              >
                Featured
              </div>
              <div
                class="photo mt-1 h-20.5 overflow-hidden rounded-lg"
                data-photo="Your photo"
              ></div>
              <div class="mt-2.5 text-[12.5px] font-extrabold">
                Your Business Name
              </div>
              <div class="mt-0.5 text-[11px] text-muted-foreground">
                Christchurch · Café · $$
              </div>
            </div>
          </div>
          <div class="relative flex-1 bg-muted">
            <div
              class="absolute inset-0"
              style="background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:52px 52px"
            ></div>
            <span
              class="absolute -translate-x-1/2 -translate-y-full rounded-full bg-primary px-2.5 py-1.5 text-[10.5px] font-extrabold text-primary-foreground"
              style="left:46%;top:34%">★ 4.8</span
            >
            <span
              class="absolute -translate-x-1/2 -translate-y-full rounded-full bg-primary px-2.5 py-1.5 text-[10.5px] font-extrabold text-primary-foreground"
              style="left:34%;top:58%">★ 4.0</span
            >
            <span
              class="absolute -translate-x-1/2 -translate-y-full rounded-full bg-primary px-2.5 py-1.5 text-[10.5px] font-extrabold text-primary-foreground"
              style="left:40%;top:72%">★ 3.7</span
            >
            <span
              class="absolute -translate-x-1/2 -translate-y-full rounded-full bg-primary px-2.5 py-1.5 text-[10.5px] font-extrabold text-primary-foreground"
              style="left:52%;top:26%">★ 4.6</span
            >
          </div>
        </div>
      </figure>

      <div class="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <figure
          class="m-0 overflow-hidden rounded-xl border border-border bg-card"
        >
          <div
            class="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5"
          >
            <span class="flex gap-1.5"
              ><span class="size-2.5 rounded-full bg-[#d98a72]"></span><span
                class="size-2.5 rounded-full bg-[#d9b872]"
              ></span><span class="size-2.5 rounded-full bg-[#8fb894]"
              ></span></span
            >
            <span class="font-mono text-[11.5px] text-muted-foreground"
              >woofswelcome.app/christchurch</span
            >
          </div>
          <div class="flex flex-col gap-3 p-3.5">
            <div
              class="flex items-end justify-between gap-3 rounded-[10px] bg-[oklch(31.37%_0.0374_62.43)] px-4 py-4"
            >
              <div>
                <div
                  class="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-accent"
                >
                  Dog-friendly places in
                </div>
                <div
                  class="mt-1 text-[22px] font-extrabold tracking-[-0.025em] text-[#faf4ec]"
                >
                  Christchurch
                </div>
              </div>
              <div
                class="rounded-md bg-white/12 px-2.5 py-1.5 text-right text-[10.5px] font-bold text-[#f3e8da]"
              >
                18 places<br />★ 4.1 avg
              </div>
            </div>
            <div
              class="flex items-center gap-3 rounded-[10px] border border-primary/45 bg-muted p-3"
            >
              <div
                class="flex size-7.5 flex-none items-center justify-center rounded-lg border border-border bg-card"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="var(--accent)"
                  ><path
                    d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z"
                  /></svg
                >
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[12.5px] font-extrabold">
                  Your Business Name
                </div>
                <div class="mt-0.5 text-[11px] text-muted-foreground">
                  Christchurch · $$
                </div>
                <div class="mt-0.5 text-[11px]">
                  Your dog-friendly tagline here
                </div>
              </div>
              <div
                class="self-start text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary"
              >
                Featured
              </div>
            </div>
            <div
              class="flex items-center gap-3 rounded-[10px] border border-border p-3"
            >
              <div class="size-7.5 flex-none rounded-lg bg-muted"></div>
              <div class="flex flex-1 flex-col gap-1.5">
                <div class="h-2 rounded bg-muted" style="width:62%"></div>
                <div class="h-2 rounded bg-secondary" style="width:42%"></div>
              </div>
            </div>
            <div
              class="flex items-center gap-3 rounded-[10px] border border-border p-3"
            >
              <div class="size-7.5 flex-none rounded-lg bg-muted"></div>
              <div class="flex flex-1 flex-col gap-1.5">
                <div class="h-2 rounded bg-muted" style="width:54%"></div>
                <div class="h-2 rounded bg-secondary" style="width:34%"></div>
              </div>
            </div>
          </div>
        </figure>

        <figure
          class="m-0 overflow-hidden rounded-xl border border-border bg-card"
        >
          <div
            class="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5"
          >
            <span class="flex gap-1.5"
              ><span class="size-2.5 rounded-full bg-[#d98a72]"></span><span
                class="size-2.5 rounded-full bg-[#d9b872]"
              ></span><span class="size-2.5 rounded-full bg-[#8fb894]"
              ></span></span
            >
            <span class="font-mono text-[11.5px] text-muted-foreground"
              >woofswelcome.app/…/places/dog-friendly-place</span
            >
          </div>
          <div class="flex flex-col gap-3 p-3.5">
            <div
              class="photo h-18.5 overflow-hidden rounded-[10px]"
              data-photo="Place photos"
            ></div>
            <div class="flex flex-col gap-1.5">
              <div class="h-2.5 w-[46%] rounded bg-muted"></div>
              <div class="h-2 w-[72%] rounded bg-secondary"></div>
              <div class="h-2 w-[58%] rounded bg-secondary"></div>
            </div>
            <div class="text-[12px] font-extrabold">Similar Places</div>
            <div class="grid grid-cols-3 gap-2.5">
              <div
                class="rounded-[9px] border border-primary/45 bg-muted p-2.5"
              >
                <div
                  class="text-right text-[8.5px] font-extrabold uppercase tracking-[0.12em] text-primary"
                >
                  Featured
                </div>
                <div class="mt-1 flex justify-center">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="var(--accent)"
                    ><path
                      d="M12 2l3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8z"
                    /></svg
                  >
                </div>
                <div class="mt-2 text-[10.5px] font-extrabold">
                  Your Business
                </div>
                <div class="mt-0.5 text-[9.5px] text-muted-foreground">
                  Ashburton
                </div>
              </div>
              <div
                class="flex flex-col gap-1.5 rounded-[9px] border border-border p-2.5"
              >
                <div class="h-8.5 rounded-md bg-muted"></div>
                <div class="h-1.5 rounded bg-secondary" style="width:80%"></div>
                <div class="h-1.5 rounded bg-secondary" style="width:55%"></div>
              </div>
              <div
                class="flex flex-col gap-1.5 rounded-[9px] border border-border p-2.5"
              >
                <div class="h-8.5 rounded-md bg-muted"></div>
                <div class="h-1.5 rounded bg-secondary" style="width:70%"></div>
                <div class="h-1.5 rounded bg-secondary" style="width:45%"></div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>

    <!-- Why advertise -->
    <section class="py-14">
      <h2 class="m-0 text-[28px] tracking-[-0.025em]">Why advertise with us</h2>
      <div class="mt-6 grid gap-9 lg:grid-cols-3">
        <div>
          <div class="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
                cx="9"
                cy="7"
                r="4"
              /><path d="M22 20v-2a4 4 0 0 0-3-3.9" /></svg
            >
            <h3 class="m-0 text-[15px] font-extrabold">
              100% dog owner audience
            </h3>
          </div>
          <p class="mt-2 text-[13.5px] leading-[1.6] text-pretty">
            Every person on Woofs Welcome is a dog owner. No wasted impressions
            on people who'll never visit a dog-friendly business.
          </p>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M13 2L4.5 13H11l-1 9 8.5-11H12z" /></svg
            >
            <h3 class="m-0 text-[15px] font-extrabold">High purchase intent</h3>
          </div>
          <p class="mt-2 text-[13.5px] leading-[1.6] text-pretty">
            Users on Woofs Welcome are actively looking for somewhere to go.
            They're ready to visit — your ad meets them at the right moment.
          </p>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--primary)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path
                d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"
              /><circle cx="12" cy="10" r="2.4" /></svg
            >
            <h3 class="m-0 text-[15px] font-extrabold">Location-targeted</h3>
          </div>
          <p class="mt-2 text-[13.5px] leading-[1.6] text-pretty">
            Pin your ad to specific regions or cities so you only reach dog
            owners who are local or planning to visit your area.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-14">
      <div class="rounded-2xl border border-border bg-card px-10 py-9">
        <h2 class="m-0 text-[30px] tracking-[-0.03em]">
          See what your ad looks like
        </h2>
        <p class="mt-3 max-w-130 text-[14.5px] leading-[1.6] text-pretty">
          Upload your image, add your details, and get an instant live preview
          of your ad across every placement — free, no payment required.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a
            href="/advertise/preview"
            class="rounded-lg bg-primary px-6 py-3.5 text-sm font-extrabold text-primary-foreground no-underline hover:brightness-95"
            >Create a free preview</a
          >
          <a
            href="/contact?subject=partnership"
            class="rounded-lg border border-border px-6 py-3.5 text-sm font-extrabold text-foreground no-underline hover:bg-muted"
            >Get in touch</a
          >
        </div>
      </div>
    </section>
  </div>
  <Footer />
</main>
