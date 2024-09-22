export interface Submission {
  id: number;
  title: string;
  author: {
    firstName: string;
    lastName: string;
    studentId: string;
  };
  date: string;
  rating: number;
  academicYear: number;
  courseId: string;
}
