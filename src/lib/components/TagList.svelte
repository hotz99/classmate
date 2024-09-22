<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import { coursesStore } from "$lib/stores";
  import type { Course } from "$lib/types";

  export let selectedTag: string = "";
  export let onSelectTag: (tag: string) => void;

  let activeYear = "year1";
  let activeSemester = "semester1";

  $: filteredCourses = $coursesStore[activeYear][activeSemester];
</script>

<div class="mx-auto space-y-10">
  <div class="flex flex-col space-y-2">
    <Tabs.Root class="mx-auto" bind:value={activeYear}>
      <Tabs.List class="flex space-x-4">
        <Tabs.Trigger value="year1" class="py-2 px-4">Year 1</Tabs.Trigger>
        <Tabs.Trigger value="year2" class="py-2 px-4">Year 2</Tabs.Trigger>
        <Tabs.Trigger value="year3" class="py-2 px-4">Year 3</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>

    <Tabs.Root class="mx-auto" bind:value={activeSemester}>
      <Tabs.List class="flex space-x-4">
        <Tabs.Trigger value="semester1" class="py-2 px-4"
          >Semester 1</Tabs.Trigger
        >
        <Tabs.Trigger value="semester2" class="py-2 px-4"
          >Semester 2</Tabs.Trigger
        >
      </Tabs.List>
    </Tabs.Root>
  </div>

  <div class="flex flex-col space-y-2">
    {#each filteredCourses as course}
      <div
        class="cursor-pointer flex flex-row justify-between items-center p-4 py-2 border rounded"
        on:click={() => onSelectTag(course.name)}
      >
        <h2>{course.name}</h2>
      </div>
    {/each}
  </div>
</div>
