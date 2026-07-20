<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import HomeNavbar from "$lib/components/home-navbar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select/index.js";
  import Textarea from "$lib/components/ui/textarea/textarea.svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { api } from "$lib/api-helper";
  import { LoaderCircle } from "@lucide/svelte";
  import dogs from "$lib/assets/dogs.JPG";

  const { data } = $props();
  const { user } = $derived(data);

  let name = $state("");
  let email = $state("");
  let subject = $state("generalInquiry");
  let message = $state("");
  let submitted = $state(false);

  const subjects = [
    { value: "generalInquiry", label: "General Inquiry" },
    { value: "feedback", label: "Feedback" },
    { value: "partnership", label: "Partnership" },
    { value: "press/media", label: "Press/Media" },
    { value: "bugReport", label: "Bug Report" },
    { value: "featureRequest", label: "Feature Request" },
    { value: "other", label: "Other" },
  ];

  const triggerContent = $derived(
    subjects.find((s) => s.value === subject)?.label,
  );

  const mutation = createMutation(() => ({
    mutationFn: async () => {
      return api.contact.sendMessage({ name, email, subject, message });
    },
    onSuccess: () => {
      submitted = true;
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  }));

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    mutation.mutate();
  };
</script>

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
          <Breadcrumb.Page>Contact Us</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
    <section class="flex flex-col md:flex-row items-start md:items-center gap-12 md:gap-24">
      <div class="flex-1 min-w-0">
        <div class="mb-8 sm:mb-12">
          <h1 class="text-4xl sm:text-5xl font-bold mb-6">Contact Us</h1>
          <p class="text-base sm:text-lg text-kuma-text-secondary">
            Have questions, feedback, or partnership inquiries? We'd love to
            hear from you.
          </p>
        </div>
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold mb-6">Send us a message</h2>
          {#if submitted}
            <div
              class="rounded-lg border border-border bg-muted/40 p-8 text-center space-y-3"
            >
              <p class="text-2xl font-bold">Message sent!</p>
              <p class="text-muted-foreground">
                Thanks for reaching out. We'll get back to you as soon as
                possible.
              </p>
              <Button
                variant="outline"
                onclick={() => {
                  submitted = false;
                  name = "";
                  email = "";
                  message = "";
                  subject = "generalInquiry";
                }}
              >
                Send another message
              </Button>
            </div>
          {:else}
            <form class="space-y-6" onsubmit={handleSubmit}>
              <div>
                <Label for="name" class="block text-sm font-bold mb-2"
                  >Name</Label
                >
                <Input
                  type="text"
                  id="name"
                  bind:value={name}
                  required
                  class="block w-full rounded-md bg-background px-3 py-1.5 text-base"
                />
              </div>
              <div>
                <Label for="email" class="block text-sm font-bold mb-2"
                  >Email</Label
                >
                <Input
                  type="email"
                  id="email"
                  bind:value={email}
                  required
                  class="block w-full rounded-md bg-background px-3 py-1.5 text-base"
                />
              </div>
              <div>
                <Label for="subject" class="block text-sm font-bold mb-2"
                  >Subject</Label
                >
                <Select.Root type="single" name="subject" bind:value={subject}>
                  <Select.Trigger class="w-full bg-background"
                    >{triggerContent}</Select.Trigger
                  >
                  <Select.Content>
                    <Select.Group>
                      {#each subjects as subjectOption}
                        <Select.Item value={subjectOption.value}
                          >{subjectOption.label}</Select.Item
                        >
                      {/each}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
              <div>
                <Label for="message" class="block text-sm font-bold mb-2"
                  >Message</Label
                >
                <Textarea
                  bind:value={message}
                  id="message"
                  required
                  minlength={10}
                  maxlength={2000}
                  rows={6}
                  class="w-full bg-background"
                />
                <p class="text-sm mt-1 text-muted-foreground">
                  {message.length}/2000
                </p>
              </div>
              <Button
                type="submit"
                class="w-full py-6"
                disabled={mutation.isPending}
              >
                {#if mutation.isPending}
                  <LoaderCircle class="mr-2 size-4 animate-spin" />
                  Sending...
                {:else}
                  Send Message
                {/if}
              </Button>
            </form>
          {/if}
        </div>
      </div>
      <div class="flex-1 min-w-0 relative">
        <div
          class="relative rounded-2xl overflow-hidden aspect-4/5 editorial-shadow transform rotate-2"
        >
          <img
            class="w-full h-full object-cover"
            alt="A man sitting with a rough collie between his legs"
            src={dogs}
          />
        </div>
      </div>
    </section>
  </div>
  <Footer />
</main>
