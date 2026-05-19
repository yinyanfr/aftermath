import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import prettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", "public/vendor/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  prettier,
);
