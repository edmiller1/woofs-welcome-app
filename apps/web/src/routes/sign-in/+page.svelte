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

<main class="flex flex-col lg:flex-row h-screen overflow-hidden w-full">
  <!-- Left side -->
  <div
    class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface-bright relative overflow-hidden"
  >
    <header
      class="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-center bg-transparent"
    >
      <a href="/" class="text-3xl text-primary font-semibold">Woofs Welcome</a>
    </header>
    <div class="w-full max-w-110 mt-40 sm:mt-12">
      <div class="mb-10 text-left">
        <h1
          class="text-4xl md:text-5xl font-bold text-primary mb-3 leading-tight tracking-tight"
        >
          Welcome Back
        </h1>
        <p class="text-muted-foreground text-lg leading-relaxed">
          Sign in or create an account.
        </p>
      </div>
      <!-- Form -->
      <SignInForm {redirectTo} />
    </div>
  </div>
  <div class="hidden lg:block lg:w-1/2 relative">
    <img src={fluffs} alt="dogs" class="w-full h-full object-cover" />
  </div>
</main>
