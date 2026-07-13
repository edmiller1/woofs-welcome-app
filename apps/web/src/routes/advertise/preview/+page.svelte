<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { api } from "$lib/api-helper";
  import { ExternalLink, Star, Upload, X } from "@lucide/svelte";

  const { data } = $props();
  const { user } = $derived(data);

  let previewName = $state("");
  let previewTagline = $state("");
  let previewUrl = $state("");
  let previewEmail = $state("");
  let previewImageUrl = $state<string | null>(null);
  let previewImageInput = $state<HTMLInputElement | null>(null);
  let previewSubmitted = $state(false);

  function handleImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImageUrl = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    previewImageUrl = null;
    if (previewImageInput) previewImageInput.value = "";
  }

  const previewDisplayName = $derived(previewName.trim() || "Your Business Name");
  const previewDisplayTagline = $derived(previewTagline.trim() || "Your dog-friendly tagline here");
  const previewDisplayUrl = $derived(previewUrl.trim() || "yourwebsite.co.nz");

  async function handlePreviewSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!previewName.trim() || !previewEmail.trim()) return;
    await api.contact.sendMessage({
      name: previewName,
      email: previewEmail,
      subject: "partnership",
      message: `Ad preview request\n\nBusiness: ${previewName}\nWebsite: ${previewUrl}\nTagline: ${previewTagline}`,
    }).catch(() => {});
    previewSubmitted = true;
  }
</script>

<svelte:head>
  <title>Create a Free Ad Preview | Woofs Welcome</title>
  <meta
    name="description"
    content="See exactly what your ad looks like on Woofs Welcome before committing. Upload your image and get a live preview across every placement."
  />
</svelte:head>

