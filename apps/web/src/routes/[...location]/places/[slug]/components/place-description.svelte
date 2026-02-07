<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { BAUser } from "@woofs/types";
  import { BadgeCheck } from "@lucide/svelte";

  interface Props {
    description: string | null;
    user: BAUser | null;
  }

  const { description, user }: Props = $props();
</script>

<div class="py-4">
  <h4 class="text-xl font-semibold">Description</h4>
  {#if description}
    <p class="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
      {description}
    </p>
  {:else}
    <p class="mt-2 italic text-gray-500 dark:text-gray-400">
      Description coming soon...
    </p>
  {/if}
</div>
