<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { createMutation, createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { LoaderCircle } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { Spinner } from "$lib/components/ui/spinner";

  const notificationPreferences = createQuery(() => ({
    queryKey: ["notificationPreferences"],
    queryFn: api.notification.getUserPreferences,
  }));

  const updatePreferences = createMutation(() => ({
    mutationFn: api.notification.updateUserPreferences,
    onSuccess: () => {
      toast.success("Preferences updated successfully");
      notificationPreferences.refetch();
    },
    onError: (error) => {
      toast.error(
        `Failed to update preferences: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  const resetPreferences = createMutation(() => ({
    mutationFn: api.notification.resetUserPreferences,
    onSuccess: () => {
      toast.success("Preferences reset successfully");
      notificationPreferences.refetch();
    },
    onError: (error) => {
      toast.error(
        `Failed to reset preferences: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  const handleToggle = (
    category: "email" | "push",
    key: string,
    value: boolean,
  ) => {
    updatePreferences.mutate({
      [category]: {
        [key]: value,
      },
    });
  };

  const handleReset = () => {
    resetPreferences.mutate();
  };

  // Email notification settings
  const emailSettings = [
    {
      title: "Review Replies",
      description: "Get notified when someone replies to your review",
      key: "reviewReplies",
      category: "Engagement",
    },
    {
      title: "Reply to your comments",
      description: "Get notified when someone replies to your comments",
      key: "replyToYourReply",
      category: "Engagement",
    },
    {
      title: "Review thread activity",
      description: "Get notified when someone replies to your review",
      key: "reviewThreadActivity",
      category: "Engagement",
    },
    {
      title: "Review Likes",
      description: "Get notified when someone likes your review",
      key: "reviewLikes",
      category: "Engagement",
    },
    {
      title: "New Reviews on Favourites",
      description: "Get notified when someone reviews a place you favorited",
      key: "newReviewsOnFavourites",
      category: "Engagement",
    },
    {
      title: "Report Status",
      description: "Get notified about report status updates",
      key: "reportStatus",
      category: "Engagement",
    },
    {
      title: "Marketing",
      description: "Receive marketing and promotional emails",
      key: "marketing",
      category: "Marketing",
    },
    {
      title: "Newsletter",
      description: "Receive our newsletter with tips and updates",
      key: "newsletter",
      category: "Marketing",
    },
    {
      title: "Nearby places",
      description: "Get notified about new dog-friendly places near you",
      key: "nearbyPlaces",
      category: "Discovery",
    },
  ];

  // Push notification settings
  const pushSettings = [
    {
      title: "Review Replies",
      description: "Push notifications for review replies",
      key: "reviewReplies",
      category: "Engagement",
    },
    {
      title: "Reply to your comments",
      description: "Get notified when someone replies to your comments",
      key: "replyToYourReply",
      category: "Engagement",
    },
    {
      title: "Review thread activity",
      description: "Get notified when someone replies to your review",
      key: "reviewThreadActivity",
      category: "Engagement",
    },
    {
      title: "Review Likes",
      description: "Push notifications for review likes",
      key: "reviewLikes",
      category: "Engagement",
    },
    {
      title: "New Reviews on Favourites",
      description: "Push notifications for new reviews on favorite places",
      key: "newReviewsOnFavourites",
      category: "Engagement",
    },
    {
      title: "Nearby places",
      description: "Get notified about new dog-friendly places near you",
      key: "nearbyPlaces",
      category: "Discovery",
    },
  ];

  // Group settings by category
  const groupByCategory = <T extends { category: string }>(settings: T[]) => {
    return settings.reduce(
      (acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  };

  const emailGrouped = $derived(groupByCategory(emailSettings));
  const pushGrouped = $derived(groupByCategory(pushSettings));
</script>

<div class="max-w-3xl">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="mb-2 text-2xl font-bold">Notification Settings</h1>
      <p class="text-muted-foreground text-sm">
        Manage how you receive notifications from Woofs Welcome
      </p>
    </div>
    <Button
      variant="outline"
      onclick={handleReset}
      disabled={resetPreferences.isPending}
    >
      {#if resetPreferences.isPending}
        <LoaderCircle class="text-primary mr-2 size-4 animate-spin" />
      {/if}
      Reset to Defaults
    </Button>
  </div>

  <Separator class="mb-6" />

  {#if notificationPreferences.isLoading}
    <div class="flex items-center justify-center py-12">
      <Spinner />
    </div>
  {:else if notificationPreferences.isError}
    <div
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      Failed to load notification preferences. Please try again.
    </div>
  {:else if notificationPreferences.data}
    <!-- Email Notifications -->
    <div class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">Email Notifications</h2>
      {#each Object.entries(emailGrouped) as [category, settings]}
        <div class="mb-6">
          <h3 class="mb-3 text-sm font-medium text-gray-500">{category}</h3>
          <div class="space-y-4">
            {#each settings as setting}
              <div
                class="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0"
              >
                <div class="max-w-2xl space-y-1">
                  <h4 class="text-sm font-medium text-gray-900">
                    {setting.title}
                  </h4>
                  <p class="text-muted-foreground text-xs">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.data.email[
                    setting.key as keyof typeof notificationPreferences.data.email
                  ]}
                  onCheckedChange={(checked) =>
                    handleToggle("email", setting.key, checked)}
                  disabled={updatePreferences.isPending}
                />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <Separator class="mb-8" />

    <!-- Push Notifications -->
    <div class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">Push Notifications</h2>

      {#each Object.entries(pushGrouped) as [category, settings]}
        <div class="mb-6">
          <h3 class="mb-3 text-sm font-medium text-gray-500">{category}</h3>
          <div class="space-y-4">
            {#each settings as setting}
              <div
                class="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0"
              >
                <div class="max-w-2xl space-y-1">
                  <h4 class="text-sm font-medium text-gray-900">
                    {setting.title}
                  </h4>
                  <p class="text-muted-foreground text-xs">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.data.push[
                    setting.key as keyof typeof notificationPreferences.data.push
                  ]}
                  onCheckedChange={(checked) =>
                    handleToggle("push", setting.key, checked)}
                  disabled={updatePreferences.isPending}
                />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
