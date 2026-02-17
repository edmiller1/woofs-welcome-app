<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import type { BAUser } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      isOwner: boolean;
    };
  }

  const { data }: Props = $props();
  const { user, userName, userId, isOwner } = $derived(data);
</script>

<div class="mx-auto max-w-375 px-2 sm:px-4 lg:px-8">
  <Navbar {user} />
</div>
