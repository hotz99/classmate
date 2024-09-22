<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Download, MessageSquare, Star, Eye } from "lucide-svelte";
  import { selectedSubmissionStore } from "$lib/stores";
  $: selectedSubmission = selectedSubmissionStore;
</script>

<div class="flex flex-col">
  {#if $selectedSubmission}
    <h1 class="text-6xl">{$selectedSubmission.title}</h1>
    <p class="text-2xl">by {$selectedSubmission.author.studentId}</p>
    <div class="flex flex-col justify-center items-center space-y-8 mt-8">
      <h2 class="text-4xl">Abstract</h2>
      <p class="text-2xl border rounded">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
        lacinia varius eros, ac rhoncus metus vestibulum vel. Nam ac enim eros.
        Aenean sit amet velit a magna blandit dignissim. Nulla interdum erat
        justo, convallis iaculis nulla porta et. Donec et nunc urna. Integer sit
        amet commodo odio. Phasellus dapibus risus at bibendum feugiat.
      </p>
    </div>
    <div class="flex flex-row justify-center items-center space-x-2 mt-8">
      <Button><Eye /></Button>
      <Button><Download /></Button>
      <Button><MessageSquare /></Button>
      <Button><Star /></Button>
    </div>
  {:else}
    <h1 class="text-6xl">404: Submission not found</h1>
  {/if}
</div>
