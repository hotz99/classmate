<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import {
    Sparkle,
    Pen,
    Plus,
    Minus,
    CircleHelp,
    LoaderCircle,
  } from "lucide-svelte";
  import { TagList } from "$lib/components";
  import {
    selectedTagStore,
    submissionTitleStore,
    hasValidSubmissionStore,
    selectedFileStore,
  } from "$lib/stores";

  let title: string = "";
  let titleError: string | null = null;
  const TITLE_MIN_LENGTH = 10;

  let abstractInput: string = "";

  let showTags: boolean = false;
  let showAbstract: boolean = true;

  let hasValidTitle: boolean = false;

  function validateTitle() {
    if (title.length < TITLE_MIN_LENGTH) {
      titleError = `Title must be at least ${TITLE_MIN_LENGTH} characters`;
    } else {
      submissionTitleStore.set(title);
      hasValidTitle = true;
      titleError = null;
    }
  }

  function handleTagSelection(tag: string) {
    // not sure if we need a store for this
    selectedTagStore.set(tag);
    showTags = false;
    showAbstract = true;
  }

  let hasValidAbstract: boolean = false;

  $: hasValidSubmissionStore.set(
    hasValidTitle && hasValidAbstract && $selectedTagStore,
  );

  function handleAbstractChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    if (target.value.length >= 60) {
      hasValidAbstract = true;
      console.log("abstract is valid");
    } else {
      hasValidAbstract = false;
    }
  }

  let awaitingGeminiResponse: boolean = false;

  function handleAiSummarization() {
    awaitingGeminiResponse = true;

    const file = $selectedFileStore;
    const reader = new FileReader();
    reader.onload = async (event) => {
      console.log("file loaded");
      if (!event.target || !event.target.result) {
        return;
      }

      // https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/data
      const dataUrl = event.target.result;

      const base64Content = dataUrl.split(",")[1];

      console.log("sending request to gemini handler");

      const response = await fetch("/api/geminiHandler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          base64Content: base64Content,
          mimeType: file.type,
        }),
      });

      const result = await response.json();
      awaitingGeminiResponse = false;
      abstractInput = result.body.summary;
      hasValidAbstract = true;
      selectedTagStore.set(result.body.tag);
    };

    console.log(file);
    reader.readAsDataURL(file);
  }

  async function sendVerbosityAdjustmentRequest(increaseVerbosity: boolean) {
    awaitingGeminiResponse = true;
    const response = await fetch("/api/geminiHandler", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adjustVerbosity: increaseVerbosity ? 1 : -1,
        summaryToBeAdjusted: abstractInput,
      }),
    });

    const result = await response.json();

    awaitingGeminiResponse = false;

    console.log("new summary has length ", result.body.newSummary.length);

    abstractInput = result.body.newSummary;
  }
</script>

<div class="flex flex-col">
  <div class="flex flex-col">
    <Input
      class="py-8 text-4xl"
      placeholder="Title"
      bind:value={title}
      on:blur={validateTitle}
    />
    {#if titleError}
      <p class="text-red-500 text-sm mt-1">{titleError}</p>
    {/if}
  </div>
  <Button
    class="mt-4"
    on:click={() => {
      showTags = !showTags;
      showAbstract = !showAbstract;
    }}
    disabled={showTags}
  >
    {#if $selectedTagStore}
      <div class="flex flex-row items-center justify-start">
        <Pen class="mr-2" />
        {$selectedTagStore}
      </div>
    {:else}
      <div class="flex flex-row items-center justify-start">
        <Plus class="mr-4" />
        Add tag
      </div>
    {/if}
  </Button>
  {#if showTags}
    <div class="flex flex-row space-x-2 mt-4">
      <TagList onSelectTag={handleTagSelection} />
    </div>
  {/if}
  {#if showAbstract && !showTags}
    <div class="flex flex-col mt-8">
      <div class="flex items-center justify-between">
        <h2 class="text-4xl">Abstract</h2>
        <Button on:click={handleAiSummarization} disabled={!$selectedFileStore}
          ><Sparkle /></Button
        >
        <Popover.Root>
          <Popover.Trigger><CircleHelp /></Popover.Trigger>
          <Popover.Content>
            <p>
              We require all users to provide an abstract for their notes,
              minimum 60 characters. You will be rated according to your
              summary.
            </p>
          </Popover.Content>
        </Popover.Root>
      </div>
      {#if awaitingGeminiResponse}
        <svg
          class="animate-spin m-8 h-14 w-14 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <LoaderCircle />
        </svg>
      {:else}
        <textarea
          class="mt-2 p-4 text-xl w-full h-full resize-none border rounded"
          placeholder="Provide an abstract for your notes"
          bind:value={abstractInput}
          on:input={handleAbstractChange}
          rows="12"
        />
      {/if}
      <div class="flex flex-row space-x-2 mt-4">
        <Button
          class="border rounded"
          on:click={() => sendVerbosityAdjustmentRequest(false)}
          disabled={!hasValidAbstract}><Minus class="mr-2" />Verbose</Button
        >
        <Button
          class="border rounded"
          on:click={() => sendVerbosityAdjustmentRequest(true)}
          disabled={!hasValidAbstract}><Plus class="mr-2" />Verbose</Button
        >
      </div>
    </div>
  {/if}
</div>
