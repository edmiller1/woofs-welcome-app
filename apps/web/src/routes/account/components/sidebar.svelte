<script lang="ts">
  import { page } from "$app/state";
  import {
    buildImageUrl,
    buildResponsiveSrcSet,
    getPlaceholderUrl,
  } from "@woofs/image-config";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import { getUserInitials } from "$lib/helpers";
  import type { BAUser } from "@woofs/types";
  import {
    Bookmark,
    ChevronDown,
    CircleUser,
    Heart,
    Settings,
    UserStar,
  } from "@lucide/svelte";

  interface Props {
    user: BAUser;
  }

  interface NavItem {
    name: string;
    href: string;
    icon: any;
    children?: Array<{
      name: string;
      href: string;
    }>;
  }

  const { user }: Props = $props();

  const navItems = [
    {
      name: "Account",
      href: "/account",
      icon: CircleUser,
    },
    {
      name: "Saved",
      href: "/account/favourites",
      icon: Bookmark,
    },
    {
      name: "Reviews",
      href: "/account/reviews",
      icon: UserStar,
    },
    {
      name: "Settings",
      href: "/account/settings",
      icon: Settings,
      children: [
        {
          name: "Account",
          href: "/account/settings",
        },
        {
          name: "Notifications",
          href: "/account/settings/notifications",
        },
      ],
    },
  ];

  const userImage = $derived(
    user && user.image
      ? user.image
      : buildImageUrl(user.profileImageId ?? "", "thumbnail"),
  );
  let expandedSections = $state<Set<string>>(new Set());

  const toggleSection = (name: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    expandedSections = newExpanded;
  };

  // Check if parent item should be active
  const isParentActive = (item: NavItem) => {
    if (item.href === "/profile") {
      return page.url.pathname === "/profile";
    }
    return page.url.pathname.startsWith(item.href);
  };

  // Check if child item is active
  const isChildActive = (href: string) => {
    return page.url.pathname === href;
  };

  // Auto-expand section if a child is active
  $effect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => page.url.pathname === child.href,
        );
        if (hasActiveChild && !expandedSections.has(item.name)) {
          expandedSections = new Set([...expandedSections, item.name]);
        }
      }
    });
  });
</script>

<aside
  class="hidden h-full w-64 shrink-0 overflow-y-auto border-r bg-white md:block"
>
  <div class="flex h-full flex-col p-6">
    <div class="mb-10 flex items-center gap-3">
      <div class="relative">
        <Avatar.Root class="h-12 w-12 border-2 border-white shadow-sm">
          <Avatar.Image
            src={userImage}
            alt={user.name}
            class="object-cover object-center"
          />
          <Avatar.Fallback>{getUserInitials(user.name)}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div>
        <h3 class="truncate text-sm font-bold">
          {user.name}
        </h3>
        <span class="text-muted-foreground text-xs">{user.email}</span>
      </div>
    </div>

    <nav class="flex-1 space-y-1">
      {#each navItems as item}
        {@const isActive = isParentActive(item)}
        {@const hasChildren = item.children && item.children.length > 0}
        {@const isExpanded = expandedSections.has(item.name)}

        <div>
          {#if hasChildren}
            <button
              onclick={() => toggleSection(item.name)}
              class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              class:bg-gray-100={isActive}
              class:text-gray-900={isActive}
            >
              <div class="flex items-center gap-3">
                <item.icon class="size-4.5" />
                {item.name}
              </div>
              <ChevronDown
                class={`size-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          {:else}
            <a
              href={item.href}
              class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              class:bg-gray-100={isActive}
              class:text-gray-900={isActive}
            >
              <item.icon class="size-4.5" />
              {item.name}
            </a>
          {/if}

          <!-- Child Items -->
          {#if hasChildren && isExpanded}
            <div class="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
              {#each item.children as child}
                {@const childActive = isChildActive(child.href)}
                <a
                  href={child.href}
                  class="block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  class:bg-gray-100={childActive}
                  class:font-medium={childActive}
                  class:text-gray-900={childActive}
                >
                  {child.name}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </nav>
    <!-- Hidden till business logic is ready -->
    <!-- <div class="flex flex-col items-start justify-end">
      <Card.Root class="gap-2 py-4 shadow-none">
        <Card.Header class="px-4">
          <Card.Title class="text-sm">Have a dog friendly business?</Card.Title>
          <Card.Description
            >Reach thousands of dog owners across New Zealand.</Card.Description
          >
        </Card.Header>
        <Card.Content class="px-4">
          <a href="/business/setup">
            <Button class="w-full shadow-none" size="sm"
              >Create business account</Button
            >
          </a>
        </Card.Content>
      </Card.Root>
    </div> -->
  </div>
</aside>
