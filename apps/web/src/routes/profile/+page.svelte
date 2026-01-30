<script lang="ts">
  import { api } from "$lib/api-helper";
  import type { BAUser } from "@woofs/types";
  import { createQuery } from "@tanstack/svelte-query";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { getUserInitials } from "$lib/helpers";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { cn } from "$lib/utils";
  import { buttonVariants } from "$lib/components/ui/button";
  import { Heart, Star } from "@lucide/svelte";

  interface Props {
    data: {
      user: BAUser;
    };
  }

  let { data }: Props = $props();

  const { user } = $derived(data);

  // Format the member since date
  const formatMemberSince = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-NZ", {
      month: "long",
      year: "numeric",
    });
  };
</script>

<div class="max-w-3xl">
  <div class="mb-6">
    <h1 class="mb-2 text-2xl font-bold">Profile</h1>
    <Separator class="mb-6" />
  </div>
</div>
