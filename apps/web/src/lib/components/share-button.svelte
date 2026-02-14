<script lang="ts">
  import { Copy, Mail, Share } from "@lucide/svelte";
  import { Button } from "./ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { toast } from "svelte-sonner";

  interface Props {
    url: string;
    name: string;
  }

  const { url, name }: Props = $props();

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
    <Button variant="ghost" class="hidden md:flex underline">
      Share <Share class="size-3" />
    </Button>
    <Button variant="outline" class="md:hidden">
      <Share class="size-3" />
    </Button>
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
