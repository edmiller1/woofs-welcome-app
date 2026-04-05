<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import type { BAUser, Profile, Tab, UpdateReviewData } from "@woofs/types";
  import ProfileCard from "./components/profile-card.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import AboutSection from "./components/about-section.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import ReviewsSection from "./components/reviews-section.svelte";
  import CollectionsSection from "./components/collections-section.svelte";
  import CheckInCard from "./components/check-in-card.svelte";
  import EditProfileDialog from "./components/edit-profile-dialog.svelte";
  import { classNames } from "$lib/utils";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import {
    Bookmark,
    Dog,
    Facebook,
    Image,
    Instagram,
    MapPin,
    MessageCircle,
    Pencil,
    Star,
    ThumbsUp,
    Trash2,
    Twitter,
  } from "@lucide/svelte";
  import TiktokLogo from "$lib/components/tiktok-logo.svelte";
  import XLogo from "$lib/components/x-logo.svelte";
  import { format, formatDistanceToNow } from "date-fns";
  import { place } from "../../../../../../../packages/api/src/api/place";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import Footer from "$lib/components/footer.svelte";
  import DeleteReviewDialog from "$lib/components/delete-review-dialog.svelte";
  import EditReviewDialog from "$lib/components/edit-review-dialog.svelte";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfile: Profile;
    };
  }

  const { data }: Props = $props();
  const { user, userName, userId, initialProfile } = $derived(data);

  const profile = createQuery(() => ({
    queryKey: ["profile", userId],
    queryFn: () => api.profile.getProfile(userId),
    initialData: initialProfile,
  }));

  let deleteOpen = $state<boolean>(false);
  let deleteReviewId = $state<string>("");
  let editOpen = $state<boolean>(false);
  let editReviewData = $state<UpdateReviewData>({
    reviewId: "",
    title: "",
    content: "",
    rating: 0,
    dogBreeds: [],
    numDogs: 0,
    visitDate: new Date().toString(),
    images: [],
  });
  let editPlaceName = $state<string>("");

  const openDeleteDialog = (reviewId: string) => {
    deleteReviewId = reviewId;
    deleteOpen = true;
  };

  const openEditDialog = (reviewData: UpdateReviewData, placeName: string) => {
    editReviewData = reviewData;
    editPlaceName = placeName;
    editOpen = true;
  };
</script>

