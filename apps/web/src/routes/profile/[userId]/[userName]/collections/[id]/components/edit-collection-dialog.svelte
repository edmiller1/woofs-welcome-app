<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { LoaderCircle, Trash2 } from "@lucide/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import type { CollectionWithPlaces } from "@woofs/types";

  interface Props {
    open: boolean;
    userId: string;
    id: string;
    collectionWithPlaces: CollectionWithPlaces;
    debouncedSearch: string;
    page: number;
  }

  let {
    open = $bindable(),
    userId,
    id,
    collectionWithPlaces,
    debouncedSearch,
    page,
  }: Props = $props();

  const queryClient = useQueryClient();

  let name = $state("");
  let description = $state("");

  $effect(() => {
    if (open) {
      name = collectionWithPlaces.collection.name;
      description = collectionWithPlaces.collection.description ?? "";
    }
  });

  const updateCollection = createMutation(() => ({
    mutationFn: () =>
      api.collection.updateCollection(id, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Collection updated");
      queryClient.invalidateQueries({
        queryKey: ["collectionWithPlaces", userId, id, debouncedSearch, page],
      });
      queryClient.invalidateQueries({
        queryKey: ["profileCollections", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["collections-limit"] });
      open = false;
    },
    onError: () => {
      toast.error("Failed to update collection");
    },
  }));

  const removePlaceFromCollection = createMutation(() => ({
    mutationFn: ({ placeId }: { placeId: string; collectionId: string }) =>
      api.collection.removePlaceFromCollection(placeId, id),
    onSuccess: () => {
      toast.success("Place removed from collection!");
      queryClient.invalidateQueries({
        queryKey: ["collectionWithPlaces", userId, id, debouncedSearch, page],
      });
      queryClient.invalidateQueries({ queryKey: ["collections-limit"] });
    },
    onError: () => {
      toast.error("Failed to remove place");
    },
  }));

  function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    updateCollection.mutate();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-xl">
    <Dialog.Header>
      <Dialog.Title>Edit Collection</Dialog.Title>
      <Dialog.Description>
        Update your collection's details or remove saved places.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-6 py-4">
      <div class="flex flex-col gap-2">
        <Label for="collection-name">Name</Label>
        <Input id="collection-name" bind:value={name} maxlength={50} />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="collection-description">Description</Label>
        <Textarea
          id="collection-description"
          bind:value={description}
          maxlength={50}
          rows={3}
        />
      </div>

      <div class="flex flex-col gap-2">
        <Label>Places</Label>
        {#if collectionWithPlaces.places.length === 0}
          <p class="text-sm text-muted-foreground">
            No places in this collection yet.
          </p>
        {:else}
          <div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
            {#each collectionWithPlaces.places as place (place.id)}
              <div
                class="flex items-center gap-3 rounded-xl border border-border p-2"
              >
                <div class="size-12 shrink-0 rounded-lg overflow-hidden">
                  <OptimizedImage
                    class="w-full h-full object-cover object-center"
                    imageId={place.imageId}
                    alt={place.name}
                    height="100%"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold truncate">{place.name}</p>
                  <p class="text-xs text-muted-foreground truncate">
                    {place.cityName}, {place.regionName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-destructive"
                  disabled={removePlaceFromCollection.isPending}
                  onclick={() =>
                    removePlaceFromCollection.mutate({
                      placeId: place.id,
                      collectionId: id,
                    })}
                  aria-label={`Remove ${place.name} from collection`}
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={handleSave} disabled={updateCollection.isPending}>
        {#if updateCollection.isPending}
          <LoaderCircle class="size-4 animate-spin" />
        {/if}
        Save changes
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
