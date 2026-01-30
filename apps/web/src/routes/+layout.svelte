<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { ModeWatcher } from "mode-watcher";
  import { browser } from "$app/environment";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { handleQueryError } from "$lib/hooks/use-query-error";
  import { onMount, type Snippet } from "svelte";
  import type { BAUser } from "@woofs/types";
  import { auth, loading } from "$lib/auth/stores";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Toaster } from "$lib/components/ui/sonner";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
        retry: (failureCount, error) => {
          // Don't retry on client errors (4xx)
          if (error && typeof error === "object" && "isClientError" in error) {
            return false;
          }
          // Retry server errors up to 2 times
          return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000,
        // ✅ ADD GLOBAL ERROR HANDLER
        throwOnError: false, // Don't throw in render
      },
      mutations: {
        // ✅ ADD GLOBAL ERROR HANDLER
        onError: handleQueryError,
      },
    },
  });

  let { children, user }: { children: Snippet<[]>; user: BAUser | null } =
    $props();

  onMount(() => {
    auth.initialize();
    // if (user) {
    //   contextStore.set(user.activeContext);
    // }
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
    {@render children()}
  {/if}
  <!-- <ModeWatcher /> -->
  <Toaster closeButton />
</QueryClientProvider>
