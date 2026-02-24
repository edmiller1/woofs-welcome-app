<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";

  interface Props {
    isOwner: boolean;
    privacyValue: boolean;
  }

  const { isOwner, privacyValue }: Props = $props();
</script>

{#if isOwner}
  <Tooltip.Root>
    <Tooltip.Trigger>
      <Badge variant="outline" class="rounded-full px-2 py-1 text-xs"
        >{privacyValue ? "Public" : "Private"}
      </Badge>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>
        {privacyValue
          ? "This section is public and visible to everyone"
          : "This section is private and only visible to you"}
      </p>
    </Tooltip.Content>
  </Tooltip.Root>
{/if}
