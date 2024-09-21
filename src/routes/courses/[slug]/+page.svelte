<script lang="ts">
  import type { PageData } from "./$types";
  import type { Course } from "$lib/types";
  import { coursesStore } from "$lib/stores";

  $: selectedCourseStore;

  export let data: PageData;

  let filteredCourse: Course;

  $: if ($coursesStore) {
    filteredCourse = Object.values($coursesStore.computer_science)
      .flatMap((year) => Object.values(year).flat())
      .find((course) => course.id === data.courseId);
  }
</script>

{#if filteredCourse}
  <h1>{filteredCourse.name}</h1>
  <p>{filteredCourse.year}</p>
{:else}
  <h1>Course not found</h1>
{/if}
