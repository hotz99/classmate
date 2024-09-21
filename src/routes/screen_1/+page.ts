// reading from courses.json in +page.ts happens server side
// if we have this in +page.svelte, courses.json is bundled into the response so the client has this data
// keep data loading server side
// filter, sort, etc. done client side

import type { PageLoad } from "./$types";
import courses from "$lib/data/courses.json";

export const load: PageLoad = async () => {
  return {
    courses
  };
};
