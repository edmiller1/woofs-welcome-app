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
  <Breadcrumb.List class="uppercase text-base">
    {#each items as item, i (item.path)}
      <Breadcrumb.Item>
        {#if i === items.length - 1}
          {#if item.level !== 0}
            <Breadcrumb.Page
              class={location
                ? "text-white font-bold"
                : "text-on-surface font-bold"}>{item.name}</Breadcrumb.Page
            >
          {/if}
        {:else}
          <Breadcrumb.Link
            class={location
              ? "text-white/80 hover:text-white"
              : "text-on-surface-variant hover:text-on-surface"}
            href="/location/{item.path}">{item.name}</Breadcrumb.Link
          >
        {/if}
      </Breadcrumb.Item>
      {#if i < items.length - 1}
        <Breadcrumb.Separator class={location ? "text-white/60" : ""} />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
