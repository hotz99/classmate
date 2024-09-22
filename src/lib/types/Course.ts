import type { Submission } from "./Submission";

export interface Course {
  id: string;
  name: string;
  year: "1" | "2" | "3";
  semester: "1" | "2";
  submissions: Submission[];
}
