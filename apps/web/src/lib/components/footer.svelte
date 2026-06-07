<script lang="ts">
  import {
    Facebook01Icon,
    InstagramIcon,
    Linkedin01Icon,
    NewTwitterRectangleIcon,
    TiktokIcon,
  } from "@hugeicons/core-free-icons";
  import { HugeiconsIcon } from "@hugeicons/svelte";
  import { Send, Share2 } from "@lucide/svelte";
</script>

<footer class="bg-white py-20 mb-10 md:mb-0">
  <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
    <div class="md:col-span-4 space-y-6">
      <span class="font-headline font-bold text-primary text-3xl"
        >Woofs Welcome</span
      >
      <p class="mt-10 text-xl font-body text-text-subtle leading-relaxed">
        Connect with us
      </p>
      <div class="flex gap-2">
        <a
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:scale-110 transition-transform"
          href="#"
        >
          <HugeiconsIcon icon={InstagramIcon} class="size-5 text-white" />
        </a>
        <a
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-110 transition-transform"
          href="#"
        >
          <HugeiconsIcon icon={TiktokIcon} class="size-5 text-white" />
        </a>
        <a
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-110 transition-transform"
          href="#"
        >
          <HugeiconsIcon icon={Facebook01Icon} class="size-5 text-white" />
        </a>
        <a
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-110 transition-transform"
          href="#"
        >
          <HugeiconsIcon
            icon={NewTwitterRectangleIcon}
            class="size-5 text-white"
          />
        </a>
        <a
          class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-110 transition-transform"
          href="#"
        >
          <HugeiconsIcon icon={Linkedin01Icon} class="size-5 text-white" />
        </a>
      </div>
    </div>
    <div class="md:col-span-2 space-y-4">
      <h4
        class="font-label text-xs uppercase font-bold tracking-widest text-primary"
      >
        Explore
      </h4>
      <ul class="space-y-2 text-text-subtle text-sm font-medium">
        <li>
          <a class="hover:text-primary transition-colors" href="#">Countries</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#">Regions</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#">Cities</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#"
            >Place types</a
          >
        </li>
      </ul>
    </div>
    <div class="md:col-span-2 space-y-4">
      <h4
        class="font-label text-xs uppercase font-bold tracking-widest text-primary"
      >
        Discover
      </h4>
      <ul class="space-y-2 text-text-subtle text-sm font-medium">
        <li>
          <a class="hover:text-primary transition-colors" href="#"
            >Destinations</a
          >
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#">Stays</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#">Eats</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="#">Adventures</a
          >
        </li>
      </ul>
    </div>
    <div class="md:col-span-2 space-y-4">
      <h4
        class="font-label text-xs uppercase font-bold tracking-widest text-primary"
      >
        Company
      </h4>
      <ul class="space-y-2 text-text-subtle text-sm font-medium">
        <li>
          <a class="hover:text-primary transition-colors" href="#">About</a>
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="/contact"
            >Contact</a
          >
        </li>
        <li>
          <a class="hover:text-primary transition-colors" href="/advertise"
            >Advertise</a
          >
        </li>
      </ul>
    </div>
    <div class="md:col-span-4 space-y-4">
      <select
        class="w-full flex bg-surface rounded-xl overflow-hidden p-2 border border-border-subtle/30"
      >
        <option>English (US)</option>
        <option>English (UK)</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
        <option>Chinese</option>
      </select>
    </div>
  </div>
  <div
    class="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-border-subtle/20 flex flex-col md:flex-row justify-between items-center gap-4"
  >
    <span
      class="text-text-subtle/60 text-xs font-label uppercase tracking-widest"
      >© 2026 Woofs Welcome. All Rights Reserved.</span
    >
    <div
      class="flex gap-8 text-text-subtle/60 text-xs font-label uppercase tracking-widest"
    >
      <a class="hover:text-primary" href="/privacy-policy">Privacy Policy</a>
      <a class="hover:text-primary" href="/terms-of-service">Terms of Service</a
      >
    </div>
  </div>
</footer>
