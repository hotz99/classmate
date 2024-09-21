export interface Course {
  id: string;
  name: string;
  year: "year1" | "year2" | "year3";
}

export interface Courses {
  computer_science: {
    year1: { semester1: Course[]; semester2: Course[] };
    year2: { semester1: Course[]; semester2: Course[] };
    year3: { semester1: Course[]; semester2: Course[] };
  };
}
