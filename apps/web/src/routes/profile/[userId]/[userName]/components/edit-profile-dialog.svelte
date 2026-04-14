<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import OptimizedImage from "$lib/components/optimized-image.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import {
    Camera,
    LoaderCircle,
    MapPin,
    Plus,
    Trash2,
    X,
  } from "@lucide/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import type { CityData, Profile, UpdateProfileData } from "@woofs/types";
  import { buildImageUrl } from "@woofs/image-config";
  import { PUBLIC_MAPTILER_API_KEY } from "$env/static/public";
  import { create } from "canvas-confetti";

  interface Props {
    open: boolean;
    profile: Profile;
  }

  let { open = $bindable(), profile }: Props = $props();

  const maptilerKey = PUBLIC_MAPTILER_API_KEY;

  const queryClient = useQueryClient();

  const dogBreeds = createQuery(() => ({
    queryKey: ["dogBreeds"],
    queryFn: api.review.getDogBreeds,
  }));

  // Form state — initialized from profile
  const localProfile = $derived(profile);
  let name = $derived(profile.name);
  let instagram = $derived(profile.instagram ?? "");
  let facebook = $derived(profile.facebook ?? "");
  let x = $derived(profile.x ?? "");
  let tiktok = $derived(profile.tiktok ?? "");

  // City autocomplete
  const formatCity = (city: CityData | null) =>
    city
      ? [city.city, city.locality, city.country].filter(Boolean).join(", ")
      : "";

  let selectedCity = $state<CityData | null>(null);
  let citySearch = $state("");
  let citySuggestions = $state<
    Array<{ id: string; name: string; region: string; country: string }>
  >([]);
  let cityLoading = $state(false);
  let cityDropdownOpen = $state(false);
  let sessionToken = $state(crypto.randomUUID());
  let debounceTimer: ReturnType<typeof setTimeout>;

  const searchCity = async (query: string) => {
    if (query.length < 2) {
      citySuggestions = [];
      cityDropdownOpen = false;
      return;
    }
    cityLoading = true;
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${maptilerKey}&types=municipality&language=en`;
      const res = await fetch(url);
      const data = await res.json();
      citySuggestions =
        (data.features ?? []).map((f: any) => ({
          id: f.id,
          name: f.text,
          region: f.context?.find((c: any) => c.id?.startsWith('region'))?.text ?? '',
          country: f.context?.find((c: any) => c.id?.startsWith('country'))?.text ?? '',
        }));
      cityDropdownOpen = citySuggestions.length > 0;
    } catch (e) {
      console.error("City search failed:", e);
      citySuggestions = [];
    } finally {
      cityLoading = false;
    }
  };

  const selectCity = async (suggestion: {
    id: string;
    name: string;
    region: string;
    country: string;
  }) => {
    cityLoading = true;
    selectedCity = {
      city: suggestion.name,
      locality: suggestion.region,
      country: suggestion.country,
    };
    citySearch = formatCity(selectedCity);
    cityLoading = false;
    cityDropdownOpen = false;
    // try {
    //   const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?session_token=${sessionToken}&access_token=${mapboxToken}`;
    //   const res = await fetch(url);
    //   const data = await res.json();
    //   const feature = data.features?.[0];
    //   if (feature) {
    //     const ctx = feature.properties.context;
    //     selectedCity = {
    //       city: feature.properties.name || suggestion.name,
    //       locality: ctx?.region?.name || "",
    //       country: ctx?.country?.name || "",
    //     };
    //   } else {
    //     selectedCity = { city: suggestion.name, locality: "", country: "" };
    //   }
    //   citySearch = formatCity(selectedCity);
    // } catch (e) {
    //   console.error("City retrieve failed:", e);
    //   selectedCity = { city: suggestion.name, locality: "", country: "" };
    //   citySearch = suggestion.name;
    // } finally {
    //   cityLoading = false;
    //   cityDropdownOpen = false;
    //   sessionToken = crypto.randomUUID();
    // }
  };

  const handleCityInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    citySearch = value;
    selectedCity = null;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchCity(value), 300);
  };

  const clearCity = () => {
    citySearch = "";
    selectedCity = null;
    citySuggestions = [];
    cityDropdownOpen = false;
  };

  // Avatar
  let avatarFile = $state<File | null>(null);
  let avatarPreview = $derived(
    avatarFile ? URL.createObjectURL(avatarFile) : null,
  );

  // Dogs
  interface DogEntry {
    id?: string;
    name: string;
    breed: string;
    existingImageId?: string;
    newImage?: File;
    imagePreview: string;
  }

  let dogs = $state<DogEntry[]>(
    profile.dogs.map((d) => ({
      id: d.id,
      name: d.name,
      breed: d.breed,
      existingImageId: d.imageId,
      imagePreview: "",
    })),
  );
  let removedDogIds = $state<string[]>([]);
  let dogBreedSearch = $state<string>("");

  // Settings
  let showAbout = $derived(localProfile.userSettings.showAbout);
  let showDogs = $derived(localProfile.userSettings.showDogs);
  let showCheckIns = $derived(localProfile.userSettings.showCheckIns);
  let showReviews = $derived(localProfile.userSettings.showReviews);
  let showCollections = $derived(localProfile.userSettings.showCollections);

  // Reset form when dialog opens with fresh profile data
  $effect(() => {
    if (open) {
      name = profile.name;
      selectedCity = profile.currentCity ?? null;
      citySearch = formatCity(profile.currentCity);
      citySuggestions = [];
      cityDropdownOpen = false;
      sessionToken = crypto.randomUUID();
      instagram = profile.instagram ?? "";
      facebook = profile.facebook ?? "";
      x = profile.x ?? "";
      tiktok = profile.tiktok ?? "";
      avatarFile = null;
      dogs = profile.dogs.map((d) => ({
        id: d.id,
        name: d.name,
        breed: d.breed,
        existingImageId: d.imageId,
        imagePreview: "",
      }));
      removedDogIds = [];
      showAbout = profile.userSettings.showAbout;
      showDogs = profile.userSettings.showDogs;
      showCheckIns = profile.userSettings.showCheckIns;
      showReviews = profile.userSettings.showReviews;
      showCollections = profile.userSettings.showCollections;
    }
  });

  const addDog = () => {
    if (dogs) dogs = [...dogs, { name: "", breed: "", imagePreview: "" }];
  };

  const removeDog = (index: number) => {
    const dog = dogs[index];
    if (dog.id) {
      removedDogIds = [...removedDogIds, dog.id];
    }
    dogs = dogs.filter((_, i) => i !== index);
  };

  const handleDogImage = (index: number, event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      dogs[index].newImage = input.files[0];
      dogs[index].existingImageId = undefined;
      dogs[index].imagePreview = URL.createObjectURL(input.files[0]);
    }

    console.log(dogs);
  };

  const handleAvatarSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      avatarFile = input.files[0];
    }
  };

  const mutation = createMutation(() => ({
    mutationFn: async (data: UpdateProfileData) =>
      api.profile.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
      open = false;
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to update profile: ${error.message || "Unknown error"}`,
      );
    },
  }));

  const handleSubmit = () => {
    if (!name || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    // Build dog images array and assign imageIndex to dogs that have new images
    const dogImages: File[] = [];
    const dogsPayload = dogs.map((dog) => {
      const entry: {
        id?: string;
        name: string;
        breed: string;
        imageIndex?: number;
      } = {
        name: dog.name,
        breed: dog.breed,
      };
      if (dog.id) entry.id = dog.id;
      if (dog.newImage) {
        entry.imageIndex = dogImages.length;
        dogImages.push(dog.newImage);
      }
      return entry;
    });

    const data: UpdateProfileData = {
      name: name.trim(),
      currentCity: selectedCity,
      instagram,
      facebook,
      x,
      tiktok,
      showAbout,
      showDogs,
      showCheckIns,
      showReviews,
      showCollections,
    };

    if (avatarFile) data.image = avatarFile;
    if (dogsPayload.length > 0) data.dogs = dogsPayload;
    if (dogImages.length > 0) data.dogImages = dogImages;
    if (removedDogIds.length > 0) data.removeDogIds = removedDogIds;

    mutation.mutate(data);
  };

  const userImage = $derived(
    profile && profile.image
      ? profile.image
      : buildImageUrl(profile?.profileImageId ?? "", "thumbnail"),
  );

  let showConfirm = $state(false);

  const handleClose = () => {
    showConfirm = true;
  };

  const confirmClose = () => {
    showConfirm = false;
    open = false;
  };

  const filteredBreeds = $derived(() => {
    if (!dogBreeds.data) return [];
    if (!dogBreedSearch) return dogBreeds.data;
    return dogBreeds.data.filter((breed) =>
      breed.toLowerCase().includes(dogBreedSearch.toLowerCase()),
    );
  });
</script>

<Dialog.Root
  {open}
  onOpenChange={(value) => {
    if (!value) {
      handleClose();
    }
  }}
>
  <Dialog.Content
    showCloseButton={false}
    class="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
  >
    <Dialog.Header>
      <Dialog.Title>Edit Profile</Dialog.Title>
      <Dialog.Description>
        Update your profile information and privacy settings.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-6 py-4">
      <!-- Avatar -->
      <div class="flex items-center gap-4">
        <div class="relative">
          {#if avatarPreview}
            <img
              src={avatarPreview}
              alt="New avatar"
              class="h-20 w-20 rounded-full object-cover"
            />
          {:else if profile.profileImageId}
            <OptimizedImage
              imageId={profile.profileImageId}
              alt={profile.name}
              variant="avatar"
              class="h-20 w-20 rounded-full object-cover"
              responsive={false}
              width="80"
              height="80"
            />
          {:else if profile.image}
            <img
              src={userImage}
              alt={profile.name}
              class="h-20 w-20 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full bg-muted"
            >
              <Camera class="h-8 w-8 text-muted-foreground" />
            </div>
          {/if}
        </div>
        <div>
          <Label for="avatar-upload" class="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              onclick={() => document.getElementById("avatar-upload")?.click()}
            >
              Change Photo
            </Button>
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            onchange={handleAvatarSelect}
          />
        </div>
      </div>

      <!-- Name & City -->
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" bind:value={name} placeholder="Your name" />
        </div>
        <div class="relative space-y-2">
          <Label for="city">Current City</Label>
          <div class="relative">
            <Input
              id="city"
              value={citySearch}
              oninput={handleCityInput}
              placeholder="Search for a city..."
              autocomplete="off"
            />
            {#if cityLoading}
              <div class="absolute right-2 top-1/2 -translate-y-1/2">
                <LoaderCircle
                  class="h-4 w-4 animate-spin text-muted-foreground"
                />
              </div>
            {:else if citySearch}
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onclick={clearCity}
              >
                <X class="h-4 w-4" />
              </button>
            {/if}
          </div>
          {#if cityDropdownOpen && citySuggestions.length > 0}
            <div
              class="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
            >
              {#each citySuggestions as suggestion}
                <button
                  type="button"
                  class="flex w-full cursor-pointer gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  onclick={() => selectCity(suggestion)}
                >
                  <MapPin class="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div class="flex flex-col">
                    <span class="font-medium">{suggestion.name}</span>
                    {#if suggestion.region && suggestion.country}
                      <span class="text-sm text-muted-foreground">
                        {suggestion.region}, {suggestion.country}</span
                      >
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <Separator />

      <!-- Social Links -->
      <div>
        <h3 class="mb-3 text-sm font-medium">Social Links</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="instagram">Instagram</Label>
            <Input
              id="instagram"
              bind:value={instagram}
              placeholder="@username"
            />
          </div>
          <div class="space-y-2">
            <Label for="facebook">Facebook</Label>
            <Input
              id="facebook"
              bind:value={facebook}
              placeholder="Profile URL"
            />
          </div>
          <div class="space-y-2">
            <Label for="x">X (Twitter)</Label>
            <Input id="x" bind:value={x} placeholder="@username" />
          </div>
          <div class="space-y-2">
            <Label for="tiktok">TikTok</Label>
            <Input id="tiktok" bind:value={tiktok} placeholder="@username" />
          </div>
        </div>
      </div>

      <Separator />

      <!-- Dogs -->
      <div>
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium">Dogs</h3>
            <span class="text-xs text-muted-foreground">(max 6)</span>
          </div>
          <Button variant="outline" size="sm" onclick={addDog}>
            <Plus class="mr-1 h-4 w-4" /> Add Dog
          </Button>
        </div>
        {#if dogs.length === 0}
          <p class="text-sm text-muted-foreground">
            No dogs added yet. Add your furry friends!
          </p>
        {:else}
          <div class="flex flex-col gap-4">
            {#each dogs as dog, index}
              <div
                class="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <!-- Dog Image -->
                <div class="shrink-0">
                  {#if dog.imagePreview}
                    <img
                      src={dog.imagePreview}
                      alt="Dog"
                      class="h-16 w-16 rounded-full object-cover"
                    />
                  {:else if dog.existingImageId}
                    <OptimizedImage
                      imageId={dog.existingImageId}
                      alt={dog.name}
                      variant="thumbnail"
                      class="h-16 w-16 rounded-full object-cover"
                      responsive={false}
                    />
                  {:else}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="hidden"
                      id={`dog-image-${index}`}
                      onchange={(e) => handleDogImage(index, e)}
                    />
                    <button
                      class="cursor-pointer apperance-none flex h-16 w-16 items-center justify-center rounded-full bg-muted"
                      onclick={() =>
                        document.getElementById(`dog-image-${index}`)?.click()}
                    >
                      <Camera class="h-6 w-6 text-muted-foreground" />
                    </button>
                  {/if}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    id={`dog-image-${index}`}
                    onchange={(e) => handleDogImage(index, e)}
                  />
                  <button
                    type="button"
                    class="mt-1 cursor-pointer w-full text-center text-xs text-primary hover:underline"
                    onclick={() =>
                      document.getElementById(`dog-image-${index}`)?.click()}
                  >
                    Photo
                  </button>
                </div>
                <!-- Dog Fields -->
                <div class="flex flex-1 flex-col gap-2">
                  <Input bind:value={dog.name} placeholder="Dog's name" />
                  {#if dogBreeds.isSuccess && dogBreeds.data.length > 0}
                    <Select.Root type="single" bind:value={dog.breed}>
                      <Select.Trigger class="w-full">
                        {dogBreeds.data?.find((breed) => breed === dog.breed) ??
                          "Select a breed"}
                      </Select.Trigger>
                      <Select.Content>
                        <Input
                          bind:value={dogBreedSearch}
                          placeholder="Search for a breed"
                          class="sticky w-full -top-1.5 z-50 mb-1"
                        />
                        <Select.Group>
                          {#if filteredBreeds().length > 0}
                            {#each filteredBreeds() as breed}
                              <Select.Item class="cursor-pointer" value={breed}
                                >{breed}</Select.Item
                              >
                            {/each}
                          {:else}
                            <div class="p-4 text-sm text-muted-foreground">
                              No breeds found
                            </div>
                          {/if}
                        </Select.Group>
                      </Select.Content>
                    </Select.Root>
                  {/if}
                </div>
                <!-- Remove -->
                <Button
                  variant="ghost"
                  size="icon"
                  onclick={() => removeDog(index)}
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- <Separator /> -->

      <!-- Privacy Settings -->
      <!-- <div>
        <h3 class="mb-3 text-sm font-medium">Privacy Settings</h3>
        <p class="mb-4 text-xs text-muted-foreground">
          Control what other people can see on your profile.
        </p>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <Label for="show-about">Show About Section</Label>
            <Switch id="show-about" bind:checked={showAbout} />
          </div>
          <div class="flex items-center justify-between">
            <Label for="show-dogs">Show Dogs</Label>
            <Switch id="show-dogs" bind:checked={showDogs} />
          </div>
          <div class="flex items-center justify-between">
            <Label for="show-checkins">Show Check-ins</Label>
            <Switch id="show-checkins" bind:checked={showCheckIns} />
          </div>
          <div class="flex items-center justify-between">
            <Label for="show-reviews">Show Reviews</Label>
            <Switch id="show-reviews" bind:checked={showReviews} />
          </div>
          <div class="flex items-center justify-between">
            <Label for="show-collections">Show Collections</Label>
            <Switch id="show-collections" bind:checked={showCollections} />
          </div>
        </div>
      </div> -->
    </div>

    <Dialog.Footer
      class="sticky -bottom-6 -mx-6 rounded-b-lg bg-background z-10 border-t px-6 py-4"
    >
      <Button variant="outline" onclick={handleClose}>Cancel</Button>
      <Button onclick={handleSubmit} disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={showConfirm}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Discard changes?</AlertDialog.Title>
      <AlertDialog.Description>
        You have unsaved changes. Are you sure you want to stop editing your
        profile? Your changes will be lost.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Keep Editing</AlertDialog.Cancel>
      <AlertDialog.Action onclick={confirmClose}>Discard</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
