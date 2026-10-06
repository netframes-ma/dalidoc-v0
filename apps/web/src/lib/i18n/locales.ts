export const LOCALES = ["fr", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_META: Record<Locale, { label: string; intl: string; dir: "ltr" | "rtl" }> = {
  fr: { label: "Français", intl: "fr-MA", dir: "ltr" },
  en: { label: "English", intl: "en-GB", dir: "ltr" },
  ar: { label: "العربية", intl: "ar-MA", dir: "rtl" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
