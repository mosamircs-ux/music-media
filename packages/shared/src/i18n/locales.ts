import type { Locale, Direction } from "../types";

export const LOCALES: readonly Locale[] = ["en", "ar"] as const;
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

export const LOCALE_LABELS: Record<Locale, { label: string; nativeName: string }> = {
  en: { label: "English", nativeName: "English" },
  ar: { label: "Arabic", nativeName: "العربية" },
};

export function getDirection(locale: Locale): Direction {
  return LOCALE_DIRECTIONS[locale] || "ltr";
}

export function isRTL(locale: Locale): boolean {
  return getDirection(locale) === "rtl";
}
