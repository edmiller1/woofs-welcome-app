<script lang="ts">
  import { api } from "$lib/api-helper";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Spinner } from "$lib/components/ui/spinner";
  import { Switch } from "$lib/components/ui/switch";
  import { Button } from "$lib/components/ui/button";
  import { CircleAlert, LoaderCircle } from "@lucide/svelte";
  import { Separator } from "$lib/components/ui/separator";
  import type {
    ProfileSettings,
    UpdateProfileSettingsInput,
  } from "@woofs/types";
  import { Label } from "$lib/components/ui/label";
  import * as Alert from "$lib/components/ui/alert/index.js";

  interface Props {
    open: boolean;
    userId: string;
  }

  let { open = $bindable(), userId }: Props = $props();

  const queryClient = useQueryClient();

  const profile = createQuery(() => ({
    queryKey: ["profile", userId],
    queryFn: () => api.profile.getProfile(userId),
  }));

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

  let currentTab = $state<"Account" | "Notifications">("Account");

  const handleNotificationToggle = (
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

  const updateSettings = createMutation(() => ({
    mutationFn: async (data: UpdateProfileSettingsInput) =>
      api.profile.updateProfileSettings(data),
    onSuccess: () => {
      toast.success("Profile settings updated!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(
        `Failed to update profile settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  }));

  let showAbout = $derived(profile.data?.userSettings?.showAbout);
  let showDogs = $derived(profile.data?.userSettings?.showDogs);
  let showCheckIns = $derived(profile.data?.userSettings?.showCheckIns);
  let showReviews = $derived(profile.data?.userSettings?.showReviews);
  let showCollections = $derived(profile.data?.userSettings?.showCollections);

  const handleSettingsToggle = (key: string, value: boolean) => {
    updateSettings.mutate({
      [key]: value,
    });
  };

  $effect(() => {
    if (open) {
      showAbout = profile.data?.userSettings?.showAbout;
      showDogs = profile.data?.userSettings?.showDogs;
      showCheckIns = profile.data?.userSettings?.showCheckIns;
      showReviews = profile.data?.userSettings?.showReviews;
      showCollections = profile.data?.userSettings?.showCollections;
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    showCloseButton={false}
    class="max-h-[60vh] overflow-y-auto sm:max-w-2xl p-0 m-0"
  >
    <Dialog.Header class="sticky top-0 z-20 bg-background p-4">
      <Dialog.Title>Account Settings</Dialog.Title>
      <Dialog.Description>
        {currentTab === "Account"
          ? "Update your privacy settings. Control what other people can see on your profile."
          : ""}
        {currentTab === "Notifications"
          ? "Manage your notification preferences"
          : ""}
      </Dialog.Description>
    </Dialog.Header>
    <Tabs.Root bind:value={currentTab} class="flex items-center justify-center">
      <Tabs.List>
        <Tabs.Trigger value="Account" class="cursor-pointer"
          >Account</Tabs.Trigger
        >
        <Tabs.Trigger value="Notifications" class="cursor-pointer"
          >Notifications</Tabs.Trigger
        >
      </Tabs.List>
      <Separator />
      <Tabs.Content value="Account" class="w-full p-4">
        <div>
          <h3 class="mb-4 text-lg font-medium">Privacy Settings</h3>
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between pt-2">
              <div>
                <Label for="show-about">Show About</Label>
                <p class="text-muted-foreground text-xs">
                  Control the privacy of your about section.
                </p>
              </div>
              <Switch
                id="show-about"
                checked={showAbout}
                onCheckedChange={(checked) =>
                  handleSettingsToggle("showAbout", checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label for="show-dogs">Show Dogs</Label>
                <p class="text-muted-foreground text-xs">
                  Control the privacy of your dogs.
                </p>
              </div>
              <Switch
                id="show-dogs"
                checked={showDogs}
                onCheckedChange={(checked) =>
                  handleSettingsToggle("showDogs", checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label for="show-checkins">Show Check-ins</Label>
                <p class="text-muted-foreground text-xs">
                  Control the privacy of your check-ins.
                </p>
              </div>
              <Switch
                id="show-checkins"
                checked={showCheckIns}
                onCheckedChange={(checked) =>
                  handleSettingsToggle("showCheckIns", checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <Separator />

            <div class="flex items-center justify-between">
              <div>
                <Label for="show-reviews">Show Reviews</Label>
                <p class="text-muted-foreground text-xs">
                  Control the privacy of your reviews.
                </p>
              </div>
              <Switch
                id="show-reviews"
                checked={showReviews}
                onCheckedChange={(checked) =>
                  handleSettingsToggle("showReviews", checked)}
                disabled={updatePreferences.isPending}
              />
            </div>

            <Separator />

            <div class="flex items-center justify-between pb-4">
              <div>
                <Label for="show-collections">Show Collections</Label>
                <p class="text-muted-foreground text-xs">
                  Control the privacy of your collections.
                </p>
              </div>
              <Switch
                id="show-collections"
                checked={showCollections}
                onCheckedChange={(checked) =>
                  handleSettingsToggle("showCollections", checked)}
                disabled={updatePreferences.isPending}
              />
            </div>
          </div>
          <Separator />
          <!-- TODO: Delete Account -->
          <div class="spacey-4 my-4">
            <h3 class="text-lg font-medium">Delete Account</h3>
            <Alert.Root variant="destructive" class="my-4">
              <CircleAlert />
              <Alert.Title>Permanently delete your account.</Alert.Title>
              <Alert.Description
                >This action is not reversible. Proceed with caution.</Alert.Description
              >
            </Alert.Root>
            <Button variant="destructive">Delete account</Button>
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value="Notifications" class="w-full p-4">
        <div>
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
              <div class="flex items-center justify-between">
                <h2 class="mb-4 text-lg font-semibold">Email Notifications</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onclick={handleReset}
                  disabled={resetPreferences.isPending}
                >
                  {#if resetPreferences.isPending}
                    <LoaderCircle
                      class="text-primary mr-2 size-4 animate-spin"
                    />
                  {/if}
                  Reset to Defaults
                </Button>
              </div>

              {#each Object.entries(emailGrouped) as [category, settings]}
                <div class="mb-6">
                  <h3 class="mb-3 text-sm font-medium text-gray-500">
                    {category}
                  </h3>
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
                            handleNotificationToggle(
                              "email",
                              setting.key,
                              checked,
                            )}
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
                  <h3 class="mb-3 text-sm font-medium text-gray-500">
                    {category}
                  </h3>
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
                            handleNotificationToggle(
                              "push",
                              setting.key,
                              checked,
                            )}
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
      </Tabs.Content>
    </Tabs.Root>
  </Dialog.Content>
</Dialog.Root>
