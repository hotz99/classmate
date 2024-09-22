<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight } from "lucide-svelte";
  import type { Course, Submission } from "$lib/types";
  import { page } from "$app/stores";
  import { coursesStore, selectedSubmissionStore } from "$lib/stores";
  import { SubmissionFilters } from "$lib/components";

  let titleFilter: string = "";
  let studentIdFilter: string = "";
  let ratingFilter: string = "";
  let academicYearFilter: string = "";

  $: filteredSubmissions = selectedCourse
    ? selectedCourse.submissions.filter((submission) =>
        submission.title.toLowerCase().includes(titleFilter.toLowerCase()),
      )
    : [];

  let slug: string;
  let selectedCourse: Course | null = null;

  $: {
    slug = $page.params.slug;
    selectedCourse = Object.values($coursesStore)
      .flatMap((semester) => Object.values(semester).flat())
      .find((c) => c.id === slug);
  }

  function loadSubmission(courseId: string, submission: Submission) {
    $: selectedSubmissionStore.set(submission);
    goto(`/courses/${courseId}/submissions/${submission.id}`);
  }
</script>

<div class="mx-auto">
  {#if selectedCourse}
    <h1 class="mt-8 text-4xl">{selectedCourse.name}</h1>
    <p>Year {selectedCourse.year}, Semester {selectedCourse.semester}</p>
    <div class="mt-8">
      <SubmissionFilters
        bind:titleFilter
        bind:studentIdFilter
        bind:ratingFilter
        bind:academicYearFilter
      />
    </div>

    <div class="mt-2 flex flex-col justify-between space-y-2">
      {#each filteredSubmissions as submission}
        <div
          class="flex flex-row justify-between items-center px-4 py-2 border rounded"
        >
          <div>
            <h2 class="text-xl">{submission.title}</h2>
            <h2 class="text-sm">by {submission.author.studentId}</h2>
          </div>
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
