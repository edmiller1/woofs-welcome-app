<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { createMutation } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import type { PlaceWithDetails } from "@woofs/types";

  interface Props {
    open: boolean;
    place: PlaceWithDetails;
  }

  let { open = $bindable(), place }: Props = $props();

  const FIELDS = [
    { value: "name", label: "Name" },
    { value: "address", label: "Address" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "website", label: "Website" },
    { value: "description", label: "Description" },
    { value: "dogRules", label: "Dog Rules" },
    { value: "dogAmenities", label: "Dog Amenities" },
    { value: "offLeadAllowed", label: "Off-Lead Allowed" },
    { value: "waterAvailable", label: "Water Available" },
    { value: "hours", label: "Opening Hours" },
  ] as const;

  type FieldValue = (typeof FIELDS)[number]["value"];

  let selectedField = $state<FieldValue>("name");
  let notes = $state("");

  // Current place value for the selected field
  const currentValue = $derived(() => {
    switch (selectedField) {
      case "name": return place.name ?? "";
      case "address": return place.address ?? "";
      case "phone": return place.phone ?? "";
      case "email": return place.email ?? "";
      case "website": return place.website ?? "";
      case "description": return place.description ?? "";
      case "dogRules": return (place.dogRules ?? []).join("\n");
      case "dogAmenities": return (place.dogAmenities ?? []).join("\n");
      case "offLeadAllowed": return (place as any).offLeadAllowed ?? false;
      case "waterAvailable": return (place as any).waterAvailable ?? false;
      case "hours": return JSON.stringify(place.hours ?? {}, null, 2);
      default: return "";
    }
  });

  const isBooleanField = $derived(
    selectedField === "offLeadAllowed" || selectedField === "waterAvailable",
  );
  const isArrayField = $derived(
    selectedField === "dogRules" || selectedField === "dogAmenities",
  );
  const isLongTextField = $derived(
    selectedField === "description" || selectedField === "hours",
  );

  let textValue = $state("");
  let boolValue = $state(false);

  // Reset field value when selection changes
  $effect(() => {
    const cv = currentValue();
    if (isBooleanField) {
      boolValue = cv as boolean;
      textValue = "";
    } else {
      textValue = cv as string;
      boolValue = false;
    }
  });

  const buildSuggestedValue = () => {
    if (isBooleanField) return boolValue;
    if (isArrayField) return textValue.split("\n").map((s) => s.trim()).filter(Boolean);
    if (selectedField === "hours") {
      try { return JSON.parse(textValue); } catch { return textValue; }
    }
    return textValue;
  };

  const mutation = createMutation(() => ({
    mutationFn: () =>
      api.place.suggestEdit({
        placeId: place.id,
        field: selectedField,
        suggestedValue: buildSuggestedValue(),
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Thanks! Your suggestion has been submitted for review.");
      open = false;
      notes = "";
      selectedField = "name";
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Failed to submit suggestion");
    },
  }));

  const handleSubmit = () => {
    const value = buildSuggestedValue();
    if (typeof value === "string" && !value.trim()) {
      toast.error("Please enter a suggested value");
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      toast.error("Please enter at least one value");
      return;
    }
    mutation.mutate();
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-lg">
    <Dialog.Header>
      <Dialog.Title>Suggest an Edit</Dialog.Title>
      <Dialog.Description>
        Help keep <span class="font-medium text-foreground">{place.name}</span> accurate for the community.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-5 py-2">
      <!-- Field selector -->
      <div class="space-y-2">
        <Label>What needs updating?</Label>
        <Select.Root type="single" bind:value={selectedField}>
          <Select.Trigger class="w-full">
            {FIELDS.find((f) => f.value === selectedField)?.label ?? "Select a field"}
          </Select.Trigger>
          <Select.Content>
            {#each FIELDS as field}
              <Select.Item value={field.value}>{field.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <!-- Current value (read-only hint) -->
      {#if !isBooleanField && currentValue()}
        <div class="space-y-1">
          <Label class="text-xs text-muted-foreground">Current value</Label>
          <p class="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground line-clamp-3 break-all">
            {currentValue()}
          </p>
        </div>
      {/if}

      <!-- Suggested value input -->
      <div class="space-y-2">
        <Label for="suggested-value">Suggested value</Label>
        {#if isBooleanField}
          <div class="flex items-center gap-3">
            <Switch id="suggested-value" bind:checked={boolValue} />
            <span class="text-sm">{boolValue ? "Yes" : "No"}</span>
          </div>
        {:else if isLongTextField || isArrayField}
          <Textarea
            id="suggested-value"
            bind:value={textValue}
            rows={isArrayField ? 4 : 5}
            placeholder={isArrayField
              ? "One item per line"
              : selectedField === "hours"
                ? "JSON format, e.g. { \"monday\": { \"open\": \"09:00\", \"close\": \"17:00\" } }"
                : "Enter the correct description..."}
          />
          {#if isArrayField}
            <p class="text-xs text-muted-foreground">Enter one item per line</p>
          {/if}
        {:else}
          <Input
            id="suggested-value"
            bind:value={textValue}
            placeholder={selectedField === "website"
              ? "https://example.com"
              : selectedField === "phone"
                ? "+64 9 123 4567"
                : "Enter the correct value..."}
          />
        {/if}
      </div>

      <!-- Optional notes -->
      <div class="space-y-2">
        <Label for="notes">
          Additional notes <span class="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          bind:value={notes}
          rows={2}
          placeholder="Any context that might help, e.g. 'they moved locations in March'"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
      <Button onclick={handleSubmit} disabled={mutation.isPending}>
        {mutation.isPending ? "Submitting..." : "Submit suggestion"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
