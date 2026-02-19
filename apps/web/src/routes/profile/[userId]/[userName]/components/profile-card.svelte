<script lang="ts">
  import { Calendar, CircleCheck, Star } from "@lucide/svelte";
  import { buildImageUrl } from "@woofs/image-config";

  interface Props {
    image: string | null;
    imageId: string | null;
    profileName: string;
    reviewCount: number;
    collectionCount: number;
    averageRating: number;
    emailVerified: boolean;
  }

  const {
    image,
    imageId,
    profileName,
    reviewCount,
    collectionCount,
    averageRating,
    emailVerified,
  }: Props = $props();

  const profileImage = $derived(
    image ? image : buildImageUrl(imageId ?? "", "card"),
  );
</script>

<div
  class="flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-lg"
>
  <div class="relative mb-4">
    <div class="h-32 w-32 overflow-hidden rounded-full">
      <img
        src={profileImage}
        alt={profileName}
        class="h-32 w-32 object-cover"
      />
    </div>
    {#if emailVerified}
      <div
        class="absolute -bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <CircleCheck className="h-5 w-5" />
      </div>
    {/if}
  </div>
  <h1 class="text-2xl font-bold text-foreground">{profileName}</h1>
  <div class="mt-6 grid w-full grid-cols-3 gap-4 border-t border-border pt-6">
    <div class="flex flex-col items-center">
      <span class="text-2xl font-bold text-foreground">{reviewCount}</span>
      <span class="text-xs text-muted-foreground"
        >{reviewCount === 1 ? "Review" : "Reviews"}</span
      >
    </div>
    <div class="flex flex-col items-center border-x border-border">
      <div class="flex items-center gap-0.5">
        <span class="text-2xl font-bold text-foreground"
          >{averageRating > 0 ? averageRating : "N/A"}</span
        >
        <Star class="h-3.5 w-3.5 fill-foreground text-foreground" />
      </div>
      <span class="text-xs text-muted-foreground">Rating</span>
    </div>
    <div class="flex flex-col items-center">
      <span class="text-2xl font-bold text-foreground">{collectionCount}</span>
      <span class="text-xs text-muted-foreground"
        >{collectionCount === 1 ? "Collection" : "Collections"}</span
      >
    </div>
  </div>
</div>
