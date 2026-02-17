<script lang="ts">
  import { api } from "$lib/api-helper";
  import { z } from "zod/v4";
  import { defaults, superForm } from "sveltekit-superforms";
  import { zod4 } from "sveltekit-superforms/adapters";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { ImagePlus, LoaderCircle, X } from "@lucide/svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import { auth } from "$lib/auth/stores";
  import confetti from "canvas-confetti";

  interface Props {
    redirectTo: string;
  }

  const { redirectTo }: Props = $props();

  const updateProfile = createMutation(() => ({
    mutationFn: async (profileData: { name: string; image?: File }) =>
      api.auth.welcomeUser(profileData),
    onSuccess: async () => {
      toast.success("Profile updated successfully!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      await auth.initialize();
      setTimeout(() => {
        if (redirectTo) {
          goto(redirectTo);
        } else {
          goto("/account");
        }
      }, 1500);
    },
    onError: (error) => {
      toast.error(
        `Failed to update profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name must be at most 50 characters" }),
    image: z.file().optional(),
  });

  const form = superForm(defaults(zod4(formSchema)), {
    validators: zod4(formSchema),
    SPA: true,
  });

  const { form: formData, enhance } = form;
  let image: { url: string; file: File | null } = $state({
    url: "",
    file: null,
  });

  const handleDragOver = (e: HTMLElementEventMap["dragover"]) => {
    e.preventDefault();
  };

  const handleDrop = async (e: HTMLElementEventMap["drop"]) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer?.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    image = { url, file };
  };

  const handleImageSelect = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.target) return;

    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    image = { url, file };
  };

  const removeImage = () => {
    image = { url: "", file: null };
  };

  const handleSubmit = async () => {
    try {
      const profileData = {
        name: $formData.name,
        image: image.file || undefined,
      };

      console.log(profileData);

      updateProfile.mutate(profileData);
    } catch (error) {
      console.error("Profile setup error: ", error);
      toast.error("Failed to set up profile. Please try again.");
    }
  };
</script>

<svelte:head>
  <title>Welcome - Woofs Welcome</title>
  <meta
    name="description"
    content="Welcome to Woofs! Let's get started by setting up your profile."
  />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center">
  <div class="sm:mx-auto sm:w-full sm:max-w-sm">
    <img
      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
      alt="Your Company"
      class="mx-auto h-10 w-auto dark:hidden"
    />
    <img
      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
      alt="Your Company"
      class="not-dark:hidden mx-auto h-10 w-auto"
    />
    <h2
      class="mt-10 text-center text-lg font-bold tracking-tight text-gray-900 dark:text-white"
    >
      Let's finish setting up your profile
    </h2>
    <p>Tell us a bit about yourself</p>
  </div>

  <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form method="POST" use:enhance class="space-y-6">
      <Form.Field {form} name="name">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label class="block text-sm/6 font-medium">Name</Form.Label>
            <div class="mt-2">
              <Input
                type="text"
                required
                autocomplete="name"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base"
                {...props}
                bind:value={$formData.name}
              />
            </div>
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <div class="space-y-3">
        {#if image.url}
          <div>
            <img
              src={image.url}
              alt="profile"
              class="mx-auto h-32 w-32 rounded-full object-cover"
            />
          </div>
        {:else}
          <Label class="text-sm/6">Add Profile Image (Optional)</Label>
          <div
            class="bg-muted mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-white/25"
            ondragover={handleDragOver}
            ondrop={handleDrop}
            role="button"
            tabindex="0"
            aria-label="Drag and drop files here, or click to select files"
          >
            <div class="text-center">
              <ImagePlus class="text-muted-foreground mx-auto h-12 w-12" />
              <div class="mt-4 flex text-sm/6 text-gray-600 dark:text-gray-400">
                <label
                  for="file-upload"
                  class="text-primary focus-within:outline-primary hover:text-primary/90 dark:text-primary relative cursor-pointer font-semibold"
                >
                  <span>Upload a file</span>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    name="file-upload"
                    class="sr-only"
                    onchange={handleImageSelect}
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-muted-foreground text-xs/5">
                PNG, JPG, GIF up to 5MB
              </p>
              <p class="text-muted-foreground text-xs/5">(Max 1 Image)</p>
            </div>
          </div>
        {/if}
      </div>
      <div class="flex items-center justify-between">
        <Form.Button
          disabled={updateProfile.isPending}
          onclick={handleSubmit}
          type="submit"
          >{#if updateProfile.isPending}
            <LoaderCircle class="mr-2 size-3 animate-spin" />
            Submitting...
          {:else}
            Submit
          {/if}
        </Form.Button>
        {#if image.url}
          <Button
            disabled={updateProfile.isPending}
            variant="destructive"
            onclick={removeImage}
          >
            Remove Image
          </Button>
        {/if}
      </div>
    </form>
  </div>
</div>
