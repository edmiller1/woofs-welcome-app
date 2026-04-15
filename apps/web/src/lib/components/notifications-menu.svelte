<script lang="ts">
  import { notification } from "./../../../../../packages/api/src/api/notification/index.ts";
  import { format, formatDistanceToNow } from "date-fns";
  import { api } from "$lib/api-helper";
  import { createQuery, QueryClient } from "@tanstack/svelte-query";
  import type { BAUser } from "@woofs/types";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import {
    Bell,
    Bookmark,
    Building2,
    CircleCheck,
    CircleX,
    Flag,
    LoaderCircle,
    Mails,
    Pencil,
    Presentation,
    Reply,
    Send,
    ThumbsUp,
  } from "@lucide/svelte";
  const queryClient = new QueryClient();

  const notifications = createQuery(() => ({
    queryKey: ["notifications"],
    queryFn: async () => api.notification.getUserNotifications(),
  }));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "review_reply":
        return Reply;
      case "review_like":
        return ThumbsUp;
      case "new_review_on_favourites":
        return Bookmark;
      case "place_update":
        return Pencil;
      case "claim_submitted":
        return Send;
      case "claim_approved":
        return CircleCheck;
      case "claim_rejected":
        return CircleX;
      case "report_status":
        return Flag;
      case "marketing":
        return Presentation;
      case "newsletter":
        return Mails;
      case "nearby_places":
        return Building2;
      default:
        return Bell;
    }
  };
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class="cursor-pointer p-2 text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
      >
        <Bell />
      </button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-96 p-0" align="end">
    <div
      class="flex justify-between items-center px-5 py-4 border-b border-surface-container"
    >
      <h3 class="text-xl font-headline font-semibold text-primary">
        Notifications
      </h3>
      <button
        class="cursor-pointer text-xs font-label font-bold text-secondary uppercase tracking-widest hover:underline"
        >Mark all as read</button
      >
    </div>
    {#if notifications.isLoading}
      <div class="p-5 text-center text-sm text-secondary">
        <LoaderCircle class="size-4 animate-spin" />
      </div>
    {:else if notifications.data?.length === 0}
      <div class="p-5 text-center text-sm text-secondary">
        No notifications yet.
      </div>
    {:else}
      <div class="max-h-100 overflow-y-auto">
        {#each notifications.data as notification}
          {@const Icon = getNotificationIcon(notification.type)}
          <div
            class="p-5 flex gap-4 cursor-pointer border-b border-surface-container/50 {!notification.isRead
              ? 'bg-secondary-container/20 hover:bg-secondary-container/30 transition-colors'
              : ''}"
          >
            <div
              class="size-12 rounded-full bg-[#eee7e5] flex items-center justify-center text-primary shrink-0"
            >
              <Icon />
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-start mb-1">
                <p class="text-sm font-label font-bold text-on-surface">
                  {notification.title}
                </p>
              </div>
              <p
                class="text-[13px] leading-relaxed text-on-surface-variant font-body"
              >
                {notification.message}
              </p>
              <span
                class="text-[10px] font-label text-secondary uppercase tracking-tighter"
                >{formatDistanceToNow(notification.createdAt, {
                  addSuffix: true,
                })}</span
              >
            </div>
            {#if !notification.isRead}
              <div
                class="w-2 h-2 bg-primary rounded-full mt-2 self-start shrink-0"
              ></div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
