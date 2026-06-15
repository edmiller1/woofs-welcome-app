<script lang="ts">
  import { Spinner } from "$lib/components/ui/spinner";
</script>

<svelte:head>
  <title>Setting up your account...</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background">
  <div class="text-center">
    <Spinner />
    <p class="mt-4 text-sm text-muted-foreground">Setting up your account...</p>
  </div>
</div>
