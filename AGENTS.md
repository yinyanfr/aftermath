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
- **Python runtime**: Pyodide (lazy-loaded from CDN, includes numpy/sympy/matplotlib)
- **i18n**: 4 locales — `zh-Hans` (default), `zh-Hant`, `en`, `ja`. All prefixed in URLs.
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
- Root `/` redirects to `/zh-Hans/`

## Key architecture decisions

- KaTeX CSS is loaded from CDN in `BaseLayout.astro`; math renders through remark-math/rehype-katex
- PythonEditor is a React island that lazy-loads Pyodide (~10MB) on demand
- In MDX files, `{` and `}` in LaTeX are interpreted as JSX — use `.md` files for math-heavy content, or escape braces
- The `~` path alias maps to `src/` (configured in both tsconfig.json and astro.config.mjs vite.resolve.alias)

## `textbooks/` directory

Holds Chinese highschool math textbook PDFs (B版 必修/选择性必修 vols 1–4). Gitignored — PDFs exist locally but are not committed. Do not reference file paths inside `textbooks/` as if they are guaranteed to be present.

## Astro 6 specifics

- Zod 4: import from `astro/zod`, not `astro:content`
- Content collections use Content Layer API: `defineCollection({ loader: glob({...}), schema: z.object({...}) })`
- `astro:schema` and `z from astro:content` are deprecated — use `astro/zod`
- `<ViewTransitions />` removed — use `<ClientRouter />` instead
