<script lang="ts">
  import { page } from "$app/state";
  import fluffs from "$lib/assets/fluffs.jpg";
  import { Dog } from "@lucide/svelte";
  import SignInForm from "./components/sign-in-form.svelte";

  const redirectTo = $derived(page.url.searchParams.get("redirect") || "/");
</script>

<svelte:head>
  <title>Sign in</title>
  <meta name="description" content="Sign in to your account." />
</svelte:head>

<main class="flex flex-col lg:flex-row h-full w-full">
  <!-- Left side -->
  <div
    class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface-bright relative overflow-y-auto h-full"
  >
    <header
      class="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center bg-transparent"
    >
      <div class="text-3xl font-serif italic text-primary font-semibold">
        Woofs Welcome
      </div>
    </header>
    <div class="w-full max-w-110 mt-12">
      <div class="mb-10 text-left">
        <h1
          class="font-headline text-4xl md:text-5xl font-bold text-primary mb-3 leading-tight tracking-tight"
        >
          Welcome Back
        </h1>
        <p class="text-secondary text-lg font-body leading-relaxed">
          Sign in or create your account.
        </p>
      </div>
      <!-- Form -->
      <SignInForm {redirectTo} />
    </div>
  </div>
  <div class="hidden lg:block lg:w-1/2 h-full relative">
    <img src={fluffs} alt="dogs" class="w-full h-full object-cover" />
  </div>
</main>
