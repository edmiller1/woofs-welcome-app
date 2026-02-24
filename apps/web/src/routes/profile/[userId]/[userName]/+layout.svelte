<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import { classNames } from "$lib/utils";
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
  const { user, userName, userId, initialProfile } = $derived(data);

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
    {
      name: "Travels",
      href: `/profile/${userId}/${userName}/travels`,
    },
  ]);

  let currentTab = $state<string>("About");
</script>

<div class="mx-auto max-w-full">
  <Navbar {user} />
  <main class="mx-auto max-w-350 px-6">
    <header class="py-3 border-b border-gray-200">
      <nav class="flex overflow-x-auto">
        <ul
          role="list"
          class="flex min-w-full flex-none gap-x-6 text-sm/6 font-semibold text-gray-500"
        >
          {#each tabs as tab}
            <li>
              <a
                href={tab.href}
                aria-current={currentTab === tab.name ? "page" : undefined}
                class={classNames(
                  currentTab === tab.name
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
    </header>
    <div class="my-10">
      {@render children()}
    </div>
  </main>
</div>
