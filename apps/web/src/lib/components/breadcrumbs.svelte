<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import type { BreadcrumbItem } from "@woofs/types";

  interface Props {
    items: BreadcrumbItem[];
    location: boolean;
  }

  const { items, location }: Props = $props();
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    {#each items as item, i (item.path)}
      <Breadcrumb.Item
        class={location ? "text-white hover:text-stone-800" : ""}
      >
        {#if i === items.length - 1}
          {#if item.level !== 0}
            <Breadcrumb.Page class={location ? "text-stone-800" : ""}
              >{item.name}</Breadcrumb.Page
            >
          {/if}
        {:else}
          <Breadcrumb.Link
            class={location ? "text-white hover:text-stone-800" : ""}
            href="/location/{item.path}">{item.name}</Breadcrumb.Link
          >
        {/if}
      </Breadcrumb.Item>
      {#if i < items.length - 1}
        <Breadcrumb.Separator class={location ? "text-white" : ""} />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
