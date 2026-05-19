import ui from "./ui.ts";
import type { Locale } from "./ui.ts";

function normalizeBase(base: string) {
  if (!base || base === "/") return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function stripBase(pathname: string) {
  const base = normalizeBase(import.meta.env.BASE_URL || "/");
  if (base && pathname.startsWith(`${base}/`))
    return pathname.slice(base.length);
  return pathname;
}

export function withBase(path: string) {
  const base = normalizeBase(import.meta.env.BASE_URL || "/");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function getLangFromUrl(url: URL): Locale {
  const pathname = stripBase(url.pathname);
  const [, lang] = pathname.split("/");
  if (lang in ui) return lang as Locale;
  return "zh-hans";
}

export function useTranslations(lang: Locale) {
  return function t(key: string): unknown {
    const current = ui[lang] as Record<string, unknown>;
    const fallback = ui["zh-hans"] as Record<string, unknown>;
    return current[key] ?? fallback[key];
  };
}
