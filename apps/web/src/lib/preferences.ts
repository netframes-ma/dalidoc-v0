import type { Role } from "@/features/dental-chart/types";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./i18n/locales";
import { isRole } from "./permissions";

export const BRANDS = ["teal", "blue", "indigo", "violet", "fuchsia", "slate"] as const;
export type Brand = (typeof BRANDS)[number];
export type ThemePreference = "light" | "dark" | "system";

export interface Preferences {
  locale: Locale;
  theme: ThemePreference;
  brand: Brand;
  /** Demo only: switches the signed-in role to show role-based behaviour. */
  role: Role;
}

export const PREFS_COOKIE = "dalidoc.prefs.v1";

export const DEFAULT_PREFERENCES: Preferences = {
  locale: DEFAULT_LOCALE,
  theme: "system",
  brand: "teal",
  role: "dentist",
};

/** Swatch shown in the brand picker (the token itself lives in globals.css). */
export const BRAND_SWATCH: Record<Brand, string> = {
  teal: "#087482",
  blue: "#1d4ed8",
  indigo: "#4338ca",
  violet: "#6d28d9",
  fuchsia: "#a21caf",
  slate: "#334155",
};

function isBrand(value: unknown): value is Brand {
  return typeof value === "string" && (BRANDS as readonly string[]).includes(value);
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** Parse the preferences cookie, falling back field by field to the defaults. */
export function parsePreferences(raw: string | undefined): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw));
    if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;
    const v = value as Record<string, unknown>;
    return {
      locale: isLocale(v.locale) ? v.locale : DEFAULT_PREFERENCES.locale,
      theme: isTheme(v.theme) ? v.theme : DEFAULT_PREFERENCES.theme,
      brand: isBrand(v.brand) ? v.brand : DEFAULT_PREFERENCES.brand,
      role: isRole(v.role) ? v.role : DEFAULT_PREFERENCES.role,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function serializePreferences(prefs: Preferences): string {
  return encodeURIComponent(JSON.stringify(prefs));
}
