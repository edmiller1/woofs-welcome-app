<script lang="ts">
  import { api } from "$lib/api-helper";
  import Footer from "$lib/components/footer.svelte";
  import MobileBottomNav from "$lib/components/mobile-bottom-nav.svelte";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Spinner } from "$lib/components/ui/spinner";
  import { BookMarked, ChevronRight, Plus, Search } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import type { BAUser, UserCollection } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
      initialProfileCollections: UserCollection;
    };
  }

  const { data }: Props = $props();
  const { user, userName, userId, initialProfileCollections } = $derived(data);

  const profileCollections = createQuery(() => ({
    queryKey: ["profileCollections", userId],
    queryFn: () => api.collection.getProfileCollections(userId),
    initialData: initialProfileCollections,
  }));
</script>

{#if profileCollections.isLoading}
  <div class="flex items-center justify-center min-h-screen bg-[#fdf9f6]">
    <Spinner />
  </div>
{:else if profileCollections.data?.collections.length === 0}
  <div
    class="flex flex-col items-center justify-center gap-2 h-32 text-sm text-muted-foreground bg-[#fdf9f6]"
  >
    <BookMarked size={24} />
    No collections yet
  </div>
{:else}
  <main class="bg-[#fdf9f6] grow pt-12 pb-24 px-16 max-w-7xl mx-auto w-full">
    <section class="mb-12">
      <nav class="flex items-center space-x-2 text-sm font-label mb-6">
        <a
          class="text-muted-foreground hover:text-primary"
          href={`/profile/${userId}/${userName}`}>Profile</a
        >
        <ChevronRight class="size-4" />
        <span class="font-bold">Collections</span>
      </nav>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div class="max-w-2xl">
          <h1
            class="text-5xl md:text-6xl font-headline font-bold text-primary mb-4 tracking-tight"
          >
            All Collections
          </h1>
          <!-- <p class="text-lg text-secondary font-body leading-relaxed max-w-lg">
            Sarah &amp; Barnaby's curated field notes: 8 Collections gathered
            across rolling hills, salty coastlines, and secret city hollows.
          </p> -->
        </div>
        <div class="relative w-full md:w-80 group">
          <div
            class="absolute inset-y-0 left-4 flex items-center pointer-events-none"
          >
            <Search class="size-4 text-primary" />
          </div>
          <Input
            class="w-full pl-12 pr-4 py-3 bg-surface-raised border-none rounded-full focus:ring-2 focus:ring-primary font-body transition-all"
            placeholder="Filter collections..."
            type="text"
          />
        </div>
      </div>
    </section>

    <!-- Collections Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Create New Collection Card -->
      <div
        class="group relative flex flex-col h-full border-2 border-dashed border-outline-variant rounded-xl bg-muted hover:bg-stone-200 duration-300 transition-all cursor-pointer"
      >
        <div
          class="aspect-4/5 flex flex-col items-center justify-center p-6 text-center h-full"
        >
          <div
            class="p-4 rounded-full bg-muted group-hover:scale-110 transition-transform duration-300 mb-4"
          >
            <Plus class="size-6 text-primary" />
          </div>
          <span class="font-headline text-xl font-bold text-primary"
            >Create New Collection</span
          >
          <!-- <p class="text-on-surface-variant text-sm font-body mt-2">
            Start a new chapter
          </p> -->
        </div>
      </div>

      {#each profileCollections.data.collections as collection}
        <a href={`/profile/${userId}/${userName}/collections/${collection.id}`}>
          <div
            class="cursor-pointer group relative border bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col h-full"
          >
            <div class="relative aspect-4/5 overflow-hidden">
              <OptimizedImage
                imageId={collection.previewImages[0]}
                alt={collection.description}
                class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
              ></div>
              <div class="absolute bottom-6 left-6 text-white">
                <span
                  class="text-xs font-label font-semibold uppercase tracking-widest bg-accent text-gray-800 px-3 py-1 rounded-full"
                  >{collection.itemCount} places</span
                >
              </div>
            </div>
            <div class="p-6 grow flex flex-col">
              <h3 class="text-2xl font-headline font-bold text-on-surface mb-2">
                {collection.name}
              </h3>
              <p
                class="text-on-surface-variant text-sm font-body leading-relaxed grow"
              >
                {collection.description}
              </p>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </main>
  <Footer />
  <MobileBottomNav {user} />
{/if}
