export const textbooks = [
  "compulsory-1",
  "compulsory-2",
  "compulsory-3",
  "compulsory-4",
  "elective-compulsory-1",
  "elective-compulsory-2",
  "elective-compulsory-3",
] as const;

export type Textbook = (typeof textbooks)[number];
