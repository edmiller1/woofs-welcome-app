<script lang="ts">
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { MapPin } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import type { BAUser } from "@woofs/types";

  const { data } = $props();
  const { user } = $derived(data);

  $effect(() => {
    if (user !== undefined && !(user as BAUser | null)?.isAdmin) {
      goto("/");
    }
  });
</script>

<HomeNavbar {user} />
<main class="min-h-screen bg-background">
  <div class="max-w-4xl px-12 py-24">
    <div class="mb-10">
      <p
        class="text-xs font-semibold text-primary uppercase tracking-widest mb-2"
      >
        Admin
      </p>
      <h1 class="text-3xl font-bold">Dashboard</h1>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <a
        href="/admin/places/create"
        class="rounded-2xl border border-border p-6 hover:bg-muted/40 transition-colors group"
      >
        <div
          class="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center mb-4"
        >
          <MapPin class="size-5 text-primary" />
        </div>
        <h2 class="font-bold text-lg mb-1">Create place</h2>
        <p class="text-sm text-muted-foreground">
          Add a new dog-friendly place to the directory.
        </p>
      </a>
    </div>
  </div>
</main>
