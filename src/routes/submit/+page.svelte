<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Pen, Plus, CircleHelp } from "lucide-svelte";
  import { TagList } from "$lib/components";
  import {
    selectedTagStore,
    submissionTitleStore,
    hasValidSubmissionStore,
  } from "$lib/stores";

  let title: string = "";
  let titleError: string | null = null;
  const TITLE_MIN_LENGTH = 10;

  let abstractInput: string = "";

  let showTags: boolean = false;
  let showAbstract: boolean = false;

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
  }

  let hasValidAbstract: boolean = false;
  $: hasValidSubmissionStore.set(
    hasValidTitle && hasValidAbstract && !!$selectedTagStore,
  );

  function handleAbstractChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.length >= 60) {
      hasValidAbstract = true;
      console.log("abstract is valid");
    }
  }
</script>

<style>
  /* ... existing styles ... */

  /* Target specific inputs by their placeholder text or name */
  input[placeholder="Title"],
  input[placeholder="search"],
  input[name="studentId"],
  input[name="password"] {
    color: white; /* Set text color to white */
  }

  /* For placeholder text in these specific inputs */
  input[placeholder="Title"]::placeholder,
  input[placeholder="search"]::placeholder,
  input[name="studentId"]::placeholder,
  input[name="password"]::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
</style>

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
        <Pen class="mr-4" />
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
      <textarea
        class="mt-2 p-4 text-xl w-full h-full resize-none border rounded bg-popover text-popover-foreground"
        placeholder="Provide an abstract for your notes"
        bind:value={abstractInput}
        on:input={handleAbstractChange}
        rows="12"
      />
    </div>
  {/if}
</div>
