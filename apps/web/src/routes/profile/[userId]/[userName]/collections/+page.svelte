<script lang="ts">
  import { api } from "$lib/api-helper";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { BookMarked, Lock, Trash2 } from "@lucide/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { UserCollection } from "@woofs/types";
  import { formatDistanceToNow } from "date-fns";
  import { toast } from "svelte-sonner";
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  interface Props {
    data: {
      userName: string;
      userId: string;
      initialProfileCollections: UserCollection;
      isOwner: boolean;
    };
  }

  const { data }: Props = $props();
  const { userName, userId, initialProfileCollections, isOwner } =
    $derived(data);

  const queryClient = useQueryClient();

  let deleteTargetId = $state<string | null>(null);
  let deleteTargetName = $state<string>("");
  let alertOpen = $state(false);

  const profileCollections = createQuery(() => ({
    queryKey: ["profileCollections", userId],
    queryFn: () => api.collection.getProfileCollections(userId),
    initialData: initialProfileCollections,
  }));

  const deleteCollection = createMutation(() => ({
    mutationFn: (collectionId: string) =>
      api.collection.deleteCollection(collectionId),
    onSuccess: () => {
      toast.success(`"${deleteTargetName}" deleted`);
      queryClient.invalidateQueries({
        queryKey: ["profileCollections", userId],
      });
      alertOpen = false;
      deleteTargetId = null;
    },
    onError: () => {
      toast.error("Failed to delete collection");
    },
  }));

  function confirmDelete(id: string, name: string) {
    deleteTargetId = id;
    deleteTargetName = name;
    alertOpen = true;
  }
</script>

<div class="min-h-100">
  {#if profileCollections.isLoading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <Skeleton class="rounded-3xl aspect-4/5" />
      {/each}
    </div>
  {:else if profileCollections.data.isPrivate}
    <div class="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <Lock class="size-12 text-muted-foreground" />
      <p class="font-medium">Collections are private</p>
      <p class="text-sm text-muted-foreground">
        This user hasn't made their collections public
      </p>
    </div>
  {:else if profileCollections.data.collections.length === 0}
    <div
      class="flex flex-col items-center justify-center py-16 gap-3 text-center"
    >
      <BookMarked class="size-12 text-muted-foreground" />
      <p class="font-medium">No collections yet</p>
      <p class="text-sm text-muted-foreground">
        Collections will appear here once created
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each profileCollections.data.collections as collection}
        <div class="group relative">
          <a
            href={`/profile/${userId}/${userName}/collections/${collection.id}`}
          >
            <div
              class="relative overflow-hidden rounded-3xl aspect-4/5 shadow-lg cursor-pointer"
            >
              <OptimizedImage
                imageId={collection.previewImages[0]}
                alt={collection.name}
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white"
              >
                <h4 class="font-semibold text-2xl">{collection.name}</h4>
                <p class="opacity-80">
                  {collection.itemCount} Places • Updated {formatDistanceToNow(
                    collection.lastUpdated,
                  )} ago
                </p>
              </div>
            </div>
          </a>
          {#if isOwner}
            <button
              class="absolute cursor-pointer top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              onclick={(e) => {
                e.preventDefault();
                confirmDelete(collection.id, collection.name);
              }}
              aria-label="Delete collection"
            >
              <Trash2 class="size-4" />
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<AlertDialog.Root bind:open={alertOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete "{deleteTargetName}"?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently delete the collection and remove all places from
        it. This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onclick={() =>
          deleteTargetId && deleteCollection.mutate(deleteTargetId)}
        disabled={deleteCollection.isPending}
      >
        {deleteCollection.isPending ? "Deleting…" : "Delete"}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
