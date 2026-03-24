<script lang="ts">
  import { Send } from "@lucide/svelte";
  import { Button } from "./ui/button";
</script>

<footer class="bg-[#f6f3ef] mt-24 py-12 border-t border-outline-variant/20">
  <div
    class="grid grid-cols-1 md:grid-cols-3 gap-8 px-16 max-w-screen-2xl mx-auto"
  >
    <div class="flex flex-col gap-4">
      <span class="font-headline text-xl font-bold text-primary"
        >Woofs Welcome</span
      >
      <p class="font-body text-sm text-stone-600">© 2026 Woofs Welcome.</p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-2">
        <span class="text-[#154212] font-semibold mb-2 font-body"
          >Resources</span
        >
        <a
          class="text-stone-500 hover:underline transition-all font-body text-sm"
          href="/">About Us</a
        >
        <a
          class="text-stone-500 hover:underline transition-all font-body text-sm"
          href="/">Safety Guidelines</a
        >
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-[#154212] font-semibold mb-2 font-body">Legal</span>
        <a
          class="text-stone-500 hover:underline transition-all font-body text-sm"
          href="/">Privacy Policy</a
        >
        <a
          class="text-stone-500 hover:underline transition-all font-body text-sm"
          href="/">Contact</a
        >
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <span class="text-[#154212] font-semibold font-body"
        >Join the Newsletter</span
      >
      <div class="flex shadow-sm rounded-lg overflow-hidden">
        <input
          class="bg-white border-none p-3 w-full focus:ring-1 focus:ring-primary text-sm font-body"
          placeholder="Email address"
          type="email"
        />
        <button
          class="cursor-pointer bg-primary text-white px-4 hover:bg-primary/90 transition-colors"
        >
          <Send class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</footer>
