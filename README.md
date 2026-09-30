# Classmate

Classmate is a prototype of a platform where students share notes for their courses. It was a course project for Intelligent User Interfaces. The task was to design a product prototype with an AI feature that makes the user experience better.

## AI feature

When a student uploads notes, Gemini reads the file. Then it:

- Writes a summary (abstract) of the submission.
- Suggests a tag for the submission.

The student can make the summary more verbose or more concise with one click.

## Stack

SvelteKit, Tailwind CSS, shadcn-svelte, Google Gemini (`gemini-1.5-flash`).

## Setup

1. Install the packages: `npm install`.
2. Copy `.env.example` to `.env`. Set your Gemini API key.
3. Start the development server: `npm run dev`.
