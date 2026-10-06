import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { LOCALE_META } from "@/lib/i18n/locales";
import { parsePreferences, PREFS_COOKIE } from "@/lib/preferences";

export const metadata: Metadata = {
  title: { default: "DaliDoc", template: "%s · DaliDoc" },
  description: "Logiciel de gestion de cabinet dentaire — schéma dentaire, agenda, facturation.",
};

export const viewport: Viewport = {
  themeColor: "#111720",
};

/** Resolves the "system" theme before first paint so the page never flashes the wrong theme. */
const THEME_SCRIPT = `(function(){try{var d=document.documentElement,p=d.getAttribute("data-theme-pref")||"system",k=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);d.setAttribute("data-theme",k?"dark":"light");d.classList.toggle("dark",k)}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const prefs = parsePreferences((await cookies()).get(PREFS_COOKIE)?.value);
  const explicitDark = prefs.theme === "dark";
  return (
    <html
      lang={prefs.locale}
      dir={LOCALE_META[prefs.locale].dir}
      data-theme-pref={prefs.theme}
      data-theme={prefs.theme === "system" ? undefined : prefs.theme}
      data-brand={prefs.brand === "teal" ? undefined : prefs.brand}
      className={explicitDark ? "dark" : undefined}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AppProviders initial={prefs}>{children}</AppProviders>
      </body>
    </html>
  );
}
