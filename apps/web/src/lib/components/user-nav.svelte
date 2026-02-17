<script lang="ts">
  import { auth } from "$lib/auth/stores";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar";
  import { cn } from "$lib/utils";
  import {
    CircleUser,
    Cog,
    LogOut,
    SquareUserRound,
    Users,
  } from "@lucide/svelte";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "./ui/dropdown-menu";
  import type { BAUser } from "@woofs/types";
  import { getUserInitials } from "$lib/helpers";
  import { buildImageUrl } from "@woofs/image-config";

  interface Props {
    user: BAUser;
    className?: string;
  }

  const { user, className }: Props = $props();

  const userImage = $derived(
    user && user.image
      ? user.image
      : buildImageUrl(user?.profileImageId ?? "", "thumbnail"),
  );
</script>

<DropdownMenu>
  <DropdownMenuTrigger class={cn("cursor-pointer", className)}>
    <Avatar class="ml-auto">
      <AvatarImage
        src={userImage}
        alt={user.name}
        referrerpolicy="no-referrer"
        class="object-cover object-center"
      />
      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" class="mt-2">
    <a href="/account">
      <DropdownMenuItem
        ><CircleUser class="text-foreground" /> Account</DropdownMenuItem
      >
    </a>
    <a href="/profile">
      <DropdownMenuItem
        ><SquareUserRound class="text-foreground" /> Profile</DropdownMenuItem
      >
    </a>
    <a href="/account/settings">
      <DropdownMenuItem
        ><Cog class="text-foreground" />Settings</DropdownMenuItem
      >
    </a>
    <DropdownMenuItem onclick={() => auth.signOut()}>
      <LogOut class="text-foreground" />Sign out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
