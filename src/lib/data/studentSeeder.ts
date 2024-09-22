import type { Course, Courses, Submission } from "../types";
import courses from "./courses.json" assert { type: "json" };
import fs from "node:fs";

// Sample names to generate random authors
const firstNames = ["John", "Jane", "Alice", "Bob", "Charlie", "Emily", "David", "Fiona"];
const lastNames = ["Doe", "Smith", "Johnson", "Brown", "Davis", "Wilson", "Miller", "Taylor"];

// Keep track of the current ID (starting from 0)
let currentId = 0;

// Generate a unique ID based on an incrementing counter
function generateSubmissionId(): string {
  return (currentId++).toString(); // Increment and return the current ID as a string
}

// Generate a random student ID in the format "innnnnnn"
function generateStudentId(): string {
  return "i" + Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("");
}

// Generate a random rating between 1 and 5
function generateRating(): number {
  return Math.floor(Math.random() * 5) + 1;
}

// Generate a random date within the past 2 years
function generateRandomDate(): string {
  const start = new Date();
  const end = new Date();
  end.setFullYear(end.getFullYear() - 2);

  const randomDate = new Date(start.getTime() - Math.random() * (start.getTime() - end.getTime()));
  return randomDate.toISOString();
}

// Generate a single submission with a unique ID and random data
function generateSubmission(courseId: string): Submission {
  const title = "Submission " + Math.floor(Math.random() * 10);
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    id: generateSubmissionId(), // Add unique id using natural numbers
    title,
    author: {
      firstName,
      lastName,
      studentId: generateStudentId(),
    },
    rating: generateRating(),
    date: generateRandomDate(),
    courseId: courseId,
  };
}

// Populate a course with nSubmissions and add the `submissions` field
function populateCourseWithSubmissions(course: Course, nSubmissions: number): Course {
  const submissions: Submission[] = Array.from({ length: nSubmissions }, () => generateSubmission(course.id));
  course.submissions = submissions;
  return course;
}

// Iterate over all courses and populate each with submissions
function populateAllCourses(courses: Courses, nSubmissions: number): Courses {
  if (!courses || typeof courses !== 'object') {
    throw new Error('Courses data is not loaded or is invalid.');
  }

  Object.keys(courses).forEach(yearKey => {
    const year = courses[yearKey as keyof Courses]; // Ensure yearKey corresponds to the expected structure

    Object.keys(year).forEach(semesterKey => {
      const semester = year[semesterKey as keyof typeof year]; // Ensure semesterKey corresponds to the expected structure

      year[semesterKey] = semester.map((course: Course) =>
        populateCourseWithSubmissions(course, nSubmissions)
      );
    });
  });

  return courses;
}

// Add or update the `semester` field for each course
function updateCoursesWithSemester(courses: any): any {
  if (!courses || typeof courses !== 'object') {
    throw new Error('Courses data is not loaded or is invalid.');
  }

  Object.keys(courses).forEach((yearKey) => {
    const year = courses[yearKey as keyof Courses];

    Object.keys(year).forEach((semesterKey) => {
      const semesterNumber = semesterKey === "semester1" ? "1" : "2";

      year[semesterKey] = year[semesterKey].map((course: Course) => {
        course.semester = semesterNumber;
        return course;
      });
    });
  });
  return courses;
}

// Example usage: populate the courses with submissions and update semesters
const updatedCoursesWithSubmissions = populateAllCourses(courses, 6);
const fullyUpdatedCourses = updateCoursesWithSemester(updatedCoursesWithSubmissions);

// Save the updated courses with submissions to the JSON file
fs.writeFileSync("./src/lib/data/courses.json", JSON.stringify(fullyUpdatedCourses, null, 2));

console.log("Successfully seeded courses.json with submissions and semesters.");

