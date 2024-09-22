<script lang="ts">
  import { submissionTitleStore } from "$lib/stores";
</script>

<div class="flex flex-col justify-center items-center mt-32">
  {#if $submissionTitleStore}
    <h2 class="text-4xl">Submitted with title:</h2>
    <p class="text-6xl">{$submissionTitleStore}</p>
  {:else}
    <h2 class="text-6xl">No title submitted</h2>
  {/if}
</div>
