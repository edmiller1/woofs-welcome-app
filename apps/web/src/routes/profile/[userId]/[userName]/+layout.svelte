<script lang="ts">
  import { page } from "$app/state";
  import Navbar from "$lib/components/navbar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { classNames } from "$lib/utils";
  import { Cog, Settings } from "@lucide/svelte";
  import type { BAUser, Profile, Tab } from "@woofs/types";
  import type { Snippet } from "svelte";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfile: Profile;
    };
    children: Snippet<[]>;
  }

  const { data, children }: Props = $props();
  const { user, userName, userId } = $derived(data);

  const tabs = $derived<Tab[]>([
    {
      name: "About",
      href: `/profile/${userId}/${userName}`,
    },
    {
      name: "Collections",
      href: `/profile/${userId}/${userName}/collections`,
    },
    {
      name: "Reviews",
      href: `/profile/${userId}/${userName}/reviews`,
    },
    // {
    //   name: "Travels",
    //   href: `/profile/${userId}/${userName}/travels`,
    // },
  ]);

  const currentTab = $derived(
    tabs.find(
      (tab) =>
        page.url.pathname.startsWith(tab.href) &&
        tab.href !== `/profile/${userId}/${userName}`,
    ) ??
      tabs.find((tab) => page.url.pathname === tab.href) ??
      tabs[0],
  );
</script>

<div class="mx-auto max-w-full">
  <Navbar {user} />
  <main class="">
    <header
      class="flex items-center justify-between py-3 border-b border-gray-200 pr-3"
    >
      <nav class="flex overflow-x-auto px-6">
        <ul
          role="list"
          class="flex min-w-full flex-none gap-x-6 text-sm/6 font-semibold text-gray-500"
        >
          {#each tabs as tab}
            <li>
              <a
                href={tab.href}
                aria-current={currentTab.name === tab.name ? "page" : undefined}
                class={classNames(
                  currentTab.name === tab.name
                    ? "text-white bg-primary"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200",
                  "inline-flex items-center px-4 py-2 font-medium whitespace-nowrap rounded-sm text-sm",
                )}
                >{tab.name}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
      <div>
        <Button variant="outline"><Settings class="h-6 w-6" /></Button>
      </div>
    </header>
    <div>
      {@render children()}
    </div>
  </main>
</div>
