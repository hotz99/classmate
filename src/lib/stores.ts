import type { Course, Courses, Submission } from "$lib/types";
import { writable } from "svelte/store";
import courseData from "$lib/data/courses.json";

export const coursesStore = writable<Courses>(courseData as Courses);
export const selectedCourseStore = writable<Course | null>(null);
export const selectedSubmissionStore = writable<Submission | null>(null);
