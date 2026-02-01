<script lang="ts">
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { Button } from "./ui/button";
  import { Input } from "./ui/input";
  import { Check, Heart, LoaderCircle, Plus, X } from "@lucide/svelte";
  import { api } from "$lib/api-helper";
  import type { BAUser } from "@woofs/types";
  import * as Dialog from "./ui/dialog";
  import OptimizedImage from "./optimized-image.svelte";

  interface Props {
    user: BAUser | null;
    placeId: string;
    isSaved: boolean;
  }

  const { user, placeId, isSaved }: Props = $props();

  let dialogOpen = $state(false);
  let showNewCollectionForm = $state(false);
  let newCollectionName = $state("");

  const queryClient = useQueryClient();

  const placeCollections = createQuery(() => ({
    queryKey: ["place-collections", placeId],
    queryFn: () => api.collection.getPlaceCollections(placeId),
    enabled: !!user && dialogOpen,
  }));

  const addPlaceToCollection = createMutation(() => ({
    mutationFn: ({
      placeId,
      collectionId,
    }: {
      placeId: string;
      collectionId?: string;
    }) => api.collection.addPlaceToCollection(placeId, collectionId),
    onSuccess: () => {
      toast.success("Place saved");
      queryClient.invalidateQueries({ queryKey: ["place"] });
      queryClient.invalidateQueries({
        queryKey: ["place-collections", placeId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    },
  }));

  const removePlaceFromCollection = createMutation(() => ({
    mutationFn: ({
      placeId,
      collectionId,
    }: {
      placeId: string;
      collectionId: string;
    }) => api.collection.removePlaceFromCollection(placeId, collectionId),
    onSuccess: () => {
      toast.success("Place removed");
      queryClient.invalidateQueries({ queryKey: ["place"] });
      queryClient.invalidateQueries({
        queryKey: ["place-collections", placeId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove");
    },
  }));

  const createCollection = createMutation(() => ({
    mutationFn: (name: string) => api.collection.createCollection(name),
    onSuccess: async (data) => {
      // Add the place to the newly created collection
      addPlaceToCollection.mutate({
        placeId,
        collectionId: data.collectionId,
      });
      // Reset form
      newCollectionName = "";
      showNewCollectionForm = false;
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create collection",
      );
    },
  }));

  const handleToggleCollection = (collectionId: string, hasPlace: boolean) => {
    if (hasPlace) {
      removePlaceFromCollection.mutate({ placeId, collectionId });
    } else {
      addPlaceToCollection.mutate({ placeId, collectionId });
    }
  };

  const handleQuickSave = () => {
    addPlaceToCollection.mutate({ placeId });
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim().length < 2) {
      toast.error("Collection name must be at least 2 characters");
      return;
    }
    createCollection.mutate(newCollectionName.trim());
  };

  const cancelNewCollection = () => {
    showNewCollectionForm = false;
    newCollectionName = "";
  };

  const isPending = $derived(
    addPlaceToCollection.isPending ||
      removePlaceFromCollection.isPending ||
      createCollection.isPending,
  );
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" {...props}>
        {#if isSaved}
          Saved
        {:else}
          Save
        {/if}
        <Heart
          class={`size-3 ${isSaved ? "fill-rose-500 text-rose-500" : "text-primary"}`}
        />
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>Save to collection</Dialog.Title>
      <Dialog.Description>
        Choose which collections to save this place to.
      </Dialog.Description>
    </Dialog.Header>

    <div class="max-h-80 space-y-3 overflow-y-auto py-4">
      {#if placeCollections.isLoading}
        <div class="flex items-center justify-center py-8">
          <LoaderCircle class="size-6 animate-spin" />
        </div>
      {:else if placeCollections.isSuccess}
        <!-- New collection form -->
        {#if showNewCollectionForm}
          <div class="flex items-center gap-2 rounded-lg border p-2">
            <Input
              bind:value={newCollectionName}
              placeholder="Collection name"
              class="flex-1"
              onkeydown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
                if (e.key === "Escape") cancelNewCollection();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onclick={handleCreateCollection}
              disabled={isPending || newCollectionName.trim().length < 2}
            >
              {#if createCollection.isPending}
                <LoaderCircle class="size-4 animate-spin" />
              {:else}
                <Check class="size-4" />
              {/if}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onclick={cancelNewCollection}
              disabled={isPending}
            >
              <X class="size-4" />
            </Button>
          </div>
        {:else}
          <!-- New collection button -->
          <button
            class="cursor-pointer hover:bg-muted flex w-full items-center gap-3 rounded-lg p-2 transition-colors"
            onclick={() => (showNewCollectionForm = true)}
          >
            <div
              class="bg-muted flex size-16 shrink-0 items-center justify-center rounded-lg"
            >
              <Plus class="text-muted-foreground size-6" />
            </div>
            <span class="font-medium">New collection</span>
          </button>
        {/if}

        {#if placeCollections.data.length === 0 && !showNewCollectionForm}
          <div class="space-y-4 text-center">
            <p class="text-muted-foreground text-sm">
              You don't have any collections yet.
            </p>
            <Button
              onclick={handleQuickSave}
              disabled={isPending}
              class="w-full"
            >
              {#if isPending}
                <LoaderCircle class="mr-2 size-4 animate-spin" />
              {/if}
              Save to "Saved Places"
            </Button>
          </div>
        {:else}
          {#each placeCollections.data as collection}
            <button
              class="cursor-pointer hover:bg-muted flex w-full items-center gap-3 rounded-md p-2 transition-colors"
              onclick={() =>
                handleToggleCollection(collection.id, collection.hasPlace)}
              disabled={isPending}
            >
              <!-- Instagram-style 2x2 grid preview -->
              <div
                class="bg-muted grid size-16 shrink-0 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md"
              >
                {#each Array(4) as _, i}
                  {#if collection.previewImages[i]}
                    <OptimizedImage
                      imageId={collection.previewImages[i]}
                      alt=""
                      variant="thumbnail"
                      class="size-full object-cover"
                      responsive={false}
                    />
                  {:else}
                    <div class="bg-muted-foreground/20 size-full"></div>
                  {/if}
                {/each}
              </div>

              <!-- Collection info -->
              <div class="min-w-0 flex-1 text-left">
                <div class="flex items-center gap-1">
                  {#if collection.emoji}
                    <span>{collection.emoji}</span>
                  {/if}
                  <span class="truncate font-medium">{collection.name}</span>
                </div>
                <span class="text-muted-foreground text-sm">
                  {collection.itemCount}
                  {collection.itemCount === 1 ? "place" : "places"}
                </span>
              </div>

              <!-- Check indicator -->
              <div
                class={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  collection.hasPlace
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {#if collection.hasPlace}
                  <Check class="size-4" />
                {/if}
              </div>
            </button>
          {/each}
        {/if}
      {:else if placeCollections.isError}
        <p class="text-destructive text-center text-sm">
          Failed to load collections
        </p>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogOpen = false)}>
        Done
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
