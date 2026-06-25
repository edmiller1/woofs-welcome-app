<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  const { data } = $props();
  const { user } = $derived(data);
</script>

<svelte:head>
  <title>About | Woofs Welcome</title>
  <meta name="description" content="Woofs Welcome is on a mission to make dog-friendly places easier to find. Learn why we built the app and how it works." />
  <meta property="og:title" content="About | Woofs Welcome" />
  <meta property="og:description" content="Woofs Welcome is on a mission to make dog-friendly places easier to find. Learn why we built the app and how it works." />
  <meta property="og:url" content="https://woofswelcome.app/about" />
  <link rel="canonical" href="https://woofswelcome.app/about" />
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
          <Breadcrumb.Page>About</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
    <div class="mb-8 sm:mb-12">
      <h1 class="text-4xl sm:text-5xl font-bold mb-6">About Woofs Welcome</h1>
      <p class="text-lg sm:text-xl text-muted-foreground">
        Making dog-friendly places more accessible and easier to find for
        everyone.
      </p>
    </div>

    <section class="mb-20 pt-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-6">
        Why Woofs Welcome Exists
      </h2>
      <div class="leading-relaxed space-y-6">
        <p>
          We have four dogs. Finding places we can actually take them has always
          been a hassle.
        </p>
        <p>
          Whether it's booking accommodation, planning a hike, or just finding
          somewhere to eat — the answer to "is this dog-friendly?" was never
          easy to find. You'd search, read through outdated reviews, call ahead,
          and still sometimes show up only to be turned away at the door.
        </p>
        <p>
          That frustration is why Woofs Welcome exists. We wanted a single place
          where dog owners could find verified, up-to-date information about
          dog-friendly places — without the guesswork. Open the website or
          mobile app, and if a place is dog-friendly, it's there. Simple as
          that.
        </p>
        <p>
          We're starting in New Zealand, but the goal is to build this for every
          dog owner, everywhere. Every park, trail, café, hotel, and beach that
          welcomes dogs — on one map, with real information from real dog
          owners.
        </p>
      </div>
    </section>
    <section class="mb-20 pt-20">
      <h2 class="text-2xl sm:text-3xl font-bold mb-6">Get in Touch</h2>
      <p class="mb-8">
        Questions, feedback, or partnership inquiries? Get in touch.
      </p>
      <a
        href="/contact"
        class={cn(
          buttonVariants({ variant: "default" }),
          "font-bold px-8 py-8 text-lg",
        )}>Contact Us</a
      >
    </section>
  </div>
  <Footer />
</main>
