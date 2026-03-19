<script lang="ts">
  import { ThumbsUp, LoaderCircle } from "@lucide/svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { api } from "$lib/api-helper";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  interface Props {
    reviewId: string;
    hasLiked: boolean;
    likesCount: number;
    placeId: string;
    currentPage: number;
    limit: number;
  }

  const { reviewId, hasLiked, likesCount, placeId, currentPage, limit }: Props =
    $props();

  const queryClient = useQueryClient();

  const likeReview = createMutation(() => ({
    mutationFn: () => api.review.likeReview(reviewId),
    onSuccess: () => {
      if (hasLiked) {
        toast.success("Review unliked!");
      } else {
        toast.success("Review liked!");
      }
      queryClient.invalidateQueries({
        queryKey: ["place-reviews", placeId, currentPage, limit],
      });
    },
  }));

  const handleSubmit = () => {
    likeReview.mutate();
  };
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Button
      disabled={likeReview.isPending}
      variant="outline"
      class="rounded-full p-1"
      onclick={handleSubmit}
    >
      {#if likeReview.isPending}
        <LoaderCircle class="size-4 animate-spin" />
      {:else}
        <ThumbsUp
          class={cn(
            "h-4 w-4",
            hasLiked
              ? "fill-secondary text-secondary"
              : "text-muted-foreground",
          )}
        />
        {#if likesCount > 0}
          <span class="text-xs">{likesCount}</span>
        {/if}
      {/if}
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>
      {hasLiked ? "Unlike this review" : "This review is helpful"}
    </p>
  </Tooltip.Content>
</Tooltip.Root>
