import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    resolve: {
      alias: {
        "~": "/src",
      },
    },
  },
  i18n: {
    defaultLocale: "zh-Hans",
    locales: [
      { path: "zh-Hans", codes: ["zh-CN", "zh-Hans"] },
      { path: "zh-Hant", codes: ["zh-TW", "zh-Hant"] },
      "en",
      "ja",
    ],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});