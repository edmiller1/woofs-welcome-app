<script lang="ts">
  import { Drawer } from "vaul-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { Badge } from "$lib/components/ui/badge";
  import StarRatingInput from "./star-rating-input.svelte";
  import ReviewImageUpload from "./review-image-upload.svelte";
  import { X, LoaderCircle, CalendarIcon, PawPrint } from "@lucide/svelte";
  import OptimizedImage from "./optimized-image.svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { BAUser, Dog } from "@woofs/types";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import {
    CalendarDate,
    type DateValue,
    DateFormatter,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import { cn } from "$lib/utils";
  import * as Select from "$lib/components/ui/select/index.js";
  import { useMediaQuery } from "$lib/hooks/use-media-query.svelte";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    placeId: string;
    placeName: string;
    user: BAUser | null;
  }

  const { open, onOpenChange, placeId, placeName, user }: Props = $props();

  const queryClient = useQueryClient();

  // Media query for desktop detection
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const breeds = createQuery(() => ({
    queryKey: ["reviewDogBreeds"],
    queryFn: api.review.getDogBreeds,
  }));

  const profileDogs = createQuery<Dog[]>(() => ({
    queryKey: ["profileDogs"],
    queryFn: api.profile.getProfileDogs,
    enabled: !!user,
  }));

  // Form state
  let rating = $state(0);
  let title = $state("");
  let content = $state("");
  let visitDate = $state<DateValue | undefined>();
  let selectedDogIds = $state<string[]>([]);
  let dogBreeds = $state<string[]>([]);
  let images = $state<File[]>([]);

  // numDogs derived from tagged dogs; min 1
  const numDogs = $derived(Math.max(selectedDogIds.length, 1));

  // UI state
  let expanded = $state(false);
  let search = $state<string>("");

  // Filter breeds based on search
  const filteredBreeds = $derived(() => {
    if (!breeds.data) return [];
    if (!search.trim()) return breeds.data;
    return breeds.data.filter((breed: string) =>
      breed.toLowerCase().includes(search.toLowerCase()),
    );
  });

  const isFormValid = $derived(
    rating > 0 && title.trim().length > 0 && visitDate !== undefined,
  );

  const createReview = createMutation(() => ({
    mutationFn: async () => {
      const reviewData = {
        placeId,
        rating,
        title,
        content,
        visitDate: visitDate!.toDate(getLocalTimeZone()),
        numDogs,
        dogBreeds,
        dogIds: selectedDogIds,
        images,
      };

      return api.review.createReview(reviewData);
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["place-reviews", placeId] });
      resetForm();
      onOpenChange(false);
    },
  }));

  const resetForm = () => {
    rating = 0;
    title = "";
    content = "";
    visitDate = undefined;
    selectedDogIds = [];
    dogBreeds = [];
    images = [];
    expanded = false;
  };

  function toggleDog(id: string) {
    selectedDogIds = selectedDogIds.includes(id)
      ? selectedDogIds.filter((d) => d !== id)
      : [...selectedDogIds, id];
  }

  const handleRatingChange = (newRating: number) => {
    rating = newRating;
    if (!expanded && newRating > 0) {
      expanded = true;
    }
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    if (isFormValid) {
      createReview.mutate();
    }
  };

  // Reset form when drawer closes
  $effect(() => {
    if (!open) {
      resetForm();
    }
  });

  const df = new DateFormatter("en-AU", {
    dateStyle: "long",
  });
</script>