<HomeNavbar {user} />
<main class="min-h-screen bg-background">
  <div class="max-w-7xl mx-auto px-4 py-6 sm:py-12">
    <Breadcrumb.Root class="mt-10 mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/advertise">Advertise</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Free Preview</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <div class="max-w-3xl mb-12">
      <h1 class="text-4xl sm:text-5xl font-bold mb-4 leading-tight">Create a free preview</h1>
      <p class="text-lg text-muted-foreground">
        Fill in your details and see exactly what your ad will look like across every placement on Woofs Welcome — no payment required.
      </p>
    </div>

    {#if previewSubmitted}
      <div class="rounded-2xl border border-border bg-muted/40 p-10 text-center max-w-lg">
        <p class="text-2xl font-bold mb-2">Request sent!</p>
        <p class="text-muted-foreground mb-6">
          Thanks — we'll be in touch at <span class="font-medium text-foreground">{previewEmail}</span> shortly.
        </p>
        <div class="flex gap-3 justify-center">
          <button
            class={cn(buttonVariants({ variant: "outline" }))}
            onclick={() => { previewSubmitted = false; }}
          >
            Start over
          </button>
          <a href="/advertise" class={cn(buttonVariants({ variant: "default" }))}>
            Back to Advertise
          </a>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <!-- Form -->
        <form class="space-y-6" onsubmit={handlePreviewSubmit}>
          <!-- Image upload -->
          <div>
            <p class="text-sm font-bold mb-2">
              Ad image <span class="text-muted-foreground font-normal">(optional)</span>
            </p>
            {#if previewImageUrl}
              <div class="relative w-full aspect-[3] rounded-xl overflow-hidden border border-border">
                <img src={previewImageUrl} alt="Ad preview" class="w-full h-full object-cover" />
                <button
                  type="button"
                  onclick={clearImage}
                  class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                  aria-label="Remove image"
                >
                  <X class="size-3.5" />
                </button>
              </div>
            {:else}
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <label
                class="flex flex-col items-center justify-center w-full aspect-[3] rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors"
                onclick={() => previewImageInput?.click()}
              >
                <Upload class="size-6 text-muted-foreground mb-2" />
                <span class="text-sm text-muted-foreground">Click to upload</span>
                <span class="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP · max 10MB</span>
              </label>
              <input
                bind:this={previewImageInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="hidden"
                onchange={handleImageUpload}
              />
            {/if}
          </div>

          <div>
            <label for="preview-name" class="block text-sm font-bold mb-2">
              Business name <span class="text-destructive">*</span>
            </label>
            <input
              id="preview-name"
              type="text"
              bind:value={previewName}
              placeholder="e.g. The Dog House Café"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label for="preview-tagline" class="block text-sm font-bold mb-2">
              Tagline / description <span class="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="preview-tagline"
              type="text"
              bind:value={previewTagline}
              placeholder="e.g. Dog-friendly café with a full dog menu"
              maxlength={80}
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p class="text-xs text-muted-foreground mt-1">{previewTagline.length}/80</p>
          </div>

          <div>
            <label for="preview-url" class="block text-sm font-bold mb-2">
              Website URL <span class="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="preview-url"
              type="url"
              bind:value={previewUrl}
              placeholder="https://yourbusiness.co.nz"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label for="preview-email" class="block text-sm font-bold mb-2">
              Email <span class="text-destructive">*</span>
            </label>
            <input
              id="preview-email"
              type="email"
              bind:value={previewEmail}
              placeholder="you@yourbusiness.co.nz"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={!previewName.trim() || !previewEmail.trim()}
            class={cn(buttonVariants({ variant: "default" }), "w-full py-5 text-sm font-bold disabled:opacity-40")}
          >
            Submit for review
          </button>
          <p class="text-xs text-muted-foreground text-center">
            Free — no payment required. We'll review and get back to you.
          </p>
        </form>

        <!-- Live preview -->
        <div class="lg:sticky lg:top-6 space-y-4">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live preview</p>

          <!-- Location page preview -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div class="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
              <div class="size-2 rounded-full bg-red-400"></div>
              <div class="size-2 rounded-full bg-yellow-400"></div>
              <div class="size-2 rounded-full bg-green-400"></div>
              <span class="text-[11px] text-muted-foreground ml-1">Location page</span>
            </div>
            <div>
              <div class="bg-linear-to-br from-slate-700 to-slate-900 h-16 flex items-end px-4 pb-2.5">
                <p class="text-white font-bold text-sm">Christchurch</p>
              </div>
              <div class="p-4">
                <div class="rounded-xl border-2 border-primary/30 bg-primary/5 p-3.5 relative">
                  <span class="absolute top-2.5 right-3 text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                  <div class="flex gap-3">
                    <div class="size-14 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                      {#if previewImageUrl}
                        <img src={previewImageUrl} alt={previewDisplayName} class="w-full h-full object-cover" />
                      {:else}
                        <Star class="size-5 text-muted-foreground" />
                      {/if}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-sm truncate">{previewDisplayName}</p>
                      {#if previewUrl}
                        <p class="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                          <ExternalLink class="size-3 shrink-0" />{previewDisplayUrl}
                        </p>
                      {/if}
                      <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{previewDisplayTagline}</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-2 mt-3">
                  {#each [1, 2] as _}
                    <div class="rounded-xl border border-border p-3">
                      <div class="flex gap-3">
                        <div class="size-10 rounded-lg bg-muted shrink-0"></div>
                        <div class="space-y-1.5 flex-1">
                          <div class="h-2.5 bg-muted rounded w-3/4"></div>
                          <div class="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- Explore panel preview -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div class="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
              <div class="size-2 rounded-full bg-red-400"></div>
              <div class="size-2 rounded-full bg-yellow-400"></div>
              <div class="size-2 rounded-full bg-green-400"></div>
              <span class="text-[11px] text-muted-foreground ml-1">Explore page</span>
            </div>
            <div class="p-3 space-y-2">
              <p class="text-[10px] font-semibold text-muted-foreground px-1">Explore places · 8 places</p>
              <div class="rounded-xl border-2 border-primary/30 bg-primary/5 p-3 relative">
                <span class="absolute top-2 right-2 text-[9px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                <div class="aspect-[2.4] rounded-lg bg-muted mb-2 overflow-hidden flex items-center justify-center">
                  {#if previewImageUrl}
                    <img src={previewImageUrl} alt={previewDisplayName} class="w-full h-full object-cover" />
                  {:else}
                    <span class="text-[10px] text-muted-foreground">Your photo</span>
                  {/if}
                </div>
                <p class="font-semibold text-[11px] truncate">{previewDisplayName}</p>
                <p class="text-[10px] text-muted-foreground line-clamp-1">{previewDisplayTagline}</p>
              </div>
              {#each [1, 2] as _}
                <div class="rounded-xl border border-border p-2.5 space-y-1.5">
                  <div class="aspect-[2.4] bg-muted rounded-lg"></div>
                  <div class="h-2 bg-muted rounded w-3/4"></div>
                  <div class="h-1.5 bg-muted rounded w-1/2"></div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Similar Places preview -->
          <div class="rounded-2xl border border-border overflow-hidden">
            <div class="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
              <div class="size-2 rounded-full bg-red-400"></div>
              <div class="size-2 rounded-full bg-yellow-400"></div>
              <div class="size-2 rounded-full bg-green-400"></div>
              <span class="text-[11px] text-muted-foreground ml-1">Place page · Similar Places</span>
            </div>
            <div class="p-3">
              <p class="text-xs font-bold mb-2 px-1">Similar Places</p>
              <div class="flex gap-2 overflow-hidden">
                <div class="shrink-0 w-32 rounded-xl border-2 border-primary/30 bg-primary/5 p-2.5 relative">
                  <span class="absolute top-1.5 right-1.5 text-[8px] font-semibold text-primary/60 uppercase tracking-wide">Featured</span>
                  <div class="aspect-[1.2] bg-muted rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                    {#if previewImageUrl}
                      <img src={previewImageUrl} alt={previewDisplayName} class="w-full h-full object-cover" />
                    {:else}
                      <Star class="size-3.5 text-muted-foreground" />
                    {/if}
                  </div>
                  <p class="text-[10px] font-semibold leading-tight truncate">{previewDisplayName}</p>
                  <p class="text-[9px] text-muted-foreground mt-0.5">Christchurch</p>
                </div>
                {#each [1, 2] as _}
                  <div class="shrink-0 w-32 rounded-xl border border-border p-2.5 space-y-1.5">
                    <div class="aspect-[1.2] bg-muted rounded-lg"></div>
                    <div class="h-2 bg-muted rounded w-3/4"></div>
                    <div class="h-1.5 bg-muted rounded w-1/2"></div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  <Footer />
</main>
