<script lang="ts">
  import { Copy, Mail, Share } from "@lucide/svelte";
  import { Button } from "./ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { toast } from "svelte-sonner";

  import type { Snippet } from "svelte";

  interface Props {
    url: string;
    name: string;
    trigger?: Snippet;
  }

  const { url, name, trigger }: Props = $props();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out ${name} on Woofs Welcome`);
    const body = encodeURIComponent(
      `Check out ${name} on Woofs Welcome: ${url}`,
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#if trigger}
      {@render trigger()}
    {:else}
      <Button variant="secondary" class="hidden md:flex">
        Share <Share class="size-4" />
      </Button>
      <Button variant="secondary" class="md:hidden">
        <Share class="size-4" />
      </Button>
    {/if}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="z-999 mr-20">
    <DropdownMenu.Group>
      <DropdownMenu.Item onclick={shareViaEmail}
        ><Mail />Email</DropdownMenu.Item
      >
      <DropdownMenu.Item onclick={copyToClipboard}
        ><Copy /> Copy Link</DropdownMenu.Item
      >
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
