<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";
  import { buttonVariants } from "./ui/button";
  import { LoaderCircle } from "@lucide/svelte";

  interface Props {
    open: boolean;
    reviewId: string;
  }

  let { open = $bindable(), reviewId }: Props = $props();

  const queryClient = useQueryClient();

  const deleteReview = createMutation(() => ({
    mutationFn: (reviewId: string) => api.review.deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted!");
      confirmCancel();
      queryClient.invalidateQueries({ queryKey: ["profileReviews"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete review");
    },
  }));

  const confirmCancel = () => {
    open = false;
  };
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Review</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete this review? Any images associated with
        it will also be deleted. This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel
        disabled={deleteReview.isPending}
        onclick={confirmCancel}
      >
        Cancel
      </AlertDialog.Cancel>
      <AlertDialog.Action
        class={cn(buttonVariants({ variant: "destructive" }))}
        onclick={() => deleteReview.mutate(reviewId)}
        disabled={deleteReview.isPending}
      >
        {#if deleteReview.isPending}
          <LoaderCircle class="size-4 animate-spin" />
          Deleting...
        {:else}
          Delete
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
