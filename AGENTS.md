# AGENTS.md

## Commands

- `npm run dev` — Start dev server
- `npm run lint` — ESLint
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check
- `npm run check` — Lint, format check, build
- `npm run build` — Production build (static SSG)
- `npm run preview` — Preview production build

Pre-commit runs `lint-staged` via Husky. GitHub Actions runs `npm run check`.

## Tech stack

- **Framework**: Astro 6 (SSG mode) + React islands
- **UI**: Ant Design 6, CSS Modules for custom styles
- **Content**: MDX + Markdown with remark-math / rehype-katex for LaTeX
- **Code editor**: CodeMirror 6 (Python language support)
- **Python runtime**: Pyodide (lazy-loaded from local static assets, includes numpy/sympy/matplotlib)
- **i18n**: 4 locales — `zh-hans` (default), `zh-hant`, `en-us`, `ja-jp`. All prefixed in URLs.
- **Node**: Requires 22.12+

## Content structure

Content is in `src/content/` organized by textbook in English:

- `compulsory-1` through `compulsory-4` (必修)
- `elective-compulsory-1` through `elective-compulsory-3` (选择性必修)

Each MD/MDX file has frontmatter: `title`, `description`, `order`, `textbook`, `chapter`, `tags`.

Content collection is defined in `src/content.config.ts` using Astro's Content Layer API with `glob()` loader. Zod is imported from `astro/zod` (Zod 4, not `astro:content`).

## i18n

- Locale strings and translations live in `src/i18n/ui.ts`
- Utility functions in `src/i18n/utils.ts`
- Astro i18n routing configured in `astro.config.mjs` with `prefixDefaultLocale: true`
- URL pattern: `/{locale}/{textbook}/{chapter}/{slug}/`
- Root `/` redirects to `/zh-hans/`

## Key architecture decisions

- KaTeX CSS is loaded locally in `BaseLayout.astro`; math renders through remark-math/rehype-katex
- PythonEditor is a React island that lazy-loads Pyodide (~10MB) on demand
- In MDX files, `{` and `}` in LaTeX are interpreted as JSX — use `.md` files for math-heavy content, or escape braces
- The `~` path alias maps to `src/` (configured in both tsconfig.json and astro.config.mjs vite.resolve.alias)
- GitHub Pages deployment uses a configurable Astro `base`; when writing links or static asset URLs, keep them base-aware rather than hardcoding root-relative paths.

## `textbooks/` directory

Holds Chinese highschool math textbook PDFs (B版 必修/选择性必修 vols 1–4). Gitignored — PDFs exist locally but are not committed. Do not reference file paths inside `textbooks/` as if they are guaranteed to be present.

## Astro 6 specifics

- Zod 4: import from `astro/zod`, not `astro:content`
- Content collections use Content Layer API: `defineCollection({ loader: glob({...}), schema: z.object({...}) })`
- `astro:schema` and `z from astro:content` are deprecated — use `astro/zod`
- `<ViewTransitions />` removed — use `<ClientRouter />` instead

## Content authoring rules

