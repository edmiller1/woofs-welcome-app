<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import type { BAUser, Profile, Tab } from "@woofs/types";
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

  let editOpen = $state<boolean>(false);

  const handleEditOpen = () => {
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
    <div class="flex px-6 flex-col gap-8 lg:flex-row lg:gap-16 py-10">
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
          <CheckInCard
            isOwner={profile.data.isOwner}
            name={profile.data.name}
            checkInCount={profile.data.checkInCount}
            showCheckIns={profile.data.userSettings.showCheckIns}
            profileName={profile.data.name}
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
          isOwner={profile.data.isOwner}
          {handleEditOpen}
          showAbout={profile.data.userSettings.showAbout}
          showDogs={profile.data.userSettings.showDogs}
          profileName={profile.data.name}
        />
        <Separator />
        <CollectionsSection
          collections={profile.data.collections}
          isOwner={profile.data.isOwner}
          showCollections={profile.data.userSettings.showCollections}
          profileName={profile.data.name}
        />
        <Separator />
        <ReviewsSection
          reviews={profile.data.reviews}
          isOwner={profile.data.isOwner}
          showReviews={profile.data.userSettings.showReviews}
          profileName={profile.data.name}
        />
      </div>
    </div>

    {#if profile.data.isOwner}
      <EditProfileDialog bind:open={editOpen} profile={profile.data} />
    {/if}
  {/if}
</ErrorBoundary>
