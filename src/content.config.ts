import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const knowledgePoints = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number(),
    textbook: z.enum([
      "compulsory-1",
      "compulsory-2",
      "compulsory-3",
      "compulsory-4",
      "elective-compulsory-1",
      "elective-compulsory-2",
      "elective-compulsory-3",
    ]),
    chapter: z.string(),
    tags: z.array(z.string()).optional(),
    aliases: z.array(z.string()).optional(),
    pythonSnippet: z.string().optional(),
    pythonSnippets: z.array(z.string()).optional(),
  }),
});

export const collections = { knowledgePoints };