- The goal is not to copy textbook text verbatim. Rebuild each textbook into a complete beginner-friendly online course for learners with only junior-high-school math background.
- Before writing any lesson pages for a textbook, first read its table of contents and relevant source material, extract a structured outline, then split that outline into web pages.
- Page splitting may go finer than the textbook's original chapter/section structure when that improves teaching clarity.
- Each page must cover one complete knowledge unit with clear boundaries. A page may center on one concept, one definition with its direct applications, one theorem with its proof idea and uses, or one tightly related cluster of subtopics. Do not mix unrelated ideas into the same page.
- Assume the learner is completely new to high-school math. Do not skip conceptual bridges, notation explanations, or algebraic steps that a beginner would not infer alone.
- Use guided, classroom-style teaching language. Introduce motivation first, then definitions or conclusions, then explain why they are formulated that way, and finally teach how to use them through examples and step-by-step reasoning.
- For every definition, axiom, theorem, formula, and mathematical conclusion appearing on a page, provide detailed explanation, conditions of use, intuitive meaning, and the derivation, proof sketch, or inference chain needed for a beginner to follow it.
- Avoid phrases that hide reasoning such as "obviously" or "it follows directly" unless the intermediate steps are explicitly written out.
- Each lesson page should normally include: learning goal or motivation, prerequisite reminders, formal statements, intuitive explanation, derivation/proof, worked examples, method summary or common mistakes, and end-of-page exercises.
- Every page must end with exactly five exercises.
- Exercises 1-3 must focus on foundational understanding and direct use of definitions, theorems, or conclusions, with difficulty aligned to textbook examples.
- Exercises 4-5 must be raised to gaokao major-problem difficulty, even for early chapters. They should still stay within the page's knowledge scope and not depend on content the learner has not studied yet.
- Every exercise must include three parts: the final answer, a full mathematical explanation, and a Python implementation.
- Python code is not optional decoration. Use it to verify results, inspect patterns, enumerate cases, or otherwise support mathematical understanding.
- When planning content, preserve the textbook's overall progression, but optimize page granularity and explanation order for teaching effectiveness.

## Lesson page template

Use the following template when drafting each lesson page. Adapt the exact heading names if needed, but do not drop any required teaching function.

1. **Learning goal / motivation**
   - Start from the learner's current confusion or a concrete problem.
   - Explain what this page will solve and why this knowledge matters.
2. **Prerequisite reminders**
   - Briefly restate the junior-high or earlier page knowledge needed for this lesson.
   - Re-explain symbols or notation if a beginner may not remember them.
3. **Formal definitions / statements**
   - State the definition, axiom, theorem, formula, or conclusion precisely.
   - If there are conditions of use, list them explicitly.
4. **Intuitive explanation**
   - Translate the formal statement into beginner-friendly language.
   - Explain why the concept is introduced and what problem it solves.
5. **Derivation / proof / inference chain**
   - Show the reasoning step by step.
   - Do not skip algebraic transformations or logical transitions that a beginner would not infer alone.
   - If the result is not fully proved at this stage, still give a proof sketch or a transparent inference path.
6. **Worked examples**
   - Give several examples that move from direct application to slightly deeper use.
   - For each example, show the complete thought process, not just the final computation.
7. **Method summary / common mistakes**
   - Summarize how to recognize when to use the new knowledge.
   - Point out easy confusions, misuse of conditions, notation mistakes, or typical dead ends.
8. **Exercises**
   - End every page with exactly five exercises.
   - Exercises 1-3: foundational practice aligned with textbook example difficulty.
   - Exercises 4-5: gaokao major-problem difficulty, but still strictly limited to this page's knowledge scope.
9. **Exercise solutions**
   - For every exercise, include:
     - final answer
     - full mathematical explanation
     - Python implementation

## Suggested lesson page outline

When writing Markdown or MDX pages, use this structure as the default starting point:

```md
---
title: ...
description: ...
order: ...
textbook: ...
chapter: ...
tags:
  - ...
pythonSnippets:
  - title: ...
    description: ...
    code: |
      ...
---

# ...

## 学习目标

## 为什么要学这个内容

## 预备知识

## 概念 / 定义 / 定理

## 直观理解

## 推导或证明

## 例题 1

## 例题 2

## 方法总结

## 常见错误

## 练习 1

### 答案

### 讲解

### Python 实现

## 练习 2

### 答案

### 讲解

### Python 实现

## 练习 3

### 答案

### 讲解

### Python 实现

## 练习 4

### 答案

### 讲解

### Python 实现

## 练习 5

### 答案

### 讲解

### Python 实现
```

## Page planning checklist

Before writing a page, confirm all of the following:

- This page teaches one complete knowledge unit rather than multiple unrelated topics.
- The learner can understand the page with only junior-high-school math background plus explicitly listed prerequisites.
- Every formal statement has its meaning, conditions, and reasoning chain explained.
- The examples are sufficient to bridge from concept understanding to actual problem solving.
- Exercises 4-5 are difficult enough to feel like gaokao major problems without requiring unstated future knowledge.
- Every exercise includes answer, full explanation, and Python code.
