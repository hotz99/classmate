<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight } from "lucide-svelte";
  import type { Course, Submission } from "$lib/types";
  import { page } from "$app/stores";
  import { coursesStore, selectedSubmissionStore } from "$lib/stores";

  let slug: string;
  let selectedCourse: Course | null = null;

  $: {
    slug = $page.params.slug;
    selectedCourse = Object.values($coursesStore)
      .flatMap((semester) => Object.values(semester).flat())
      .find((c) => c.id === slug);

    console.log(selectedCourse);
  }

  function loadSubmission(courseId: string, submission: Submission) {
    $selectedSubmissionStore.set(submission);
    goto(`/courses/${courseId}/submissions/${submission.id}`);
  }
</script>

<div class="mx-auto">
  {#if selectedCourse}
    <h1 class="mt-4 text-4xl">{selectedCourse.name}</h1>
    <p>Year {selectedCourse.year} / Semester {selectedCourse.semester}</p>
    <div class="flex flex-col justify-between space-y-2">
      {#each selectedCourse.submissions as submission}
        <div class="mx-auto border rounded">
          <h2 class="text-xl">{submission.title}</h2>
          <h2 class="text-sm">{submission.author.studentId}</h2>
          <Button
            class="ml-auto"
            on:click={() => loadSubmission(selectedCourse.id, submission)}
          >
            <ArrowRight />
          </Button>
        </div>
      {/each}
    </div>
  {:else}
    <h1 class="mt-4 text-4xl">
      404: Course with ID {slug} not found.
    </h1>
  {/if}
</div>
