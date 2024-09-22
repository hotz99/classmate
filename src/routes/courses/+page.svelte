<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";
  import { Input } from "$lib/components/ui/input";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight } from "lucide-svelte";
  import { selectedCourseStore } from "$lib/stores";

  import type { Course, Courses } from "$lib/types";

  export let data: PageData;

  let courses: Courses = data.courses;

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

  function loadCourse(course: Course) {
    $selectedCourseStore.set(course);
    goto(`/courses/${course.id}`);
  }
</script>

<div class="mx-auto mt-2 space-y-10">
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
        <Button class="ml-auto" on:click={() => loadCourse(course)}>
          <ArrowRight />
        </Button>
      </div>
    {/each}
  </div>
</div>
