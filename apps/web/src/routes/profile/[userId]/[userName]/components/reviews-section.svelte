<script lang="ts">
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Star } from "@lucide/svelte";
  import type { ProfileReview } from "@woofs/types";

  interface Props {
    reviews: ProfileReview[];
  }

  const { reviews }: Props = $props();

  const revs = [
    {
      id: 1,
      author: "Joe's Garage Ashburton",
      location: "Ashburton, Canterbury NZ",
      date: "January 2026",
      rating: 5,
      text: "Sarah's place was absolutely incredible. The attention to detail is remarkable — from the locally sourced coffee to the curated art on the walls. She was responsive and gave us the best restaurant recommendations. Would stay again in a heartbeat!",
      avatar: "J",
    },
    {
      id: 2,
      author: "Maria",
      location: "Mexico City, Mexico",
      date: "December 2025",
      rating: 5,
      text: "One of the best Airbnb experiences we've ever had. The space was spotless, beautifully decorated, and had everything we needed. Sarah checked in on us without being intrusive. The neighborhood guide she provided was a lifesaver.",
      avatar: "M",
    },
    {
      id: 3,
      author: "Alex",
      location: "London, UK",
      date: "November 2025",
      rating: 5,
      text: "Stunning apartment in a perfect location. Sarah thought of everything — even left a welcome basket with local treats. Communication was seamless and check-in was a breeze. Can't recommend enough!",
      avatar: "A",
    },
    {
      id: 4,
      author: "Yuki",
      location: "Tokyo, Japan",
      date: "October 2025",
      rating: 5,
      text: "Sarah is the definition of a Superhost. Her place exceeded our expectations. The bed was incredibly comfortable, the kitchen was well-stocked, and the views were breathtaking. We felt right at home from the moment we walked in.",
      avatar: "Y",
    },
    {
      id: 5,
      author: "Emma",
      location: "Sydney, Australia",
      date: "September 2025",
      rating: 4,
      text: "Lovely stay overall. The apartment was clean and well-maintained. Sarah was helpful with directions and tips. The only minor thing was street noise at night, but she had provided earplugs which was thoughtful.",
      avatar: "E",
    },
    {
      id: 6,
      author: "David",
      location: "Berlin, Germany",
      date: "August 2025",
      rating: 5,
      text: "Perfect in every way. Sarah clearly puts a lot of love into her hosting. The design of the space is magazine-worthy. I've traveled extensively and this ranks among my top stays globally.",
      avatar: "D",
    },
  ];

  let showAll = $state<boolean>(false);
  const displayed = $derived(showAll ? revs : revs.slice(0, 4));
</script>

<section>
  <div class="flex items-center gap-3">
    <h2 class="text-2xl font-bold text-foreground">Recent reviews</h2>
  </div>

  <div class="mt-6 grid gap-6 md:grid-cols-2">
    {#each displayed as review}
      <div
        class="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
      >
        <div class="flex items-center gap-3">
          <OptimizedImage
            imageId="812ee3d9-064e-4395-fe07-fe1751192600"
            alt="review image"
            variant="avatar"
            class="w-10 h-10 rounded-full object-cover object-center"
            width="40"
            height="40"
          />
          <div>
            <p class="text-sm font-semibold text-foreground">
              {review.author}
            </p>
            <p class="text-xs text-muted-foreground">{review.location}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          {#each Array.from({ length: 5 }) as _, i}
            <Star
              class={`h-4 w-4 ${
                i < review.rating
                  ? "fill-yellow-500 text-yellow-500"
                  : "fill-muted text-muted"
              }`}
            />
          {/each}
        </div>
        <span class="text-sm font-semibold">{review.author}</span>
        <p class="text-sm leading-relaxed text-foreground">
          {review.text}
        </p>
        <span class="text-xs text-muted-foreground">{review.date}</span>
      </div>
    {/each}
  </div>
  {#if revs.length > 4}
    <Button variant="outline" class="mt-6" onclick={() => (showAll = !showAll)}>
      {showAll ? "Show less" : "Show more"}
    </Button>
  {/if}
</section>
