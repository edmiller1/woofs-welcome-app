<script lang="ts">
  import { page } from "$app/state";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import type { BreadcrumbItem } from "@woofs/types";

  interface Props {
    items: BreadcrumbItem[];
    location: boolean;
  }

  const { items, location }: Props = $props();

  const isPlacePage = page.url.pathname.includes("/places");

  // On mobile, collapse everything except first and last into an ellipsis
  const hasMiddle = $derived(items.length > 2);
  const first = $derived(items[0]);
  const last = $derived(items[items.length - 1]);
  const middle = $derived(items.slice(1, -1));
</script>

<Breadcrumb.Root class="sm:my-0 my-3 sm:mx-0 mx-3">
  <!-- Desktop: show all items -->
  <Breadcrumb.List
    class="hidden sm:flex {!isPlacePage ? 'uppercase text-base' : 'text-sm'}"
  >
    {#each items as item, i (item.path)}
      <Breadcrumb.Item>
        {#if i === items.length - 1}
          {#if item.level !== 0}
            <Breadcrumb.Page
              class={location
                ? "text-white font-bold"
                : "text-primary font-bold"}
            >
              {item.name}
            </Breadcrumb.Page>
          {/if}
        {:else}
          <Breadcrumb.Link
            class={location
              ? "text-white/80 hover:text-white"
              : "text-foreground"}
            href="/location/{item.path}">{item.name}</Breadcrumb.Link
          >
        {/if}
      </Breadcrumb.Item>
      {#if i < items.length - 1}
        <Breadcrumb.Separator class={location ? "text-white/60" : ""} />
      {/if}
    {/each}
  </Breadcrumb.List>

  <!-- Mobile: first > … > last -->
  <Breadcrumb.List
    class="flex sm:hidden {!isPlacePage ? 'uppercase text-base' : 'text-sm'}"
  >
    {#if items.length > 0}
      <!-- First item -->
      <Breadcrumb.Item>
        <Breadcrumb.Link
          class={location
            ? "text-white/80 hover:text-white"
            : "text-foreground"}
          href="/location/{first.path}">{first.name}</Breadcrumb.Link
        >
      </Breadcrumb.Item>

      {#if hasMiddle}
        <Breadcrumb.Separator class={location ? "text-white/60" : ""} />
        <Breadcrumb.Item>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Breadcrumb.Ellipsis class={location ? "text-white/60" : ""} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
              {#each middle as item}
                <DropdownMenu.Item>
                  <a href="/location/{item.path}" class="w-full">{item.name}</a>
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Breadcrumb.Item>
      {/if}

      {#if items.length > 1}
        <Breadcrumb.Separator class={location ? "text-white/60" : ""} />
        <Breadcrumb.Item>
          {#if last.level !== 0}
            <Breadcrumb.Page
              class={location
                ? "text-white font-bold"
                : "text-primary font-bold"}
            >
              {last.name}
            </Breadcrumb.Page>
          {:else}
            <Breadcrumb.Link
              class={location
                ? "text-white/80 hover:text-white"
                : "text-foreground"}
              href="/location/{last.path}">{last.name}</Breadcrumb.Link
            >
          {/if}
        </Breadcrumb.Item>
      {/if}
    {/if}
  </Breadcrumb.List>
</Breadcrumb.Root>
