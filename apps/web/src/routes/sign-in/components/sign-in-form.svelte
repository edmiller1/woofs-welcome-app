<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth } from "$lib/auth/stores";
  import AppleLogo from "$lib/components/apple-logo.svelte";
  import GoogleLogo from "$lib/components/google-logo.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { ArrowRight, LoaderCircle } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    redirectTo: string;
  }

  const { redirectTo }: Props = $props();

  let email = $state<string>("");
  let loading = $state<boolean>(false);
  let googleLoading = $state<boolean>(false);
  let appleLoading = $state<boolean>(false);

  const handleGoogleLogin = async () => {
    console.log("Google login initiated");
    try {
      googleLoading = true;
      await auth.oAuthSignIn("google", redirectTo);
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google");
      googleLoading = false;
    }
  };

  const handleAppleLogin = async () => {
    console.log("Apple login initiated");
    try {
      appleLoading = true;
      await auth.oAuthSignIn("apple", redirectTo);
    } catch (error) {
      console.error("Apple login error:", error);
      toast.error("Failed to sign in with Apple");
      appleLoading = false;
    }
  };

  const handleEmailSignIn = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      loading = true;

      //Send OTP
      const result = await auth.signIn(email.trim());

      if (result.error) {
        toast.error(result.error.message || "Failed to send verification code");
        return;
      }

      // Success - redirect to verification page
      toast.success("Verification code sent to your email!");

      const params = new URLSearchParams({
        email: email,
        type: "sign-in",
      });

      if (redirectTo && redirectTo !== "/") {
        params.set("redirect", redirectTo);
      }

      goto(`/verify-otp?${params.toString()}`);
    } catch (error) {
      console.error("Email sign-in error:", error);
      toast.error("Failed to send verification code");
    } finally {
      loading = false;
    }
  };
</script>

<form onsubmit={(e) => handleEmailSignIn(e)} class="space-y-6">
  <div class="space-y-2">
    <label
      class="block text-sm font-bold text-text-subtle uppercase tracking-widest ml-1"
      for="email"
    >
      Email Address
    </label>
    <div class="relative group">
      <Input
        class="w-full h-14 px-6 rounded-full bg-surface-raised border-none focus:ring-2 focus:ring-primary-container transition-all text-text placeholder:text-border-strong"
        id="email"
        placeholder="explorer@woofswelcome.app"
        type="email"
        bind:value={email}
        required
      />
    </div>
  </div>

  <Button
    variant="default"
    class="rounded-full w-full h-14 text-base font-bold disabled:cursor-not-allowed"
    disabled={loading || googleLoading}
    type="submit"
  >
    {#if loading}
      <LoaderCircle class="size-5 animate-spin text-white" stroke-width={5} />
      Signing in...
    {:else}
      Send Verification Code <ArrowRight class="size-5" />
    {/if}</Button
  >
</form>

<div class="flex items-center my-10 gap-4">
  <div class="h-px flex-1 bg-surface-top"></div>
  <span class="text-xs font-bold text-border-strong uppercase tracking-widest"
    >or continue with</span
  >
  <div class="h-px flex-1 bg-surface-top"></div>
</div>

<!-- Social Logins -->
<div class="grid grid-cols-1 gap-4">
  <Button
    variant="outline"
    class="h-14 bg-surface-subtle hover:bg-surface-raised font-bold text-base rounded-full"
    onclick={handleGoogleLogin}
    disabled={loading || googleLoading}
  >
    {#if googleLoading}
      <LoaderCircle class="size-5 animate-spin" stroke-width={5} />
      Connecting to Google...
    {:else}
      <GoogleLogo />
      Continue With Google
    {/if}</Button
  >
  <Button
    variant="outline"
    class="h-14 bg-text hover:opacity-90 hover:text-white font-bold text-base text-white hover:bg-text rounded-full"
    onclick={handleAppleLogin}
    disabled={loading || appleLoading}
  >
    {#if appleLoading}
      <LoaderCircle class="size-5 animate-spin" stroke-width={5} />
      Connecting to Apple...
    {:else}
      <AppleLogo />
      Continue With Apple
    {/if}</Button
  >
</div>

<p
  class="mt-10 text-center lg:text-left text-sm text-text-subtle font-medium"
>
  Have a business?
  <a
    class="text-primary font-bold hover:underline underline-offset-4"
    href="/business">Create a business account</a
  >
</p>
<div class="mt-12 flex flex-wrap gap-x-6 gap-y-2 opacity-60">
  <a
    class="text-[10px] font-bold text-secondary hover:text-primary uppercase tracking-widest transition-colors"
    href="/terms-of-service">Terms of Service</a
  >
  <a
    class="text-[10px] font-bold text-secondary hover:text-primary uppercase tracking-widest transition-colors"
    href="/privacy-policy">Privacy Policy</a
  >
  <p
    class="text-[10px] font-bold text-border-subtle uppercase tracking-[0.2em]"
  >
    © 2026 Woofs Welcome
  </p>
</div>

<!-- <Card class="w-full max-w-lg">
  <CardContent>
    <form onsubmit={(e) => handleEmailSignIn(e)} class="flex flex-col gap-6">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="text-2xl font-bold">Sign in to your account</h1>
        <p class="text-muted-foreground text-balance text-sm">
          Enter your email below to sign in to your account
        </p>
      </div>
      <div class="grid gap-6">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            bind:value={email}
            required
          />
        </div>
        <Button
          type="submit"
          class="w-full"
          disabled={loading || googleLoading}
        >
          {#if loading}
            <LoaderCircle class="size-3 animate-spin" stroke-width={3} />
            Signing in...
          {:else}
            Sign in
          {/if}
        </Button>
      </div>
    </form>
    <div class="space-y-4">
      <div
        class="after:border-border relative mt-3 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
      >
        <span class="bg-card text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>
      <Button
        variant="outline"
        class="w-full"
        onclick={handleGoogleLogin}
        disabled={loading || googleLoading}
      >
        {#if googleLoading}
          <LoaderCircle class="size-3 animate-spin" stroke-width={3} />
          Connecting to Google...
        {:else}
          <GoogleLogo />
          Sign in with Google
        {/if}
      </Button>
    </div>
  </CardContent>
</Card> -->
