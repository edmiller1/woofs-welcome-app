<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import type { BAUser, Profile } from "@woofs/types";
  import ProfileCard from "./components/profile-card.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import AboutSection from "./components/about-section.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import ReviewsSection from "./components/reviews-section.svelte";
  import CollectionsSection from "./components/collections-section.svelte";

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
</script>

<ErrorBoundary error={profile.error}>
  {#if profile.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if profile.isSuccess}
    <div class="mx-auto max-w-full">
      <Navbar {user} />
      <main class="mx-auto max-w-350 px-6 py-8 lg:py-12">
        <div class="flex flex-col gap-8 lg:flex-row lg:gap-16">
          <!-- Left sidebar - Profile card -->
          <aside class="w-full shrink-0 lg:w-[320px]">
            <div class="flex flex-col gap-6">
              <ProfileCard
                image={profile.data.image}
                imageId={profile.data.profileImageId}
                profileName={profile.data.name}
                reviewCount={profile.data.reviewCount}
                collectionCount={profile.data.collectionCount}
                averageRating={profile.data.averageRating}
                emailVerified={profile.data.emailVerified}
              />
            </div>
          </aside>
          <!-- Right area -->
          <div class="flex min-w-0 flex-1 flex-col gap-10">
            <AboutSection
              instagram={profile.data.instagram}
              facebook={profile.data.facebook}
              tiktok={profile.data.tiktok}
              x={profile.data.x}
              dogs={profile.data.dogs}
              currentCity={profile.data.currentCity}
              createdAt={profile.data.createdAt}
            />
            <Separator />
            <CollectionsSection collections={profile.data.collections} />
            <Separator />
            <ReviewsSection reviews={profile.data.reviews} />
          </div>
        </div>
      </main>
    </div>
  {/if}
</ErrorBoundary>
