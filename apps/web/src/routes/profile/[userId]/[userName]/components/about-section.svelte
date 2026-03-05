<script lang="ts">
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import { Calendar, DogIcon, Instagram, MapPin, Pencil } from "@lucide/svelte";
  import type { CityData, Dog } from "@woofs/types";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import PrivacyTooltip from "./privacy-tooltip.svelte";

  interface Props {
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    x: string | null;
    currentCity: CityData | null;
    dogs: Dog[];
    createdAt: Date;
    isOwner: boolean;
    handleEditOpen: () => void;
    showAbout: boolean;
    showDogs: boolean;
    profileName: string;
  }

  const {
    instagram,
    facebook,
    tiktok,
    x,
    dogs,
    currentCity,
    createdAt,
    isOwner,
    handleEditOpen,
    showAbout,
    showDogs,
    profileName,
  }: Props = $props();
</script>

<section>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <h2 class="text-2xl font-bold text-foreground">About</h2>
      <PrivacyTooltip {isOwner} privacyValue={showAbout} />
    </div>
    {#if isOwner}
      <Button variant="outline" onclick={handleEditOpen}
        ><Pencil /> Edit Profile</Button
      >
    {/if}
  </div>
  {#if !isOwner && !showAbout}
    <!-- Section hidden by user settings -->
    <div class="mt-4">
      <p class="text-sm text-foreground">
        {profileName} has chosen to keep their about section private.
      </p>
    </div>
  {:else}
    <div class="mt-4 mb-6 flex flex-col gap-3">
      {#if currentCity}
        <div class="flex items-center gap-3 text-sm text-foreground">
          <MapPin class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>
            {[currentCity.city, currentCity.locality, currentCity.country]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
      {/if}
      {#if instagram}
        <div class="flex items-center gap-3 text-sm text-foreground">
          <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{instagram}</span>
        </div>
      {/if}
      {#if facebook}
        <div class="flex items-center gap-3 text-sm text-foreground">
          <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{facebook}</span>
        </div>
      {/if}
      {#if x}
        <div class="flex items-center gap-3 text-sm text-foreground">
          <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{x}</span>
        </div>
      {/if}
      {#if tiktok}
        <div class="flex items-center gap-3 text-sm text-foreground">
          <Instagram class="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{tiktok}</span>
        </div>
      {/if}
      <div class="flex items-center gap-3 text-sm text-foreground">
        <Calendar class="h-5 w-5 shrink-0 text-muted-foreground" />
        <span class="text-xs text-muted-foreground"
          >Joined {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}</span
        >
      </div>
    </div>
  {/if}
  <Separator />
  <div class="mt-6 flex items-center gap-2">
    <h2 class="text-2xl font-bold text-foreground">Dogs</h2>
    {#if isOwner}
      <Badge variant="outline" class="rounded-full px-2 py-1 text-xs"
        >{showDogs ? "Public" : "Private"}</Badge
      >
    {/if}
  </div>
  {#if !isOwner && !showDogs}
    <!-- Section hidden by user settings -->
    <div class="mt-4">
      <p class="text-sm text-foreground">
        {profileName} has chosen to keep their dogs private.
      </p>
    </div>
  {:else if dogs && dogs.length > 0}
    <div
      class="mt-6 grid grid-cols-3 gap-2 sm:gap-4 xl:gap-2 sm:grid-cols-4 xl:grid-cols-6"
    >
      {#each dogs as dog}
        <div class="flex flex-col items-center gap-2">
          <OptimizedImage
            imageId={dog.imageId}
            alt={dog.name}
            class="size-20 sm:size-24 md:size-32 rounded-full object-cover object-center"
            variant="card"
            height="128"
            width="128"
          />
          <span class="text-sm text-foreground">{dog.name}</span>
          <span class="text-xs text-muted-foreground">{dog.breed}</span>
        </div>
      {/each}
    </div>
  {:else if isOwner}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <DogIcon />
        </Empty.Media>
        <Empty.Title>No Dogs Yet</Empty.Title>
        <Empty.Description>
          You haven't added your dogs yet. Edit your profile to add them.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="default" onclick={handleEditOpen}>
          <Pencil /> Edit Profile
        </Button>
      </Empty.Content>
    </Empty.Root>
  {:else}
    <Empty.Root>
      <Empty.Header>
        <Empty.Media variant="icon">
          <DogIcon />
        </Empty.Media>
        <Empty.Title>No Dogs Yet</Empty.Title>
        <Empty.Description>
          {profileName} hasn't added any dogs yet.
        </Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/if}
</section>
