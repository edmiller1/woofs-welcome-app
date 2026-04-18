<script lang="ts">
  import { getCurrentDayStatus, orderHoursByDay } from "$lib/helpers";
  import type { Hours } from "@woofs/types";

  interface Props {
    hours: Hours | null;
  }

  const { hours }: Props = $props();
</script>

{#if hours}
  <div
    class="bg-surface-container-lowest border border-border-subtle/10 rounded-2xl p-6 shadow-sm"
  >
    <div class="flex justify-between items-center mb-6">
      <h4 class="text-xl font-headline font-bold">Opening Hours</h4>
      {#if getCurrentDayStatus(hours)}
        {@const status = getCurrentDayStatus(hours)}
        {#if status?.includes("Open till")}
          <div
            class="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/20"
          >
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span
              class="text-[10px] font-bold font-body text-primary uppercase tracking-wider"
              >{status}</span
            >
          </div>
        {:else if status?.includes("Opens at")}
          <div
            class="flex items-center gap-2 px-3 py-1 rounded-full border bg-amber-50 border-amber-200"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500 pulse-dot"></span>
            <div class="flex flex-col">
              <span
                class="text-[10px] font-bold font-body text-amber-700 uppercase tracking-wider leading-tight"
                >Opening Soon</span
              >
              <span
                class="text-[9px] font-medium font-body text-amber-600/80 leading-tight"
                >{status}</span
              >
            </div>
          </div>
        {:else if status?.includes("Closed")}
          <div
            class="flex items-center gap-2 px-3 py-1 rounded-full border bg-error/10 border-error/20"
          >
            <span class="w-2 h-2 rounded-full bg-error/60"></span>
            <span
              class="text-[10px] font-bold font-body uppercase tracking-wider text-error"
              >{status}</span
            >
          </div>
        {/if}
      {/if}
    </div>
    <div class="space-y-1 font-body text-sm">
      {#each orderHoursByDay(hours) as day}
        {@const isToday =
          day.day ===
          new Date().toLocaleDateString("en-AU", { weekday: "long" })}
        <div
          class="flex justify-between p-2 rounded-lg {isToday
            ? 'bg-secondary-container/60 font-bold border border-secondary-container/20'
            : ''}"
        >
          <span class="text-text-subtle">{day.day}</span>
          <span class="text-text font-medium">{day.hours}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}
