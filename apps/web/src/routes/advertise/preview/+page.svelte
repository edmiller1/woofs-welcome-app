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

  const previewDisplayName = $derived(
    previewName.trim() || "Your Business Name",
  );
  const previewDisplayTagline = $derived(
    previewTagline.trim() || "Your dog-friendly tagline here",
  );
  const previewDisplayUrl = $derived(previewUrl.trim() || "yourwebsite.co.nz");

  async function handlePreviewSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!previewName.trim() || !previewEmail.trim()) return;
    await api.contact
      .sendMessage({
        name: previewName,
        email: previewEmail,
        subject: "partnership",
        message: `Ad preview request\n\nBusiness: ${previewName}\nWebsite: ${previewUrl}\nTagline: ${previewTagline}`,
      })
      .catch(() => {});
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
    <Breadcrumb.Root class="sm:mt-10 mt-16 mb-6">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href="/"
            class="text-muted-foreground no-underline hover:text-primary"
            >Home</Breadcrumb.Link
          >
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link
            href="/advertise"
            class="text-muted-foreground no-underline hover:text-primary"
          >
            Advertise
          </Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page class="font-bold text-primary"
            >Preview</Breadcrumb.Page
          >
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>

    <div class="max-w-3xl mb-12 pt-11">
      <h1 class="m-0 text-[50px] leading-[1.05] tracking-[-0.035em]">
        Create a free preview
      </h1>
      <p class="mt-4 max-w-150 text-base leading-[1.6] text-pretty">
        Fill in your details and see exactly what your ad will look like across
        every placement on Woofs Welcome — no payment required.
      </p>
    </div>

    {#if previewSubmitted}
      <div
        class="rounded-2xl border border-border bg-muted/40 p-10 text-center max-w-lg"
      >
        <p class="text-2xl font-bold mb-2">Request sent!</p>
        <p class="text-muted-foreground mb-6">
          Thanks — we'll be in touch at <span
            class="font-medium text-foreground">{previewEmail}</span
          > shortly.
        </p>
        <div class="flex gap-3 justify-center">
          <button
            class={cn(buttonVariants({ variant: "outline" }))}
            onclick={() => {
              previewSubmitted = false;
            }}
          >
            Start over
          </button>
          <a
            href="/advertise"
            class={cn(buttonVariants({ variant: "default" }))}
          >
            Back to Advertise
          </a>
        </div>
      </div>
    {:else}
      <div class="grid items-start gap-11 pb-14 pt-9 lg:grid-cols-[1fr_1.1fr]">
        <!-- Form -->
        <form class="space-y-6" onsubmit={handlePreviewSubmit}>
          <!-- Image upload -->
          <div>
            <p class="text-[13.5px] font-bold">
              Ad image <span class="font-normal text-muted-foreground"
                >(optional)</span
              >
            </p>
            {#if previewImageUrl}
              <div
                class="relative w-full aspect-[3] rounded-xl overflow-hidden border border-border"
              >
                <img
                  src={previewImageUrl}
                  alt="Ad preview"
                  class="w-full h-full object-cover"
                />
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
                class="flex flex-col items-center justify-center w-full aspect-[3] rounded-xl border-2 border-dashed border-border bg-card hover:bg-card/60 cursor-pointer transition-colors"
                onclick={() => previewImageInput?.click()}
              >
                <Upload class="size-6 text-muted-foreground mb-2" />
                <span class="text-sm text-muted-foreground"
                  >Click to upload</span
                >
                <span class="text-xs text-muted-foreground mt-1"
                  >PNG, JPG, WEBP · max 10MB</span
                >
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
            <label for="preview-name" class="text-[13.5px] font-bold">
              Business name <span class="text-destructive">*</span>
            </label>
            <input
              id="preview-name"
              type="text"
              bind:value={previewName}
              placeholder="e.g. The Dog House Café"
              class="mt-2.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div>
            <label for="preview-tagline" class="text-[13.5px] font-bold">
              Tagline / description <span
                class="font-normal text-muted-foreground">(optional)</span
              >
            </label>
            <input
              id="preview-tagline"
              type="text"
              bind:value={previewTagline}
              placeholder="e.g. Dog-friendly café with a full dog menu"
              maxlength={80}
              class="mt-2.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <p class="mt-2 text-xs text-muted-foreground">
              {previewTagline.length}/80
            </p>
          </div>

          <div>
            <label for="preview-url" class="text-[13.5px] font-bold">
              Website URL <span class="font-normal text-muted-foreground"
                >(optional)</span
              >
            </label>
            <input
              id="preview-url"
              type="url"
              bind:value={previewUrl}
              placeholder="https://yourbusiness.co.nz"
              class="mt-2.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div>
            <label for="preview-email" class="text-[13.5px] font-bold">
              Email <span class="text-destructive">*</span>
            </label>
            <input
              id="preview-email"
              type="email"
              bind:value={previewEmail}
              placeholder="you@yourbusiness.co.nz"
              class="mt-2.5 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={!previewName.trim() || !previewEmail.trim()}
            class={cn(
              buttonVariants({ variant: "default" }),
              "w-full py-5 text-sm font-bold disabled:opacity-40",
            )}
          >
            Submit for review
          </button>
          <p class="mt-3 text-center text-[12.5px] text-muted-foreground">
            Free — no payment required. We'll review and get back to you.
          </p>
        </form>

        <!-- Live preview -->
        <div class="lg:sticky lg:top-6 space-y-4">
          <h2
            class="m-0 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Live preview
          </h2>

          <figure
            class="m-0 mt-3 overflow-hidden rounded-xl border border-border bg-card"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-2.5">
              <span class="flex gap-1.5"
                ><span class="size-2.5 rounded-full bg-[#d98a72]"></span><span
                  class="size-2.5 rounded-full bg-[#d9b872]"
                ></span><span class="size-2.5 rounded-full bg-[#8fb894]"
                ></span></span
              >
              <span class="text-xs font-semibold text-muted-foreground"
                >Location page</span
              >
            </div>
            <div class="bg-[oklch(31.37%_0.0374_62.43)] px-5 py-5">
              <div
                class="text-[20px] font-extrabold tracking-[-0.025em] text-[#faf4ec]"
              >
                Christchurch
              </div>
            </div>
            <div class="flex flex-col gap-3 p-3.5">
              <div
                class="flex items-center gap-3.5 rounded-[10px] border border-primary/45 bg-muted p-3.5"
              >
                <div
                  class="size-14 rounded-lg bg-card shrink-0 overflow-hidden flex items-center justify-center"
                >
                  {#if previewImageUrl}
                    <img
                      src={previewImageUrl}
                      alt={previewDisplayName}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <Star class="size-5 text-muted-foreground" />
                  {/if}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-[14.5px] font-extrabold" data-out-name>
                    {previewDisplayName}
                  </div>
                  {#if previewUrl}
                    <p
                      class="text-[11px] text-primary flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink
                        class="size-3 shrink-0"
                      />{previewDisplayUrl}
                    </p>
                  {/if}
                  <div
                    class="mt-1 text-[12.5px] text-muted-foreground"
                    data-out-tag
                  >
                    {previewDisplayTagline}
                  </div>
                </div>
                <div
                  class="self-start text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-primary"
                >
                  Featured
                </div>
              </div>
              <div
                class="flex items-center gap-3.5 rounded-[10px] border border-border p-3.5"
              >
                <div class="size-9.5 flex-none rounded-[9px] bg-muted"></div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="h-2 rounded bg-muted" style="width:74%"></div>
                  <div class="h-2 rounded bg-secondary" style="width:52%"></div>
                </div>
              </div>
              <div
                class="flex items-center gap-3.5 rounded-[10px] border border-border p-3.5"
              >
                <div class="size-9.5 flex-none rounded-[9px] bg-muted"></div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="h-2 rounded bg-muted" style="width:66%"></div>
                  <div class="h-2 rounded bg-secondary" style="width:44%"></div>
                </div>
              </div>
            </div>
          </figure>

          <figure
            class="m-0 mt-4 overflow-hidden rounded-xl border border-border bg-card"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-2.5">
              <span class="flex gap-1.5"
                ><span class="size-2.5 rounded-full bg-[#d98a72]"></span><span
                  class="size-2.5 rounded-full bg-[#d9b872]"
                ></span><span class="size-2.5 rounded-full bg-[#8fb894]"
                ></span></span
              >
              <span class="text-xs font-semibold text-muted-foreground"
                >Explore page</span
              >
            </div>
            <div class="px-3.5 pb-3.5">
              <div class="text-xs font-bold text-muted-foreground">
                Explore places · 8 places
              </div>
              <div
                class="mt-2.5 rounded-[11px] border border-primary/45 bg-muted p-2.5"
              >
                <div
                  class="text-right text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-primary"
                >
                  Featured
                </div>
                <div
                  class="aspect-[2.4] rounded-lg bg-muted mb-2 overflow-hidden flex items-center justify-center"
                >
                  {#if previewImageUrl}
                    <img
                      src={previewImageUrl}
                      alt={previewDisplayName}
                      class="w-full h-full object-cover"
                    />
                  {:else}
                    <Star class="size-8 text-muted-foreground" />
                  {/if}
                </div>
                <div class="mt-3 text-[13.5px] font-extrabold" data-out-name>
                  {previewDisplayName}
                </div>
                <div class="mt-0.5 text-xs text-muted-foreground" data-out-tag>
                  {previewDisplayTagline}
                </div>
              </div>
              <div class="mt-3 rounded-[11px] border border-border p-2.5">
                <div class="h-32.5 rounded-[9px] bg-muted"></div>
                <div class="mt-3 h-2 w-[70%] rounded bg-muted"></div>
                <div class="mt-2 h-2 w-[48%] rounded bg-secondary"></div>
              </div>
            </div>
          </figure>

          <figure
            class="m-0 mt-4 overflow-hidden rounded-xl border border-border bg-card"
          >
            <div class="flex items-center gap-2.5 px-3.5 py-2.5">
              <span class="flex gap-1.5"
                ><span class="size-2.5 rounded-full bg-[#d98a72]"></span><span
                  class="size-2.5 rounded-full bg-[#d9b872]"
                ></span><span class="size-2.5 rounded-full bg-[#8fb894]"
                ></span></span
              >
              <span class="text-xs font-semibold text-muted-foreground"
                >Place page · Similar Places</span
              >
            </div>
            <div class="px-3.5 pb-3.5">
              <div class="text-[13px] font-extrabold">Similar Places</div>
              <div class="mt-3 grid grid-cols-3 gap-3">
                <div
                  class="rounded-[10px] border border-primary/45 bg-muted p-2.5"
                >
                  <div
                    class="text-right text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary"
                  >
                    Featured
                  </div>
                  <div
                    class="aspect-[1.2] bg-muted rounded-lg mb-2 overflow-hidden flex items-center justify-center"
                  >
                    {#if previewImageUrl}
                      <img
                        src={previewImageUrl}
                        alt={previewDisplayName}
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <Star class="size-5 text-muted-foreground" />
                    {/if}
                  </div>
                  <div
                    class="mt-3.5 truncate text-[11px] font-extrabold"
                    data-out-name
                  >
                    {previewDisplayName}
                  </div>
                  <div class="mt-0.5 text-[10px] text-muted-foreground">
                    {previewDisplayTagline}
                  </div>
                </div>
                <div
                  class="flex flex-col gap-2 rounded-[10px] border border-border p-2.5"
                >
                  <div class="h-13 rounded-md bg-muted"></div>
                  <div
                    class="h-1.5 rounded bg-secondary"
                    style="width:80%"
                  ></div>
                  <div
                    class="h-1.5 rounded bg-secondary"
                    style="width:56%"
                  ></div>
                </div>
                <div
                  class="flex flex-col gap-2 rounded-[10px] border border-border p-2.5"
                >
                  <div class="h-13 rounded-md bg-muted"></div>
                  <div
                    class="h-1.5 rounded bg-secondary"
                    style="width:72%"
                  ></div>
                  <div
                    class="h-1.5 rounded bg-secondary"
                    style="width:48%"
                  ></div>
                </div>
              </div>
            </div>
          </figure>
        </div>
      </div>
    {/if}
  </div>
  <Footer />
</main>
