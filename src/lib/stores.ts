import type { Courses } from "$lib/types";
import { writable } from "svelte/store";
import { courseData } from "$lib/data/courses.json";

export const coursesStore = writable<Courses>(courseData as Courses);

