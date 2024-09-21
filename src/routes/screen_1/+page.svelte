<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import { Input } from "$lib/components/ui/input";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";
  import type { Course, Courses } from "./types";

  export let data: PageData;

  let courses: Courses = data.courses.computer_science;

  let searchInput: string = "";
  let activeYear: string = "year1";
  let activeSemester: string = "semester1";

  $: filteredCourses = (courses[activeYear][activeSemester] || []).filter(
    (course: Course) => {
      const matchesSearch = course.name
        .toLowerCase()
        .includes(searchInput.toLowerCase());
      return matchesSearch;
    },
  );
</script>

<div class="w-1/3 mx-auto mt-4 space-y-4">
  <div class="flex flex-col space-y-2">
    <Input placeholder="Search ..." bind:value={searchInput} />

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
        class="flex flex-row justify-between items-center px-4 py-2 border rounded"
      >
        <h2>{course.name}</h2>
        <Button class="ml-auto" on:click={() => goto(`/courses/${course.id}`)}>
          View
        </Button>
      </div>
    {/each}
  </div>
</div>
