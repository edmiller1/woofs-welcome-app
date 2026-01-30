<script lang="ts">
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

<div>Place page</div>
