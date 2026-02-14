<script lang="ts">
  import { Star } from "@lucide/svelte";

  interface Props {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
  }

  const { rating, onRatingChange, size = "md", disabled = false }: Props = $props();

  let hoverRating = $state<number | null>(null);

  const sizeClasses = {
    sm: "size-5",
    md: "size-8",
    lg: "size-10",
  };

  const displayRating = $derived(hoverRating ?? rating);

  const handleClick = (star: number) => {
    if (!disabled) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!disabled) {
      hoverRating = star;
    }
  };

  const handleMouseLeave = () => {
    hoverRating = null;
  };
</script>

<div
  class="flex gap-1"
  role="radiogroup"
  aria-label="Rating"
  onmouseleave={handleMouseLeave}
>
  {#each [1, 2, 3, 4, 5] as star}
    <button
      type="button"
      role="radio"
      aria-checked={rating === star}
      aria-label="{star} star{star !== 1 ? 's' : ''}"
      {disabled}
      class="cursor-pointer transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      onclick={() => handleClick(star)}
      onmouseenter={() => handleMouseEnter(star)}
    >
      <Star
        class="{sizeClasses[size]} {star <= displayRating
          ? 'fill-yellow-400 text-yellow-400'
          : 'text-gray-300'} transition-colors"
      />
    </button>
  {/each}
</div>
