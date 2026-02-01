<script lang="ts">
  import { page } from "$app/state";
  import { api } from "$lib/api-helper";
  import Breadcrumbs from "$lib/components/breadcrumbs.svelte";
  import ErrorBoundary from "$lib/components/error-boundary.svelte";
  import Navbar from "$lib/components/navbar.svelte";
  import SaveButton from "$lib/components/save-button.svelte";
  import ShareButton from "$lib/components/share-button.svelte";
  import { Spinner } from "$lib/components/ui/spinner";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      slug: string;
      locationPath: string;
    };
  }

  const { data }: Props = $props();
  const { user, slug, locationPath } = $derived(data);

  const place = createQuery(() => ({
    queryKey: ["place", locationPath, slug],
    queryFn: () => api.place.getPlace(`${locationPath}/${slug}`),
  }));

  let imagesOpen = $state<boolean>(false);
  let currentTab = $state<string>("About");
  let mapComponent = $state<any>();
  let scrollY = $state(0);
  let headerElement = $state<HTMLElement>();
  let showStickyHeader = $state(false);
  let mapOpen = $state<boolean>(false);
  let currentPage = $state<number>(1);

  const changePage = (newPage: number) => {
    currentPage = newPage;
  };

  const changeTab = (tab: string) => {
    currentTab = tab;
  };

  const openImageDrawer = () => {
    imagesOpen = true;
  };

  const handleMapOpen = () => {
    mapOpen = true;
  };

  $effect(() => {
    if (headerElement && scrollY > 0) {
      const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
      showStickyHeader = scrollY > headerBottom;
    }
  });
</script>

<svelte:window bind:scrollY />

<ErrorBoundary error={place.error}>
  {#if place.isLoading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {/if}

  {#if place.isSuccess}
    <!-- Sticky Header -->
    <div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
      <Navbar {user} />

      <div class="py-2 lg:flex lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1">
          <Breadcrumbs items={place.data.breadcrumbs} />
          <div
            bind:this={headerElement}
            class="my-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <h2
                class="text-2xl/7 font-bold sm:truncate sm:text-4xl sm:tracking-tight"
              >
                {place.data.name}
              </h2>
            </div>
            <div class="flex items-center gap-4">
              <ShareButton url={page.url.href} name={place.data.name} />
              <SaveButton
                {user}
                placeId={place.data.id}
                isSaved={place.data.isSaved}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</ErrorBoundary>
