import ui from "./ui.ts";
import type { Locale } from "./ui.ts";

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Locale;
  return "zh-Hans";
}

export function useTranslations(lang: Locale) {
  return function t(key: keyof (typeof ui)["zh-Hans"]): string {
    return ui[lang][key] || ui["zh-Hans"][key];
  };
}