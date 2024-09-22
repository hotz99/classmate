<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { Pen, Plus, CircleHelp } from "lucide-svelte";
  import { TagList } from "$lib/components";
  import {
    selectedTagStore,
    hasAddedAbstractStore,
    submissionTitleStore,
  } from "$lib/stores";

  let title: string = "";
  let showTags: boolean = false;
  let showAbstract: boolean = false;

  function handleTitleInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    if (target.value.length >= 5) {
      submissionTitleStore.set(target.value);
    }
    title = target.value;
  }

  function handleTagSelection(tag: string) {
    selectedTagStore.set(tag);
    showTags = false;
    console.log($selectedTagStore);
  }

  function handleAbstractChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    console.log(target.value.length);
    if (target.value.length >= 60) {
      hasAddedAbstractStore.set(true);
    } else {
      hasAddedAbstractStore.set(false);
    }
  }
</script>

<div class="flex flex-col space-y-2">
  <Input
    class="p-8 text-4xl"
    placeholder="Title"
    bind:value={title}
    on:input={handleTitleInput}
  />
  <Button
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
      <Plus />Add tag
    {/if}
  </Button>
  {#if showTags}
    <div class="flex flex-row space-x-2">
      <TagList onSelectTag={handleTagSelection} />
    </div>
  {/if}
  {#if showAbstract && !showTags}
    <h2 class="text-2xl">Abstract</h2>
    <Tooltip.Root>
      <Tooltip.Trigger asChild><CircleHelp class="self-left" /></Tooltip.Trigger
      >
      <Tooltip.Content>
        <p>
          We require all users to provide an abstract for their notes, minimum
          60 characters. You will be rated according to your summary.
        </p>
      </Tooltip.Content>
    </Tooltip.Root>
    <Input
      class="p-8 text-xl"
      placeholder="Provide an abstract for your notes"
      on:input={handleAbstractChange}
    />
  {/if}
</div>

