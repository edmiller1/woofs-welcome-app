<script lang="ts">
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { api } from "$lib/api-helper";
  import { createQuery, createMutation } from "@tanstack/svelte-query";
  import { Check, Copy, LoaderCircle } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import type { BAUser } from "@woofs/types";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  const { data } = $props();
  const { user } = $derived(data);

  $effect(() => {
    if (user !== undefined && !(user as BAUser | null)?.isAdmin) {
      goto("/");
    }
  });

  // ── Types ────────────────────────────────────────────────────────────────────

  const ALL_TYPES = [
    "Park",
    "Restaurant",
    "Hotel",
    "Motel",
    "AirBnb",
    "Store",
    "Café",
    "Bar",
    "Dog Park",
    "Beach",
    "Walk",
    "Hike",
    "Service",
    "Activity",
    "Lake",
    "River",
    "Trail",
    "Winery",
    "Accomodation",
  ] as const;

  type PlaceType = (typeof ALL_TYPES)[number];

  const ADVENTURE_TYPES = new Set(["Walk", "Hike", "Trail"]);
  const BUSINESS_TYPES = new Set([
    "Café",
    "Restaurant",
    "Bar",
    "Store",
    "Winery",
    "Service",
  ]);
  const ACCOMMODATION_TYPES = new Set([
    "Hotel",
    "Motel",
    "AirBnb",
    "Accomodation",
  ]);
  const ACTIVITY_TYPES = new Set(["Activity"]);

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // ── Form state ───────────────────────────────────────────────────────────────

  let name = $state("");
  let slug = $state("");
  let slugManuallyEdited = $state(false);
  let selectedTypes = $state<PlaceType[]>([]);
  let description = $state("");
  let locationId = $state("");
  let locationSearch = $state("");
  let showLocationDropdown = $state(false);
  let address = $state("");
  let latitude = $state("");
  let longitude = $state("");
  let phone = $state("");
  let email = $state("");
  let website = $state("");
  let dogRules = $state<string[]>([]);
  let dogAmenities = $state<string[]>([]);
  let dogRuleInput = $state("");
  let dogAmenityInput = $state("");
  let offLeadAllowed = $state(false);
  let waterAvailable = $state(false);
  let distanceKm = $state("");
  let durationMins = $state("");
  let difficulty = $state<"beginner" | "intermediate" | "advanced">("beginner");
  let isVerified = $state(false);
  let isFeatured = $state(false);
  let showHours = $state(false);

  type DayHours = { open: string; close: string; closed: boolean };
  let hours = $state<Record<string, DayHours>>(
    Object.fromEntries(
      DAYS.map((d) => [d, { open: "09:00", close: "17:00", closed: false }]),
    ),
  );

  let createdPlace = $state<{ id: string; name: string } | null>(null);
  let copied = $state(false);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const isAdventure = $derived(
    selectedTypes.some((t) => ADVENTURE_TYPES.has(t)),
  );
  const isBusiness = $derived(selectedTypes.some((t) => BUSINESS_TYPES.has(t)));
  const isAccommodation = $derived(
    selectedTypes.some((t) => ACCOMMODATION_TYPES.has(t)),
  );
  const isActivity = $derived(selectedTypes.some((t) => ACTIVITY_TYPES.has(t)));

  const showContact = $derived(isBusiness || isAccommodation || isActivity);
  const showHoursToggle = $derived(isBusiness || isActivity);
  const showAddress = $derived(!isAdventure);
  const showAdventure = $derived(isAdventure);

  // Auto-generate slug from name unless manually edited
  $effect(() => {
    if (!slugManuallyEdited && name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }
  });

  // ── Locations query ──────────────────────────────────────────────────────────

  const locationsQuery = createQuery(() => ({
    queryKey: ["admin-locations"],
    queryFn: () => api.admin.getLocations(),
  }));

  const filteredLocations = $derived(
    (locationsQuery.data ?? [])
      .filter((l) =>
        `${l.name} ${l.type}`
          .toLowerCase()
          .includes(locationSearch.toLowerCase()),
      )
      .slice(0, 10),
  );

  const selectedLocationName = $derived(
    locationsQuery.data?.find((l) => l.id === locationId)
      ? `${locationsQuery.data.find((l) => l.id === locationId)!.name} · ${locationsQuery.data.find((l) => l.id === locationId)!.type}`
      : "",
  );

  // ── Mutation ─────────────────────────────────────────────────────────────────

  const createMut = createMutation(() => ({
    mutationFn: () =>
      api.admin.createPlace({
        name,
        slug,
        types: selectedTypes,
        description: description || undefined,
        locationId,
        address: address || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        hours: showHours ? hours : undefined,
        dogRules: dogRules.length ? dogRules : undefined,
        dogAmenities: dogAmenities.length ? dogAmenities : undefined,
        offLeadAllowed,
        waterAvailable,
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        durationMins: durationMins ? Number(durationMins) : undefined,
        difficulty: showAdventure ? difficulty : undefined,
        isVerified,
        isFeatured,
      }),
    onSuccess: (result) => {
      createdPlace = result;
      toast.success(`"${result.name}" created — images fetching in background`);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Failed to create place");
    },
  }));

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name || !slug || !selectedTypes.length || !locationId) return;
    createMut.mutate();
  }

  function toggleType(type: PlaceType) {
    if (selectedTypes.includes(type)) {
      selectedTypes = selectedTypes.filter((t) => t !== type);
    } else {
      selectedTypes = [...selectedTypes, type];
    }
  }

  function addTag(list: string[], value: string): string[] {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) return [...list, trimmed];
    return list;
  }

  function handleTagKeydown(
    e: KeyboardEvent,
    getter: () => string,
    setter: (v: string) => void,
    listGetter: () => string[],
    listSetter: (v: string[]) => void,
  ) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      listSetter(addTag(listGetter(), getter()));
      setter("");
    }
  }

  async function copyId() {
    if (!createdPlace) return;
    await navigator.clipboard.writeText(createdPlace.id);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function resetForm() {
    name = "";
    slug = "";
    slugManuallyEdited = false;
    selectedTypes = [];
    description = "";
    locationId = "";
    locationSearch = "";
    address = "";
    latitude = "";
    longitude = "";
    phone = "";
    email = "";
    website = "";
    dogRules = [];
    dogAmenities = [];
    dogRuleInput = "";
    dogAmenityInput = "";
    offLeadAllowed = false;
    waterAvailable = false;
    distanceKm = "";
    durationMins = "";
    difficulty = "beginner";
    isVerified = false;
    isFeatured = false;
    showHours = false;
    hours = Object.fromEntries(
      DAYS.map((d) => [d, { open: "09:00", close: "17:00", closed: false }]),
    );
    createdPlace = null;
  }
</script>

<HomeNavbar {user} />
<main class="min-h-screen bg-background">
  <div class="max-w-3xl mx-auto px-4 py-6 sm:py-12">
    <Breadcrumb.Root class="mt-10 mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item
          ><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item
        >
        <Breadcrumb.Separator />
        <Breadcrumb.Item
          ><Breadcrumb.Link href="/admin">Admin</Breadcrumb.Link
          ></Breadcrumb.Item
        >
        <Breadcrumb.Separator />
        <Breadcrumb.Item
          ><Breadcrumb.Page>Create Place</Breadcrumb.Page></Breadcrumb.Item
        >
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <h1 class="text-3xl font-bold mb-8">Create place</h1>

    {#if createdPlace}
      <div class="rounded-2xl border border-border bg-muted/40 p-8 space-y-4">
        <p class="text-xl font-bold">"{createdPlace.name}" created!</p>
        <p class="text-sm text-muted-foreground">
          Images are fetching in the background via Google Places.
        </p>
        <div>
          <p
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2"
          >
            Place ID
          </p>
          <div class="flex items-center gap-2">
            <code
              class="text-sm bg-muted px-3 py-2 rounded-lg flex-1 font-mono break-all"
              >{createdPlace.id}</code
            >
            <button
              onclick={copyId}
              class={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
              aria-label="Copy ID"
            >
              {#if copied}
                <Check class="size-4 text-green-500" />
              {:else}
                <Copy class="size-4" />
              {/if}
            </button>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button
            onclick={resetForm}
            class={cn(buttonVariants({ variant: "default" }))}
          >
            Create another
          </button>
          <a href="/admin" class={cn(buttonVariants({ variant: "outline" }))}
            >Back to dashboard</a
          >
        </div>
      </div>
    {:else}
      <form class="space-y-8" onsubmit={handleSubmit}>
        <!-- ── Core info ── -->
        <fieldset class="space-y-5">
          <legend
            class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
            >Core info</legend
          >

          <div>
            <label for="name" class="block text-sm font-bold mb-2"
              >Name <span class="text-destructive">*</span></label
            >
            <input
              id="name"
              type="text"
              bind:value={name}
              placeholder="e.g. Victoria Park"
              required
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label for="slug" class="block text-sm font-bold mb-2"
              >Slug <span class="text-destructive">*</span></label
            >
            <input
              id="slug"
              type="text"
              bind:value={slug}
              oninput={() => (slugManuallyEdited = true)}
              placeholder="e.g. victoria-park-auckland"
              pattern="[a-z0-9-]+"
              required
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Auto-generated from name. Only lowercase letters, numbers,
              hyphens.
            </p>
          </div>

          <div>
            <label class="block text-sm font-bold mb-3" for="types"
              >Type(s) <span class="text-destructive">*</span></label
            >
            <div class="flex flex-wrap gap-2">
              {#each ALL_TYPES as type}
                {@const active = selectedTypes.includes(type)}
                <button
                  type="button"
                  onclick={() => toggleType(type)}
                  class="cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors {active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'}"
                >
                  {type}
                </button>
              {/each}
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-bold mb-2"
              >Description</label
            >
            <textarea
              id="description"
              bind:value={description}
              rows={4}
              maxlength={2000}
              placeholder="Describe the place..."
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            ></textarea>
            <p class="text-xs text-muted-foreground mt-1">
              {description.length}/2000
            </p>
          </div>
        </fieldset>

        <!-- ── Location ── -->
        <fieldset class="space-y-5">
          <legend
            class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
            >Location</legend
          >

          <div class="relative">
            <label for="location-search" class="block text-sm font-bold mb-2"
              >Location <span class="text-destructive">*</span></label
            >
            <input
              id="location-search"
              type="text"
              bind:value={locationSearch}
              placeholder="Search locations..."
              autocomplete="off"
              onfocus={() => (showLocationDropdown = true)}
              onblur={() =>
                setTimeout(() => (showLocationDropdown = false), 150)}
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {#if locationId && selectedLocationName}
              <p class="text-xs text-primary mt-1 font-medium">
                Selected: {selectedLocationName}
              </p>
            {/if}
            {#if showLocationDropdown && locationSearch.length > 0 && filteredLocations.length > 0}
              <div
                class="absolute z-20 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden"
              >
                {#each filteredLocations as loc}
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center justify-between gap-2"
                    onmousedown={() => {
                      locationId = loc.id;
                      locationSearch = `${loc.name} · ${loc.type}`;
                      showLocationDropdown = false;
                    }}
                  >
                    <span class="font-medium">{loc.name}</span>
                    <span class="text-xs text-muted-foreground shrink-0"
                      >{loc.type}</span
                    >
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="lat" class="block text-sm font-bold mb-2"
                >Latitude</label
              >
              <input
                id="lat"
                type="number"
                step="any"
                bind:value={latitude}
                placeholder="-43.5320"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label for="lng" class="block text-sm font-bold mb-2"
                >Longitude</label
              >
              <input
                id="lng"
                type="number"
                step="any"
                bind:value={longitude}
                placeholder="172.6306"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </fieldset>

        <!-- ── Address & contact (businesses, accommodation, activity) ── -->
        {#if showAddress}
          <fieldset class="space-y-5">
            <legend
              class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
              >Address & contact</legend
            >

            <div>
              <label for="address" class="block text-sm font-bold mb-2"
                >Address</label
              >
              <input
                id="address"
                type="text"
                bind:value={address}
                placeholder="123 Main Street, Christchurch"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {#if showContact}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="phone" class="block text-sm font-bold mb-2"
                    >Phone</label
                  >
                  <input
                    id="phone"
                    type="tel"
                    bind:value={phone}
                    placeholder="+64 3 123 4567"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label
                    for="contact-email"
                    class="block text-sm font-bold mb-2">Email</label
                  >
                  <input
                    id="contact-email"
                    type="email"
                    bind:value={email}
                    placeholder="hello@place.co.nz"
                    class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label for="website" class="block text-sm font-bold mb-2"
                  >Website</label
                >
                <input
                  id="website"
                  type="url"
                  bind:value={website}
                  placeholder="https://yourplace.co.nz"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            {/if}
          </fieldset>
        {/if}

        <!-- ── Opening hours (businesses + optional for activity) ── -->
        {#if showHoursToggle}
          <fieldset class="space-y-4">
            <div class="flex items-center justify-between">
              <legend
                class="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
                >Opening hours</legend
              >
              {#if isActivity}
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox bind:checked={showHours} class="rounded" />
                  Has opening hours
                </label>
              {/if}
            </div>

            {#if isBusiness || (isActivity && showHours)}
              <div class="rounded-xl border border-border overflow-hidden">
                {#each DAYS as day}
                  {@const h = hours[day]}
                  <div
                    class="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 {h.closed
                      ? 'opacity-50'
                      : ''}"
                  >
                    <span class="text-sm font-medium w-24 shrink-0">{day}</span>
                    <Checkbox
                      bind:checked={h.closed}
                      class="shrink-0"
                      title="Closed"
                    />
                    <span class="text-xs text-muted-foreground shrink-0 w-12"
                      >{h.closed ? "Closed" : ""}</span
                    >
                    {#if !h.closed}
                      <input
                        type="time"
                        bind:value={h.open}
                        class="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <span class="text-muted-foreground text-sm">–</span>
                      <input
                        type="time"
                        bind:value={h.close}
                        class="rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </fieldset>
        {/if}

        <!-- ── Adventure-specific ── -->
        {#if showAdventure}
          <fieldset class="space-y-5">
            <legend
              class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
              >Adventure details</legend
            >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="distance" class="block text-sm font-bold mb-2"
                  >Distance (km)</label
                >
                <input
                  id="distance"
                  type="number"
                  min="0"
                  bind:value={distanceKm}
                  placeholder="5"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label for="duration" class="block text-sm font-bold mb-2"
                  >Duration (mins)</label
                >
                <input
                  id="duration"
                  type="number"
                  min="0"
                  bind:value={durationMins}
                  placeholder="120"
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold mb-2" for="difficulty"
                >Difficulty</label
              >
              <div class="flex gap-2">
                {#each ["beginner", "intermediate", "advanced"] as d}
                  <button
                    type="button"
                    onclick={() => (difficulty = d as typeof difficulty)}
                    class="px-4 py-2 rounded-full text-sm border transition-colors {difficulty ===
                    d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'}"
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                {/each}
              </div>
            </div>
          </fieldset>
        {/if}

        <!-- ── Dog info ── -->
        <fieldset class="space-y-5">
          <legend
            class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
            >Dog info</legend
          >

          <div class="flex gap-6">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox bind:checked={offLeadAllowed} class="rounded" />
              Off-lead allowed
            </label>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox bind:checked={waterAvailable} class="rounded" />
              Water available
            </label>
          </div>

          <div>
            <label class="block text-sm font-bold mb-2" for="amenities"
              >Dog amenities</label
            >
            <div class="flex flex-wrap gap-1.5 mb-2">
              {#each dogAmenities as amenity}
                <span
                  class="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full"
                >
                  {amenity}
                  <button
                    type="button"
                    onclick={() =>
                      (dogAmenities = dogAmenities.filter(
                        (a) => a !== amenity,
                      ))}
                    class="hover:text-destructive leading-none">×</button
                  >
                </span>
              {/each}
            </div>
            <input
              type="text"
              bind:value={dogAmenityInput}
              placeholder="e.g. Dog Menu (press Enter)"
              onkeydown={(e) =>
                handleTagKeydown(
                  e,
                  () => dogAmenityInput,
                  (v) => (dogAmenityInput = v),
                  () => dogAmenities,
                  (v) => (dogAmenities = v),
                )}
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label class="block text-sm font-bold mb-2" for="rules"
              >Dog rules</label
            >
            <div class="flex flex-wrap gap-1.5 mb-2">
              {#each dogRules as rule}
                <span
                  class="inline-flex items-center gap-1 bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full"
                >
                  {rule}
                  <button
                    type="button"
                    onclick={() =>
                      (dogRules = dogRules.filter((r) => r !== rule))}
                    class="hover:text-destructive leading-none">×</button
                  >
                </span>
              {/each}
            </div>
            <input
              type="text"
              bind:value={dogRuleInput}
              placeholder="e.g. Dogs must be on lead (press Enter)"
              onkeydown={(e) =>
                handleTagKeydown(
                  e,
                  () => dogRuleInput,
                  (v) => (dogRuleInput = v),
                  () => dogRules,
                  (v) => (dogRules = v),
                )}
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </fieldset>

        <!-- ── Admin flags ── -->
        <fieldset class="space-y-3">
          <legend
            class="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4"
            >Flags</legend
          >
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox bind:checked={isVerified} class="rounded" />
            Verified
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox bind:checked={isFeatured} class="rounded" />
            Featured
          </label>
        </fieldset>

        <div class="pt-2">
          <button
            type="submit"
            disabled={createMut.isPending ||
              !name ||
              !slug ||
              !selectedTypes.length ||
              !locationId}
            class={cn(
              buttonVariants({ variant: "default" }),
              "w-full py-5 text-sm font-bold disabled:opacity-40",
            )}
          >
            {#if createMut.isPending}
              <LoaderCircle class="size-4 mr-2 animate-spin" />
              Creating...
            {:else}
              Create place
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</main>
