<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
  import { browser } from "$app/environment";
  import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/svelte-query";
  import { handleQueryError } from "$lib/hooks/use-query-error";
  import { onMount, type Snippet } from "svelte";
  import type { BAUser } from "@woofs/types";
  import { auth, loading } from "$lib/auth/stores";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Toaster } from "$lib/components/ui/sonner";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import AccountSettingsDialog from "./profile/[userId]/[userName]/components/account-settings-dialog.svelte";
  import { settingsOpen } from "$lib/stores/accountSettingsStore";
  import { userLocation } from "$lib/stores/geolocationStore";

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    defaultOptions: {
      queries: {
        enabled: browser,
        retry: (failureCount, error) => {
          if (error && typeof error === "object" && "isClientError" in error) {
            return false;
          }
          return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000,
        throwOnError: false,
      },
      mutations: {
        onError: handleQueryError,
      },
    },
  });

  let {
    children,
    data,
  }: { children: Snippet<[]>; data: { user: BAUser | null } } = $props();

  const user = $derived(data.user);

  onMount(() => {
    auth.initialize();
    // if (user) {
    //   contextStore.set(user.activeContext);
    // }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => userLocation.set([pos.coords.longitude, pos.coords.latitude]),
        () => {},
      );
    }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Woofs Welcome" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  {#if $loading}
    <div class="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  {:else}
    <Tooltip.Provider>
      <div>
        {@render children()}
      </div>
    </Tooltip.Provider>
  {/if}
  <!-- <ModeWatcher /> -->
  <Toaster closeButton />
  {#if user}
    <AccountSettingsDialog bind:open={$settingsOpen} userId={user?.id} />
  {/if}
</QueryClientProvider>
