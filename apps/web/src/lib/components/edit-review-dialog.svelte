<script lang="ts">
  import { Drawer } from "vaul-svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { api } from "$lib/api-helper";
  import { useMediaQuery } from "$lib/hooks/use-media-query.svelte";
  import {
    CalendarDate,
    DateFormatter,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { UpdateReviewData, UpdateReviewInput } from "@woofs/types";
  import { toast } from "svelte-sonner";
  import { Button } from "./ui/button";
  import { CalendarIcon, LoaderCircle, X } from "@lucide/svelte";
  import StarRatingInput from "./star-rating-input.svelte";
  import { Label } from "./ui/label";
  import { Input } from "./ui/input";
  import { Textarea } from "./ui/textarea";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { cn } from "$lib/utils";
  import { untrack } from "svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Badge } from "./ui/badge";
  import ReviewImageUpload from "./review-image-upload.svelte";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reviewData: UpdateReviewData;
    placeName: string;
  }

  const { open, onOpenChange, reviewData, placeName }: Props = $props();

  const queryClient = useQueryClient();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const breeds = createQuery(() => ({
    queryKey: ["reviewDogBreeds"],
    queryFn: api.review.getDogBreeds,
  }));

  const toCalendarDate = (date: Date | string): CalendarDate => {
    const d = new Date(date);
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  };

  // Derived State + deleted images
  let title = $state(untrack(() => reviewData.title));
  let rating = $state(untrack(() => reviewData.rating));
  let content = $state(untrack(() => reviewData.content ?? ""));
  let visitDate = $state(
    untrack(() =>
      reviewData.visitDate ? toCalendarDate(reviewData.visitDate) : undefined,
    ),
  );
  let numDogs = $state(untrack(() => reviewData.numDogs ?? 1));
  let dogBreeds = $state(untrack(() => reviewData.dogBreeds ?? []));
  let images = $state(untrack(() => reviewData.images));
  let deletedImages = $state<string[]>([]);
  let newImages = $state<File[]>([]);

  // UI state
  let search = $state<string>("");
  let breedInput = $state<string>("");

  // Filter breeds based on search
  const filteredBreeds = $derived.by(() => {
    if (!breeds.data) return [];
    if (!search.trim()) return breeds.data;
    return breeds.data.filter((breed: string) =>
      breed.toLowerCase().includes(search.toLowerCase()),
    );
  });

  const hasChanges = $derived.by(() => {
    const originalDate = reviewData.visitDate
      ? toCalendarDate(reviewData.visitDate).toString()
      : undefined;
    const currentDate = visitDate?.toString();

    return (
      title !== reviewData.title ||
      rating !== reviewData.rating ||
      content !== reviewData.content ||
      currentDate !== originalDate ||
      numDogs !== reviewData.numDogs ||
      JSON.stringify(dogBreeds) !==
        JSON.stringify(reviewData.dogBreeds ?? []) ||
      newImages.length > 0 ||
      deletedImages.length > 0
    );
  });

  const updateReview = createMutation(() => ({
    mutationFn: async () => {
      const reviewInput: UpdateReviewInput = {
        title,
        content,
        rating,
        numDogs,
        dogBreeds,
        visitDate: visitDate?.toDate(getLocalTimeZone())!,
        newImages,
        deletedImages,
      };

      return api.review.updateReview(reviewData.reviewId, reviewInput);
    },
    onSuccess: () => {
      toast.success("Review updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profileReviews"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update review");
    },
  }));

  const handleRatingChange = (newRating: number) => {
    rating = newRating;
  };

  const addBreed = () => {
    const breed = breedInput.trim();
    if (breed && !dogBreeds.includes(breed) && dogBreeds.length < 5) {
      dogBreeds = [...dogBreeds, breed];
      breedInput = "";
    }
  };

  const resetForm = () => {
    title = reviewData.title;
    content = reviewData.content;
    visitDate = reviewData.visitDate
      ? toCalendarDate(reviewData.visitDate)
      : undefined;
    numDogs = reviewData.numDogs ?? 0;
    dogBreeds = reviewData.dogBreeds ?? [];
    images = reviewData.images;
    deletedImages = [];
    newImages = [];
    breedInput = "";
    search = "";
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    if (hasChanges) {
      updateReview.mutate();
    }
  };

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
              value={visitDate as CalendarDate | undefined}
              minValue={new CalendarDate(2020, 1, 1)}
              maxValue={today(getLocalTimeZone())}
              calendarLabel="Visit date"
              onValueChange={(v) => {
                visitDate = v as any;
              }}
            />
          </Popover.Content>
        </Popover.Root>
      </div>

      <!-- Number of Dogs -->
      <div class="space-y-2">
        <Label for="numDogs">How many dogs did you bring?</Label>
        <div class="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onclick={() => numDogs > 1 && (numDogs -= 1)}
            disabled={numDogs <= 1}
          >
            -
          </Button>
          <span class="w-8 text-center font-medium">{numDogs}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onclick={() => numDogs < 10 && (numDogs += 1)}
            disabled={numDogs >= 10}
          >
            +
          </Button>
        </div>
      </div>

      <!-- Dog Breeds -->
      <div class="space-y-2">
        <Label>Dog Breeds</Label>
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
                            (name) => name !== breedName,
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
                  Dog Breeds ({filteredBreeds.length} available) -
                  {dogBreeds.length}/6 selected
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
                {:else if filteredBreeds.length > 0}
                  {#each filteredBreeds as breed}
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
          <p class="text-sm text-gray-500">
            Selected: {dogBreeds.length} breed{dogBreeds.length !== 1
              ? "s"
              : ""}
          </p>
        </div>
      </div>

      <!-- Photo Upload -->
      <div class="space-y-2">
        <Label>Photos</Label>
        <ReviewImageUpload
          files={newImages}
          onFilesChange={(files) => (newImages = files)}
          existingImages={images ?? []}
          onExistingImageDelete={(imageId) => {
            deletedImages = [...deletedImages, imageId];
            images = (images ?? []).filter((img) => img.imageId !== imageId);
          }}
        />
      </div>
    </div>
  </form>
{/snippet}

{#snippet submitButton()}
  <Button
    class="w-full"
    disabled={!hasChanges || updateReview.isPending}
    onclick={handleSubmit}
  >
    {#if updateReview.isPending}
      <LoaderCircle class="mr-2 size-4 animate-spin" />
      Submitting...
    {:else}
      Update Review
    {/if}
  </Button>
{/snippet}

{#if isDesktop}
  <!-- Desktop: Dialog -->
  <Dialog.Root {open} onOpenChange={(o) => onOpenChange(o)}>
    <Dialog.Content
      class="min-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <Dialog.Header>
        <Dialog.Title>Edit Review</Dialog.Title>
        <Dialog.Description
          >Update your review for {placeName}</Dialog.Description
        >
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
          <Drawer.Title class="text-lg font-semibold">Edit Review</Drawer.Title>
          <Drawer.Description
            >Update your review for {placeName}</Drawer.Description
          >
          <Button
            variant="ghost"
            size="icon"
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
