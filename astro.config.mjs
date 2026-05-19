import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH || "/",
  integrations: [react(), mdx()],
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
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
