<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import type { BAUser, Profile } from "@woofs/types";
  import type { Snippet } from "svelte";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfile: Profile;
      isOwner: boolean;
    };
    children: Snippet<[]>;
  }

  const { data, children }: Props = $props();
  const { user } = $derived(data);
</script>

<Navbar {user} />
<main>
  {@render children()}
</main>