<ErrorBoundary error={profile.error}>
  {#if profile.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if profile.isSuccess}
    <main class="max-w-7xl mx-auto px-6 py-12 md:py-20 mb-10">
      <!-- Hero -->
      <section
        class="flex flex-col md:flex-row items-center md:items-end gap-8 mb-20 relative"
      >
        <div class="relative group">
          <div
            class="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-white shadow-2xl z-10 relative"
          >
            {#if profile.data.image}
              <img
                alt="Profile"
                class="w-full h-full object-cover object-center"
                src={profile.data.image.replace(/=s\d+-c$/, "=s256-c")}
              />
            {:else}
              <OptimizedImage
                imageId={profile.data.profileImageId!}
                alt="Profile"
                class="w-full h-full object-cover object-center"
                variant="avatar"
              />
            {/if}
          </div>
          <div
            class="absolute -top-4 -left-4 w-24 h-24 bg-secondary-container rounded-full z-0 opacity-40 blur-2xl"
          ></div>
        </div>
        <div class="flex-1 text-center md:text-left space-y-4">
          <div class="space-y-1">
            <h1
              class="serif-headline text-5xl md:text-6xl font-bold italic text-primary"
            >
              {profile.data.name}
            </h1>
            {#if profile.data.currentCity}
              <div
                class="flex items-center justify-center md:justify-start gap-2 text-secondary font-medium"
              >
                <MapPin />

                <span
                  >{profile.data.currentCity?.city}, {profile.data.currentCity
                    ?.locality}
                  {profile.data.currentCity?.country}</span
                >
              </div>
            {/if}
          </div>
          <!-- Stats Bento -->
          <div
            class="flex flex-wrap justify-center md:justify-start gap-6 pt-4"
          >
            <div class="text-center md:text-left">
              <p class="text-2xl font-bold text-primary">
                {profile.data.reviewCount}
              </p>
              <p
                class="text-xs uppercase tracking-widest font-bold text-secondary/60"
              >
                Reviews
              </p>
            </div>
            <div class="text-center md:text-left">
              <p class="text-2xl font-bold text-primary">
                {profile.data.averageRating}
              </p>
              <p
                class="text-xs uppercase tracking-widest font-bold text-secondary/60"
              >
                Avg Rating
              </p>
            </div>
            <div class="text-center md:text-left">
              <p class="text-2xl font-bold text-primary">
                {profile.data.collectionCount}
              </p>
              <p
                class="text-xs uppercase tracking-widest font-bold text-secondary/60"
              >
                Collections
              </p>
            </div>
          </div>

          <!-- Social -->
          <div
            class="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4"
          >
            <div class="flex gap-4 ml-2">
              {#if profile.data.instagram}
                <a
                  href={profile.data.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram class="size-5 text-secondary" />
                </a>
              {/if}
              {#if profile.data.facebook}
                <a
                  href={profile.data.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook class="size-5 text-secondary" />
                </a>
              {/if}
              {#if profile.data.x}
                <a
                  href={profile.data.x}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XLogo />
                </a>
              {/if}
              {#if profile.data.tiktok}
                <a
                  href={profile.data.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TiktokLogo />
                </a>
              {/if}
            </div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <!-- Left Column -->
        <div class="lg:col-span-7 space-y-16">
          <section>
            <h2
              class="serif-headline text-3xl font-bold italic text-primary mb-8"
            >
              The Pack
            </h2>
            <div class="grid grid-cols-2 gap-4">
              {#each profile.data.dogs as dog}
                <div
                  class="bg-surface-container-lowest rounded-4xl overflow-hidden p-6 flex items-center gap-6 shadow-sm"
                >
                  <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                    <OptimizedImage
                      imageId={dog.imageId}
                      alt={dog.name}
                      class="w-full h-full object-cover object-center"
                      variant="card"
                    />
                  </div>
                  <div>
                    <h3
                      class="serif-headline text-xl font-bold italic text-primary"
                    >
                      {dog.name}
                    </h3>
                    <p class="text-secondary font-medium text-sm">
                      {dog.breed}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </section>

          <!-- Recent Reviews -->
          <section>
            <div class="flex justify-between items-end mb-8">
              <h2 class="serif-headline text-3xl font-bold italic text-primary">
                Recent Reviews
              </h2>
              {#if profile.data.reviewCount > 12}
                <a
                  class="text-primary font-bold hover:underline decoration-2 underline-offset-4"
                  href={`/profile/${userId}/${userName}/reviews`}>View All</a
                >
              {/if}
            </div>
            <div class="space-y-6">
              {#each profile.data.reviews as review}
                <div class="bg-white p-8 rounded-3xl space-y-4">
                  <div class="flex gap-6 items-start mb-4">
                    <OptimizedImage
                      imageId={review.place.images[0].imageId}
                      alt={review.place.name}
                      class="size-24 object-cover object-center rounded-lg shrink-0 shadow-sm"
                      variant="thumbnail"
                      width="96"
                      height="96"
                    />
                    <div class="flex-1">
                      <div class="flex justify-between items-start">
                        <div>
                          <h4
                            class="font-bold text-primary text-lg leading-tight"
                          >
                            {review.place.name}
                          </h4>
                          <p class="text-sm text-secondary">
                            {review.place.location.name}, {review.place.location
                              .parent.name}
                            {review.place.countryCode} • {formatDistanceToNow(
                              review.visitDate,
                            )} ago
                          </p>
                        </div>
                        <div class="flex">
                          {#each Array(5) as _, i}
                            <Star
                              class={`size-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          {/each}
                        </div>
                      </div>
                    </div>
                  </div>
                  <h5
                    class="serif-headline text-base font-bold italic text-primary mb-2"
                  >
                    {review.title}
                  </h5>
                  <p class="text-on-surface/80 leading-relaxed text-sm">
                    {review.content}
                  </p>
                  <div
                    class="flex items-center gap-4 mt-3 text-xs text-muted-foreground"
                  >
                    {#if review.numDogs && review.numDogs > 0}
                      <span class="flex items-center gap-1">
                        <Dog class="size-3.5" />
                        {review.numDogs}
                        {review.numDogs === 1 ? "dog" : "dogs"}
                      </span>
                    {/if}
                    {#if review.images && review.images.length > 0}
                      <span class="flex items-center gap-1">
                        <Image class="size-3.5" />
                        {review.images.length}
                        {review.images.length === 1 ? "image" : "images"}
                      </span>
                    {/if}
                    {#if review.likesCount && review.likesCount > 0}
                      <span class="flex items-center gap-1">
                        <ThumbsUp class="size-3.5" />
                        {review.likesCount}
                        {review.likesCount === 1 ? "like" : "likes"}
                      </span>
                    {/if}
                    {#if review.repliesCount && review.repliesCount > 0}
                      <span class="flex items-center gap-1">
                        <MessageCircle class="size-3.5" />
                        {review.repliesCount}
                        {review.repliesCount === 1 ? "reply" : "replies"}
                      </span>
                    {/if}
                    {#if profile.data.isOwner}
                      <div class="ml-auto flex items-center gap-4">
                        <button
                          class="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          onclick={() =>
                            openEditDialog(
                              {
                                reviewId: review.id,
                                title: review.title,
                                content: review.content!,
                                rating: review.rating,
                                dogBreeds: review.dogBreeds,
                                numDogs: review.numDogs,
                                visitDate: review.visitDate,
                                images: review.images ?? [],
                              },
                              review.place.name,
                            )}
                        >
                          <Pencil class="size-3.5" />
                          Edit
                        </button>
                        <button
                          class="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          onclick={() => openDeleteDialog(review.id)}
                        >
                          <Trash2 class="size-3.5" />
                          Delete
                        </button>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </section>
        </div>
        <!-- Right Column: Collections -->
        <div class="lg:col-span-5">
          <section class="sticky top-28">
            <div class="flex items-center justify-between mb-8">
              <h2 class="serif-headline text-3xl font-bold italic text-primary">
                Collections
              </h2>
              {#if profile.data.collectionCount > 12}
                <a
                  class="text-primary font-bold hover:underline decoration-2 underline-offset-4"
                  href={`/profile/${userId}/${userName}/collections`}
                  >View All</a
                >
              {/if}
            </div>
            <div class="grid grid-cols-1 gap-8">
              {#each profile.data.collections as collection}
                <a
                  href={`/profile/${userId}/${userName}/collections/${collection.id}`}
                >
                  <div class="group cursor-pointer">
                    <div
                      class="relative h-64 rounded-[40px] overflow-hidden mb-4"
                    >
                      <OptimizedImage
                        imageId={collection.items[0].place.images[0].imageId}
                        alt={collection.name}
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        variant="card"
                      />
                      <div
                        class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
                      ></div>
                      <div class="absolute bottom-6 left-6 text-white">
                        <p
                          class="text-xs uppercase tracking-widest font-bold opacity-80"
                        >
                          {collection.itemCount} Places
                        </p>
                        <h4 class="serif-headline text-3xl font-bold italic">
                          {collection.name}
                        </h4>
                      </div>
                    </div>
                  </div>
                </a>
              {/each}
            </div>
          </section>
        </div>
      </div>
    </main>
    <Footer />
    <MobileBottomNav {user} />

    {#if deleteOpen}
      <DeleteReviewDialog open={deleteOpen} reviewId={deleteReviewId} />
    {/if}

    {#if editOpen}
      <EditReviewDialog
        open={editOpen}
        onOpenChange={(open) => (editOpen = open)}
        reviewData={editReviewData}
        placeName={editPlaceName}
      />
    {/if}
  {/if}
</ErrorBoundary>
