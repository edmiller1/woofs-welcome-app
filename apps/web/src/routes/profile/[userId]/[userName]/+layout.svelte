<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Footer from "$lib/components/footer.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import EditProfileDialog from "./components/edit-profile-dialog.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { buildImageUrl } from "@woofs/image-config";
  import type { BAUser, Profile } from "@woofs/types";
  import type { Snippet } from "svelte";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfile: Profile;
      isOwner: boolean;
    };
    children: Snippet<[]>;
  }

  const { data, children }: Props = $props();
  const { initialProfile, user, userId } = $derived(data);

  const profile = createQuery(() => ({
    queryKey: ["profile", userId],
    queryFn: () => api.profile.getProfile(userId),
    initialData: initialProfile,
  }));

  const profileImage = $derived(
    profile.data?.image
      ? profile.data.image.replace(/=s\d+-c$/, "=s400-c")
      : buildImageUrl(profile.data?.profileImageId ?? "", "thumbnail"),
  );

  const profileSlug = $derived(
    profile.data?.name.split(" ").join("-").toLowerCase() ?? "",
  );

  const reviewsActive = $derived(
    page.url.pathname.includes("/reviews") ||
      page.url.pathname.endsWith(`/${profileSlug}`),
  );
  const collectionsActive = $derived(
    page.url.pathname.includes("/collections"),
  );
  const photosActive = $derived(page.url.pathname.includes("/photos"));

  let editOpen = $state(false);
</script>

<Navbar {user} />
{#if profile.isSuccess}
  <main class="pt-25 pb-16 px-5 md:px-12 max-w-7xl mx-auto">
    <section class="mb-16">
      <div
        class="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10"
      >
        <div
          class="w-32 h-32 md:w-40 md:h-40 rounded-4xl overflow-hidden shadow-xl border-4 border-white"
        >
          <img
            src={profileImage}
            alt={(profile.data?.name ?? "User") + " profile"}
            class="w-full h-full object-cover"
            referrerpolicy="no-referrer"
          />
        </div>
        <div class="flex-1 text-center md:text-left">
          <div class="flex flex-col md:flex-row mb-2 gap-10 items-center">
            <h1 class="text-3xl md:text-[40px] font-semibold">
              {profile.data.name}
            </h1>
            {#if profile.data.isOwner}
              <Button
                variant="outline"
                class="mt-2"
                onclick={() => (editOpen = true)}>Edit Profile</Button
              >
            {/if}
          </div>
          {#if profile.data.currentCity}
            <p class="mb-2 text-muted-foreground">
              {profile.data.currentCity.city}, {profile.data.currentCity
                .locality}, {profile.data.currentCity.country}
            </p>
          {/if}
          <!-- Stats Grid -->
          <div class="flex flex-wrap justify-center md:justify-start gap-10">
            <div class="text-center md:text-left">
              <span class="block text-primary-tint"
                >{profile.data.reviewCount}</span
              >
              <span
                class="text-on-surface-variant text-sm uppercase tracking-widest"
                >Review{profile.data.reviewCount === 1 ? "" : "s"}</span
              >
            </div>
            <div class="text-center md:text-left">
              <span class="block text-primary-tint"
                >{profile.data.averageRating}</span
              >
              <span
                class="text-on-surface-variant text-sm uppercase tracking-widest"
                >AVG Rating</span
              >
            </div>
            <div class="text-center md:text-left">
              <span class="block text-primary-tint"
                >{profile.data.collectionCount}</span
              >
              <span
                class="text-on-surface-variant text-sm uppercase tracking-widest"
                >Collection{profile.data.collectionCount === 1 ? "" : "s"}</span
              >
            </div>
            <div class="text-center md:text-left">
              <span class="block text-primary-tint"
                >{profile.data.photoCount}</span
              >
              <span
                class="text-on-surface-variant text-sm uppercase tracking-widest"
                >Photo{profile.data.photoCount === 1 ? "" : "s"}</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Tabs -->
    <div
      class="flex overflow-x-auto gap-10 border-b border-outline-variant/30 mb-10 pb-2"
    >
      <a
        href={`/profile/${userId}/${profileSlug}/reviews`}
        data-sveltekit-preload-data="hover"
        class="hover:text-primary-tint pb-4 px-2 whitespace-nowrap transition-all {reviewsActive
          ? 'border-b-2 border-primary-tint text-primary-tint font-bold'
          : 'border-transparent'}"
        id="tab-reviews">Reviews</a
      >
      <a
        href={`/profile/${userId}/${profileSlug}/collections`}
        data-sveltekit-preload-data="hover"
        class="hover:text-primary-tint pb-4 px-2 whitespace-nowrap transition-all {collectionsActive
          ? 'border-b-2 border-primary-tint text-primary-tint font-bold'
          : 'border-transparent'}"
        id="tab-collections">Collections</a
      >
      <a
        href={`/profile/${userId}/${profileSlug}/photos`}
        data-sveltekit-preload-data="hover"
        class="hover:text-primary-tint pb-4 px-2 whitespace-nowrap transition-all {photosActive
          ? 'border-b-2 border-primary-tint text-primary-tint font-bold'
          : 'border-transparent'}"
        id="tab-photos">Photos</a
      >
    </div>
    {@render children()}
  </main>
  <Footer />
{/if}

{#if profile.data?.isOwner}
  <EditProfileDialog bind:open={editOpen} profile={profile.data} />
{/if}
