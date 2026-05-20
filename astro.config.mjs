import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { buildKnowledgeLinkData } from "./src/plugins/knowledge-link-index.mjs";
import { remarkKnowledgeLinks } from "./src/plugins/remark-knowledge-links.mjs";

const knowledgeLinkData = buildKnowledgeLinkData();

export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH || "/",
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkMath, [remarkKnowledgeLinks, knowledgeLinkData]],
      rehypePlugins: [rehypeKatex],
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "~": "/src",
      },
    },
  },
  i18n: {
    defaultLocale: "zh-hans",
    locales: [
      { path: "zh-hans", codes: ["zh-CN", "zh-Hans"] },
      { path: "zh-hant", codes: ["zh-TW", "zh-Hant"] },
      { path: "en-us", codes: ["en-US", "en"] },
      { path: "ja-jp", codes: ["ja-JP", "ja"] },
    ],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  markdown: {
    remarkPlugins: [remarkMath, [remarkKnowledgeLinks, knowledgeLinkData]],
    rehypePlugins: [rehypeKatex],
  },
});
