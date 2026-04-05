<script lang="ts">
  import { page } from "$app/state";
  import { Compass, Heart, User, House } from "@lucide/svelte";
  import type { BAUser } from "@woofs/types";

  interface Props {
    user: BAUser | null;
  }

  const { user }: Props = $props();

  const profileLink = $derived(
    `/profile/${user?.id}/${user?.name.split(" ").join("-").toLowerCase()}`,
  );

  const navItems = $derived([
    { label: "Home", href: "/", icon: House },
    { label: "Explore", href: "/explore", icon: Compass },
    {
      label: "Favorites",
      href: user
        ? `${profileLink}/collections`
        : `/sign-in?redirect=${page.url.href}`,
      icon: Heart,
    },
    {
      label: "Profile",
      href: user ? `${profileLink}` : `/sign-in?redirect=${page.url.href}`,
      icon: User,
    },
  ]);
</script>

<nav
  class="fixed bottom-0 w-full z-50 bg-white md:hidden rounded-t-3xl bg-surface shadow-[0_-4px_24px_rgba(28,28,25,0.04)] flex justify-around items-center px-2 pb-6 pt-3"
>
  {#each navItems as item}
    {@const isActive = page.url.pathname.startsWith(item.href)}
    <a
      href={item.href}
      class="flex flex-col items-center justify-center px-4 py-1.5 transition-colors {isActive
        ? 'text-primary'
        : 'text-secondary'}"
    >
      <item.icon class="size-5 mb-1" />
      <span class="text-[10px] font-medium">{item.label}</span>
    </a>
  {/each}
</nav>
