import type { Course } from "./Course";

export interface Submission {
  id: number;
  title: string;
  author: {
    firstName: string;
    lastName: string;
    studentId: string;
  };
  rating: number;
  date: string;
  courseId: string;
}
