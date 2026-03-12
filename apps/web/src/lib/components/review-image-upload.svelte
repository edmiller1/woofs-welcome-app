<script lang="ts">
  import { Camera, X, GripVertical } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import OptimizedImage from "./optimized-image.svelte";
  import type { ReviewImage } from "@woofs/types";

  interface Props {
    files: File[];
    onFilesChange: (files: File[]) => void;
    existingImages?: ReviewImage[];
    onExistingImageDelete?: (imageId: string) => void;
    maxFiles?: number;
    disabled?: boolean;
  }

  const {
    files,
    onFilesChange,
    existingImages = [],
    onExistingImageDelete,
    maxFiles = 5,
    disabled = false,
  }: Props = $props();

  const totalCount = $derived(existingImages.length + files.length);

  let fileInput = $state<HTMLInputElement>();
  let dragOver = $state(false);
  let dragIndex = $state<number | null>(null);

  const previews = $derived(
    files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    })),
  );

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      addFiles(Array.from(input.files));
    }
    // Reset input so same file can be selected again
    input.value = "";
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024,
    );
    const slotsLeft = maxFiles - totalCount;
    const combined = [...files, ...validFiles].slice(0, files.length + slotsLeft);
    onFilesChange(combined);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    dragOver = false;
    if (event.dataTransfer?.files) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    dragOver = true;
  };

  const handleDragLeave = () => {
    dragOver = false;
  };

  // Reorder functionality
  const handleDragStart = (index: number) => {
    dragIndex = index;
  };

  const handleDragEnd = () => {
    dragIndex = null;
  };

  const handleReorderDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;

    const newFiles = [...files];
    const [removed] = newFiles.splice(dragIndex, 1);
    newFiles.splice(targetIndex, 0, removed);
    onFilesChange(newFiles);
    dragIndex = null;
  };
</script>

<div class="space-y-3">
  <!-- Existing + new file previews -->
  {#if existingImages.length > 0 || previews.length > 0}
    <div class="flex flex-wrap gap-2">
      <!-- Existing saved images -->
      {#each existingImages as image}
        <div
          class="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted"
          role="listitem"
        >
          <OptimizedImage
            imageId={image.imageId}
            alt="Review image"
            variant="thumbnail"
            class="h-full w-full object-cover"
            width="80"
            height="80"
          />
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <button
              type="button"
              onclick={() => onExistingImageDelete?.(image.imageId)}
              class="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              aria-label="Remove image"
              {disabled}
            >
              <X class="size-4" />
            </button>
          </div>
        </div>
      {/each}

      <!-- New file previews -->
      {#each previews as preview, index}
        <div
          class="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted"
          draggable="true"
          ondragstart={() => handleDragStart(index)}
          ondragend={handleDragEnd}
          ondragover={(e) => e.preventDefault()}
          ondrop={() => handleReorderDrop(index)}
          role="listitem"
        >
          <img
            src={preview.url}
            alt="Upload preview"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <GripVertical
              class="absolute left-1 top-1 size-4 cursor-grab text-white"
            />
            <button
              type="button"
              onclick={() => removeFile(index)}
              class="rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              aria-label="Remove image"
            >
              <X class="size-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Upload area -->
  {#if totalCount < maxFiles}
    <div
      class="relative rounded-lg border-2 border-dashed p-4 text-center transition-colors {dragOver
        ? 'border-primary bg-primary/5'
        : 'border-muted-foreground/25 hover:border-muted-foreground/50'}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === "Enter" && fileInput?.click()}
    >
      <input
        bind:this={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        class="absolute inset-0 cursor-pointer opacity-0"
        onchange={handleFileSelect}
        {disabled}
      />
      <div class="flex flex-col items-center gap-2">
        <Camera class="size-8 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">
          {totalCount === 0 ? "Add photos" : "Add more photos"}
        </p>
        <p class="text-xs text-muted-foreground/70">
          {totalCount}/{maxFiles} · Max 10MB each
        </p>
      </div>
    </div>
  {/if}
</div>
