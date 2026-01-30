<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import type { BreadcrumbItem } from "@woofs/types";

  interface Props {
    items: BreadcrumbItem[];
  }

  const { items }: Props = $props();
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    {#each items as item, i (item.path)}
      <Breadcrumb.Item>
        {#if i === items.length - 1}
          {#if item.level !== 0}
            <Breadcrumb.Page>{item.name}</Breadcrumb.Page>
          {/if}
        {:else}
          <Breadcrumb.Link href="/location/{item.path}"
            >{item.name}</Breadcrumb.Link
          >
        {/if}
      </Breadcrumb.Item>
      {#if i < items.length - 1}
        <Breadcrumb.Separator />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
