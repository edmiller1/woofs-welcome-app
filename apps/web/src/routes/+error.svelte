<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { Home, RefreshCw } from "@lucide/svelte";

  const status = $derived(page.status);
  const isNotFound = $derived(status === 404);
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-[#fdf9f6] p-8">
  <div class="mx-auto max-w-md text-center">
    <div class="mb-6">
      <span class="text-8xl font-bold text-rose-200">{status}</span>
    </div>

    <h1 class="mb-3 text-2xl font-bold text-gray-900">
      {#if isNotFound}
        Page not found
      {:else}
        Something went wrong
      {/if}
    </h1>

    <p class="text-muted-foreground mb-8">
      {#if isNotFound}
        The page you're looking for doesn't exist or has been moved.
      {:else}
        We ran into an unexpected error. Please try again or head back home.
      {/if}
    </p>

    <div class="flex justify-center gap-3">
      <Button href="/" variant="default" class="gap-2">
        <Home class="size-4" />
        Go home
      </Button>
      {#if !isNotFound}
        <Button
          variant="outline"
          class="gap-2"
          onclick={() => window.location.reload()}
        >
          <RefreshCw class="size-4" />
          Try again
        </Button>
      {/if}
    </div>
  </div>
</div>
