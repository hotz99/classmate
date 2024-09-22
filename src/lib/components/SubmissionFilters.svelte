<script lang="ts">
  import { Input } from "$lib/components/ui/input";

  export let titleFilter: string = "";
  export let studentIdFilter: string = "";
  export let ratingFilter: string = "";
  export let academicYearFilter: string = "";

  let ratingError: string | null = null;
  let academicYearError: string | null = null;
  let studentIdError: string | null = null;

  function validateRating() {
    const rating = Number(ratingFilter);
    if (ratingFilter !== "" && (isNaN(rating) || rating < 1 || rating > 5)) {
      ratingError = "Rating must be an integer between 1 and 5";
    } else {
      ratingError = null;
    }
  }

  function validateAcademicYear() {
    const year = Number(academicYearFilter);
    if (
      academicYearFilter !== "" &&
      (!/^\d{4}$/.test(academicYearFilter) || year < 0)
    ) {
      academicYearError = "Academic year must be a 4-digit positive integer";
    } else {
      academicYearError = null;
    }
  }

  function validateStudentId() {
    if (studentIdFilter !== "" && !/^i\d{7}$/.test(studentIdFilter)) {
      studentIdError = "Invalid student ID";
    } else {
      studentIdError = null;
    }
  }
</script>

<div class="grid grid-cols-[2fr_1fr] gap-2">
  <div class="flex flex-col">
    <Input placeholder="Title" bind:value={titleFilter} />
  </div>

  <div class="flex flex-col">
    <Input
      placeholder="Rating"
      bind:value={ratingFilter}
      on:blur={validateRating}
    />
    {#if ratingError}
      <p class="text-red-500 text-sm mt-1">{ratingError}</p>
    {/if}
  </div>
  <div class="flex flex-col">
    <Input
      placeholder="Student ID"
      bind:value={studentIdFilter}
      on:blur={validateStudentId}
    />
    {#if studentIdError}
      <p class="text-red-500 text-sm mt-1">{studentIdError}</p>
    {/if}
  </div>

  <div class="flex flex-col">
    <Input
      placeholder="Academic year"
      bind:value={academicYearFilter}
      on:blur={validateAcademicYear}
    />
    {#if academicYearError}
      <p class="text-red-500 text-sm mt-1">{academicYearError}</p>
    {/if}
  </div>
</div>
