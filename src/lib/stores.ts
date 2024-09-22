import type { Course, Courses, Submission } from "$lib/types";
import { writable } from "svelte/store";
import courseData from "$lib/data/courses.json";

export const coursesStore = writable<Courses>(courseData as Courses);
export const selectedCourseStore = writable<Course | null>(null);
export const selectedSubmissionStore = writable<Submission | null>(null);
export const selectedTagStore = writable<string | null>(null);
export const hasAddedFileStore = writable<boolean>(false);
export const hasAddedAbstractStore = writable<boolean>(false);
export const submissionTitleStore = writable<string | null>(null);
