<script lang="ts">
  import { Spinner } from "$lib/components/ui/spinner";
</script>

<svelte:head>
  <title>Setting up your account...</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="text-center">
    <Spinner />
    <p class="mt-4 text-sm text-gray-600">Setting up your account...</p>
  </div>
</div>
