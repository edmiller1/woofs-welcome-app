<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import type { BAUser } from "@woofs/types";
  import { toast } from "svelte-sonner";
  import { buildImageUrl } from "@woofs/image-config";
  import { formatDate, getUserInitials } from "$lib/helpers";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { ImagePlus, LoaderCircle, X } from "@lucide/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";

  interface Props {
    data: {
      user: BAUser;
    };
  }

  const { data }: Props = $props();

  const { user } = $derived(data);

  const userImage = $derived(
    user && user.image
      ? user.image
      : buildImageUrl(user.profileImageId ?? "", "avatar"),
  );
  const userAltText = $derived(
    user && user.altText ? user.altText : "User Avatar",
  );

  // State for dialogs
  let nameDialogOpen = $state(false);
  let avatarDialogOpen = $state(false);

  // Form state
  let newName = $derived(user.name);
  let avatarPreview = $state<{ url: string; file: File } | null>(null);

  const updateName = createMutation(() => ({
    mutationFn: async (name: string) => api.auth.updateProfile({ name }),
    onSuccess: () => {
      toast.success("Name updated successfully!");
      nameDialogOpen = false;
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        `Failed to update profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  const updateAvatar = createMutation(() => ({
    mutationFn: async (file: File) => api.auth.updateProfile({ image: file }),
    onSuccess: () => {
      toast.success("Avatar updated successfully!");
      avatarDialogOpen = false;
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        `Failed to update profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  const handleNameSubmit = () => {
    if (!newName || newName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    updateName.mutate(newName.trim());
  };

  const handleImageSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    const url = URL.createObjectURL(file);
    avatarPreview = { url, file };
  };

  const handleAvatarSubmit = () => {
    if (!avatarPreview) {
      toast.error("Please select an image");
      return;
    }

    updateAvatar.mutate(avatarPreview.file);
  };

  const removeAvatarPreview = () => {
    if (avatarPreview?.url) {
      URL.revokeObjectURL(avatarPreview.url);
    }
    avatarPreview = null;
  };

  const handleNameDialogChange = (open: boolean) => {
    // Don't allow closing if mutation is in progress
    if (!open && updateName.isPending) {
      return;
    }
    nameDialogOpen = open;
  };

  const handleAvatarDialogChange = (open: boolean) => {
    // Don't allow closing if mutation is in progress
    if (!open && updateAvatar.isPending) {
      return;
    }
    avatarDialogOpen = open;
  };

  const closeAvatarDialog = () => {
    if (updateAvatar.isPending) return;
    avatarPreview = null;
    avatarDialogOpen = false;
  };

  const closeNameDialog = () => {
    if (updateName.isPending) return;
    newName = user.name;
    nameDialogOpen = false;
  };
</script>

<div class="max-w-3xl">
  <h1 class="mb-2 text-2xl font-bold">Account Settings</h1>

  <Separator class="mb-6" />

  <div class="divide-y divide-border">
    <div class="flex items-center justify-between py-4">
      <div class="space-y-2">
        <h4 class="text-sm font-medium">Profile Picture</h4>
        <Avatar.Root class="size-32">
          <Avatar.Image
            src={userImage}
            alt={userAltText}
            class="object-cover object-center"
          />
          <Avatar.Fallback class="text-2xl"
            >{getUserInitials(user.name)}</Avatar.Fallback
          >
        </Avatar.Root>
      </div>
      <Button variant="outline" onclick={() => (avatarDialogOpen = true)}
        >Change Image</Button
      >
    </div>
    <Separator />
    <div class="flex items-center justify-between py-4">
      <div>
        <h4 class="text-sm font-medium">{user.name}</h4>
      </div>
      <Button variant="outline" onclick={() => (nameDialogOpen = true)}
        >Change Name</Button
      >
    </div>
    <Separator />
    <div class="py-4">
      <h4 class="text-sm font-medium">{user.email}</h4>
    </div>
    <Separator />
    <div class="py-4">
      <h4 class="text-sm font-medium">
        Joined on {formatDate(user.createdAt.toString())}
      </h4>
    </div>
  </div>
</div>

<!-- Change Name Dialog -->
<Dialog.Root bind:open={nameDialogOpen} onOpenChange={handleNameDialogChange}>
  <Dialog.Content
    onInteractOutside={(e) => {
      if (updateName.isPending) {
        e.preventDefault();
      }
    }}
  >
    <Dialog.Header>
      <Dialog.Title>Change Name</Dialog.Title>
      <Dialog.Description>
        Update your display name. This will be visible to other users.
      </Dialog.Description>
    </Dialog.Header>
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          bind:value={newName}
          placeholder="Enter your name"
          disabled={updateName.isPending}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={closeNameDialog}
        disabled={updateName.isPending}>Cancel</Button
      >
      <Button onclick={handleNameSubmit} disabled={updateName.isPending}>
        {#if updateName.isPending}
          <LoaderCircle class="mr-2 size-4 animate-spin" />
        {/if}
        Save Changes
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<!-- Change Avatar Dialog -->
<Dialog.Root
  bind:open={avatarDialogOpen}
  onOpenChange={handleAvatarDialogChange}
>
  <Dialog.Content
    onInteractOutside={(e) => {
      if (updateAvatar.isPending || avatarPreview) {
        e.preventDefault();
      }
    }}
  >
    <Dialog.Header>
      <Dialog.Title>Change Profile Picture</Dialog.Title>
      <Dialog.Description>
        Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.
      </Dialog.Description>
    </Dialog.Header>
    <div class="space-y-4 py-4">
      {#if avatarPreview}
        <div class="flex justify-center py-4">
          <div class="relative">
            <div class="h-32 w-32 overflow-hidden rounded-full">
              <img
                src={avatarPreview.url}
                alt="Preview"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      {:else}
        <div
          class="bg-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8"
        >
          <ImagePlus class="text-muted-foreground mb-4 size-12" />
          <Label
            for="avatar-upload"
            class="text-primary cursor-pointer font-medium hover:underline"
          >
            Click to upload
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            class="sr-only"
            onchange={handleImageSelect}
          />
          <p class="text-muted-foreground mt-2 text-xs">
            PNG, JPG or GIF (max. 5MB)
          </p>
        </div>
      {/if}
    </div>
    <Dialog.Footer>
      {#if avatarPreview}
        <Button
          class="justify-start"
          variant="destructive"
          onclick={removeAvatarPreview}
          disabled={updateAvatar.isPending}>Remove</Button
        >
      {/if}
      <div>
        <Button
          variant="outline"
          onclick={closeAvatarDialog}
          disabled={updateName.isPending}>Cancel</Button
        >
        <Button
          onclick={handleAvatarSubmit}
          disabled={updateAvatar.isPending || !avatarPreview}
        >
          {#if updateAvatar.isPending}
            <LoaderCircle class="mr-2 size-4 animate-spin" />
          {/if}
          Upload
        </Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
