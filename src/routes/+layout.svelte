<script lang="ts">
  import "../app.css";
  import {
    selectedTagStore,
    hasValidSubmissionStore,
    selectedFileStore,
    abstractStore,
  } from "$lib/stores";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index";
  import { Label } from "$lib/components/ui/label";
  import {
    X,
    Upload,
    ArrowRight,
    Undo2,
    Settings,
    LogOut,
    CircleUserRound,
  } from "lucide-svelte";

  const excludedPathsForButton = ["/courses", "/sign_in"];
  const excludedPathsForNavgrid = ["/sign_in", "/submit"];

  function handleUndo() {
    selectedTagStore.set(null);
    hasValidSubmissionStore.set(false);
    goto("/courses");
  }

  const allowedFileTypes = ["application/pdf", "text/plain"];

  async function handleFileChange(event) {
    const input = event.target;

    if (input && !input.files.length) {
      selectedFileStore.set(null);
      return;
    }

    if (!allowedFileTypes.includes(input.files[0].type)) {
      console.log(input.files[0].type);
      alert("Invalid file type");
      return;
    }

    const file = input.files[0];

    selectedFileStore.set(file);
  }

  function clearSubmittedFile() {
    selectedFileStore.set(null);
    document.getElementById("submissionFile").value = "";
  }
</script>

<main class="flex flex-col min-h-screen p-4 space-y-8">
  {#if !excludedPathsForButton.includes($page.url.pathname)}
    <div class="flex flex-row justify-between">
      <Button on:click={handleUndo}><Undo2 /></Button>
      {#if $page.url.pathname === "/submit"}
        <Button
          on:click={() => goto(`/submit/finish`)}
          disabled={!$hasValidSubmissionStore}><ArrowRight /></Button
        >
      {/if}
    </div>
  {/if}
  <div class="flex-grow"><slot /></div>
  {#if !excludedPathsForNavgrid.includes($page.url.pathname)}
    <div class="flex flex-row self-end">
      <div class="grid grid-cols-2 gap-2">
        <Button on:click={() => goto("/submit")}>
          <Upload />
        </Button>
        <Button on:click={() => goto("/account")}><CircleUserRound /></Button>
        <Button on:click={() => goto("/settings")}><Settings /></Button>
        <Button on:click={() => goto("/sign_in")}><LogOut /></Button>
      </div>
    </div>
  {:else if $page.url.pathname === "/submit"}
    <div class="flex flex-col space-y-2 border rounded p-4 bg-primary">
      <Label class="text-4xl text-white" for="submissionFile">Add file</Label>
      <div class="flex flex-row">
        <input
          class="text-xl text-white flex-grow"
          style="max-width: 80%;"
          id="submissionFile"
          type="file"
          bind:value={$selectedFileStore}
          on:change={handleFileChange}
        />
        {#if $selectedFileStore}
          <Button on:click={clearSubmittedFile}>
            <X />
          </Button>
        {/if}
      </div>
    </div>
  {/if}
</main>
