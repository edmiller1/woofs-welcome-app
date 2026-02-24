<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import { Map } from "@lucide/svelte";
  import PrivacyTooltip from "./privacy-tooltip.svelte";

  interface Props {
    isOwner: boolean;
    name: string;
    checkInCount: number;
    showCheckIns: boolean;
    profileName: string;
  }

  const { isOwner, name, checkInCount, showCheckIns, profileName }: Props =
    $props();
</script>

{#if isOwner || showCheckIns}
  <div class="rounded-xl border border-border p-6">
    <div class="flex items-center gap-2">
      <h2 class="text-lg font-semibold text-foreground">
        {isOwner ? "Your Travels" : `${name}'s Travels`}
      </h2>
      <PrivacyTooltip {isOwner} privacyValue={showCheckIns} />
    </div>
    <ul class="mt-4 flex flex-col gap-3">
      <li class="flex items-center gap-3 text-sm text-foreground">
        <Map class="h-5 w-5 shrink-0 text-primary" />
        Places travelled: {checkInCount}
      </li>
    </ul>
  </div>
{/if}