{#snippet reviewFormContent()}
  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Star Rating - Always visible -->
    <div class="flex flex-col items-center gap-2 py-4">
      <p class="text-sm text-muted-foreground">
        {rating === 0
          ? "Tap to rate"
          : rating === 1
            ? "Poor"
            : rating === 2
              ? "Fair"
              : rating === 3
                ? "Good"
                : rating === 4
                  ? "Very Good"
                  : "Excellent"}
      </p>
      <StarRatingInput {rating} onRatingChange={handleRatingChange} size="lg" />
    </div>

    <!-- Expanded form -->
    {#if expanded}
      <div class="space-y-4">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">Review Title *</Label>
          <Input
            id="title"
            bind:value={title}
            placeholder="Summarize your experience"
            maxlength={100}
          />
        </div>

        <!-- Content -->
        <div class="space-y-2">
          <Label for="content">Your Review</Label>
          <Textarea
            id="content"
            bind:value={content}
            placeholder="Share details about your visit..."
            rows={4}
          />
        </div>

        <!-- Visit Date -->
        <div class="space-y-2">
          <Label for="visitDate">When did you visit? *</Label>
          <Popover.Root>
            <Popover.Trigger class="w-full">
              {#snippet child({ props })}
                <Button
                  variant="outline"
                  class={cn(
                    "w-full justify-start text-left font-normal",
                    !visitDate && "text-muted-foreground",
                  )}
                  {...props}
                >
                  <CalendarIcon class="mr-2 size-4" />
                  {visitDate
                    ? df.format(visitDate.toDate(getLocalTimeZone()))
                    : "Select a date"}
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content class="w-auto p-0">
              <Calendar
                type="single"
                value={visitDate}
                minValue={new CalendarDate(2020, 1, 1)}
                maxValue={today(getLocalTimeZone())}
                calendarLabel="Visit date"
                onValueChange={(v) => {
                  visitDate = v;
                }}
              />
            </Popover.Content>
          </Popover.Root>
        </div>

        <!-- Which dogs did you bring? -->
        <div class="space-y-2">
          <Label>Which dogs did you bring?</Label>
          {#if profileDogs.isLoading}
            <div
              class="flex items-center gap-2 text-sm text-muted-foreground py-2"
            >
              <LoaderCircle class="size-4 animate-spin" />
              Loading your dogs...
            </div>
          {:else if profileDogs.isSuccess && profileDogs.data.length > 0}
            <div class="flex flex-wrap gap-2">
              {#each profileDogs.data as dog}
                {@const selected = selectedDogIds.includes(dog.id)}
                <button
                  type="button"
                  onclick={() => toggleDog(dog.id)}
                  class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer {selected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'}"
                >
                  {#if dog.imageId}
                    <OptimizedImage
                      imageId={dog.imageId}
                      alt={dog.name}
                      variant="thumbnail"
                      class="size-5 rounded-full object-cover"
                      responsive={false}
                      width="20"
                      height="20"
                    />
                  {:else}
                    <PawPrint
                      class="size-4 {selected
                        ? 'text-white'
                        : 'text-muted-foreground'}"
                    />
                  {/if}
                  {dog.name}
                  {#if dog.breed}
                    <span class="opacity-60 text-xs">· {dog.breed}</span>
                  {/if}
                </button>
              {/each}
            </div>
            {#if selectedDogIds.length > 0}
              <p class="text-xs text-muted-foreground">
                {selectedDogIds.length} dog{selectedDogIds.length !== 1
                  ? "s"
                  : ""} selected
              </p>
            {/if}
          {:else}
            <div class="rounded-lg border border-dashed p-4 text-center">
              <PawPrint class="size-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground mb-2">
                No dogs on your profile yet.
              </p>
              <a
                href="/profile"
                class="text-sm text-primary font-medium hover:underline"
                target="_blank">Add your dogs to your profile →</a
              >
            </div>
          {/if}
        </div>

        <!-- Additional breeds (for dogs not on profile) -->
        <div class="space-y-2">
          <Label
            >Additional dog breeds <span
              class="text-xs text-muted-foreground font-normal">(optional)</span
            ></Label
          >
          <div class="flex flex-col gap-2">
            <Select.Root type="multiple" bind:value={dogBreeds}>
              <Select.Trigger
                class="h-auto min-h-10 w-full p-1 [&>span]:flex! [&>span]:h-auto! [&>span]:flex-wrap!"
              >
                <div class="flex h-full flex-wrap items-center gap-x-1">
                  {#if dogBreeds && dogBreeds.length > 0}
                    {#each dogBreeds as breedName}
                      <Badge variant="secondary" class="text-xs">
                        {breedName}
                        <button
                          type="button"
                          onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dogBreeds = dogBreeds.filter(
                              (n) => n !== breedName,
                            );
                          }}
                          class="cursor-pointer z-50 ml-1 rounded-full"
                        >
                          <X class="h-3 w-3 hover:text-white" />
                        </button>
                      </Badge>
                    {/each}
                  {:else}
                    <span class="text-muted-foreground flex-1 text-sm"
                      >e.g., Golden Retriever</span
                    >
                  {/if}
                </div>
              </Select.Trigger>
              <Select.Content class="h-75">
                <Input
                  bind:value={search}
                  placeholder="Search for a breed"
                  class="sticky w-full -top-1.5 z-50"
                />
                <Select.Group>
                  <Select.Label>
                    Dog Breeds ({filteredBreeds().length} available) — {dogBreeds.length}/6
                    selected
                  </Select.Label>
                  {#if breeds.isLoading}
                    <div class="flex items-center justify-center p-4">
                      <LoaderCircle
                        class="size-5 animate-spin text-muted-foreground"
                      />
                      <span class="ml-2 text-sm text-muted-foreground"
                        >Loading breeds...</span
                      >
                    </div>
                  {:else if breeds.isError}
                    <div class="p-4 text-sm text-destructive">
                      Failed to load breeds
                    </div>
                  {:else if filteredBreeds().length > 0}
                    {#each filteredBreeds() as breed}
                      <Select.Item
                        value={breed}
                        label={breed}
                        disabled={dogBreeds.length >= 6 &&
                          !dogBreeds.includes(breed)}
                        class="cursor-pointer"
                      >
                        {breed}
                      </Select.Item>
                    {/each}
                  {:else}
                    <div class="p-4 text-sm text-muted-foreground">
                      No breeds found
                    </div>
                  {/if}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <!-- Photo Upload -->
        <div class="space-y-2">
          <Label>Photos</Label>
          <ReviewImageUpload
            files={images}
            onFilesChange={(files) => (images = files)}
          />
        </div>
      </div>
    {/if}
  </form>
{/snippet}

{#snippet submitButton()}
  {#if expanded}
    <Button
      class="w-full"
      disabled={!isFormValid || createReview.isPending}
      onclick={handleSubmit}
    >
      {#if createReview.isPending}
        <LoaderCircle class="mr-2 size-4 animate-spin" />
        Submitting...
      {:else}
        Submit Review
      {/if}
    </Button>
  {/if}
{/snippet}

{#if isDesktop}
  <!-- Desktop: Dialog -->
  <Dialog.Root {open} onOpenChange={(o) => onOpenChange(o)}>
    <Dialog.Content
      class="min-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <Dialog.Header>
        <Dialog.Title>
          {expanded ? `Review ${placeName}` : "Rate this place"}
        </Dialog.Title>
        <Dialog.Description>
          Share your experience to help other dog owners
        </Dialog.Description>
      </Dialog.Header>

      <div class="flex-1 overflow-y-auto px-1">
        {@render reviewFormContent()}
      </div>

      <Dialog.Footer class="pt-4">
        {@render submitButton()}
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Mobile: Drawer -->
  <Drawer.Root {open} onOpenChange={(o) => onOpenChange(o)}>
    <Drawer.Portal>
      <Drawer.Overlay class="fixed inset-0 bg-black/40" />
      <Drawer.Content
        class="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90vh] flex-col rounded-t-xl bg-background"
      >
        <!-- Drag handle -->
        <div
          class="cursor-pointer mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-muted"
        ></div>

        <!-- Header -->
        <div class="flex items-center justify-between border-b px-4 py-3">
          <Drawer.Title class="text-lg font-semibold">
            {expanded ? `Review ${placeName}` : "Rate this place"}
          </Drawer.Title>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onclick={() => onOpenChange(false)}
          >
            <X class="size-5" />
          </Button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4">
          {@render reviewFormContent()}
        </div>

        <!-- Footer -->
        <div class="border-t p-4">
          {@render submitButton()}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
