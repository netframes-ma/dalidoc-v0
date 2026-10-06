"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { createFormatters, type Formatters } from "@/lib/i18n/format";
import { LOCALE_META, type Locale } from "@/lib/i18n/locales";
import { translate, type MessageKey, type MessageVars } from "@/lib/i18n/messages";
import { PREFS_COOKIE, serializePreferences, type Preferences } from "@/lib/preferences";

interface PreferencesContextValue {
  prefs: Preferences;
  isDark: boolean;
  update: (patch: Partial<Preferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribeToScheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Holds the user's preferences (locale, theme, brand, demo role). The server
 * reads the same cookie, so the first paint already has the right language,
 * direction and brand; the inline script in the root layout resolves
 * "system" before paint.
 */
export function AppProviders({ initial, children }: { initial: Preferences; children: React.ReactNode }) {
  const [prefs, setPrefs] = useState(initial);
  const systemDark = useSyncExternalStore(
    subscribeToScheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
  const isDark = prefs.theme === "dark" || (prefs.theme === "system" && systemDark);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = prefs.locale;
    html.dir = LOCALE_META[prefs.locale].dir;
    html.dataset.themePref = prefs.theme;
    html.dataset.theme = isDark ? "dark" : "light";
    // React Advanced Odontogram styles its dark mode from a `.dark` ancestor.
    html.classList.toggle("dark", isDark);
    if (prefs.brand === "teal") delete html.dataset.brand;
    else html.dataset.brand = prefs.brand;
    document.cookie = `${PREFS_COOKIE}=${serializePreferences(prefs)}; path=/; max-age=31536000; samesite=lax`;
  }, [prefs, isDark]);

  const update = useCallback((patch: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...patch })), []);
  const value = useMemo(() => ({ prefs, isDark, update }), [prefs, isDark, update]);

  return (
    <PreferencesContext.Provider value={value}>
      {children}
      <Toaster
        position="bottom-right"
        dir={LOCALE_META[prefs.locale].dir}
        theme={isDark ? "dark" : "light"}
        toastOptions={{ classNames: { toast: "!rounded-xl !border-border !bg-popover !text-fg !shadow-lg" } }}
      />
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <AppProviders>");
  return ctx;
}

export interface I18n {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: MessageKey, vars?: MessageVars) => string;
  fmt: Formatters;
}

export function useI18n(): I18n {
  const { prefs } = usePreferences();
  const locale = prefs.locale;
  return useMemo(
    () => ({
      locale,
      dir: LOCALE_META[locale].dir,
      t: (key: MessageKey, vars?: MessageVars) => translate(locale, key, vars),
      fmt: createFormatters(locale),
    }),
    [locale],
  );
}
