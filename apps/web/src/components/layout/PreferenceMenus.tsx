"use client";

import { Check, Languages, Monitor, Moon, Sun, UserRoundCog } from "lucide-react";
import { useI18n, usePreferences } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_USERS } from "@/features/dental-chart/api/mock-data";
import type { Role } from "@/features/dental-chart/types";
import { LOCALE_META, LOCALES, type Locale } from "@/lib/i18n/locales";
import { ROLES } from "@/lib/permissions";
import { BRAND_SWATCH, BRANDS, type ThemePreference } from "@/lib/preferences";
import { cn, initials } from "@/lib/utils";

export function LocaleMenu() {
  const { t } = useI18n();
  const { prefs, update } = usePreferences();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="soft" size="icon" aria-label={t("prefs.language")}>
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("prefs.language")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={prefs.locale} onValueChange={(v) => update({ locale: v as Locale })}>
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l}>
              {LOCALE_META[l].label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const THEME_ICON = { light: Sun, dark: Moon, system: Monitor } as const;

export function AppearanceMenu() {
  const { t } = useI18n();
  const { prefs, update, isDark } = usePreferences();
  const Current = isDark ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="soft" size="icon" aria-label={t("prefs.appearance")}>
          <Current />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>{t("prefs.theme")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={prefs.theme} onValueChange={(v) => update({ theme: v as ThemePreference })}>
          {(["light", "dark", "system"] as const).map((theme) => {
            const Icon = THEME_ICON[theme];
            return (
              <DropdownMenuRadioItem key={theme} value={theme}>
                <Icon />
                {t(`prefs.theme.${theme}`)}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("prefs.brand")}</DropdownMenuLabel>
        <div className="flex flex-wrap gap-2 px-2.5 pt-1 pb-2" role="radiogroup" aria-label={t("prefs.brand")}>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              role="radio"
              aria-checked={prefs.brand === brand}
              aria-label={t(`prefs.brand.${brand}`)}
              onClick={() => update({ brand })}
              className={cn(
                "grid size-7 place-items-center rounded-full text-white ring-offset-2 ring-offset-popover transition-shadow",
                prefs.brand === brand && "ring-2 ring-fg",
              )}
              style={{ background: BRAND_SWATCH[brand] }}
            >
              {prefs.brand === brand && <Check className="size-3.5" />}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Demo-only: switch the signed-in role to see what each role can do on the chart. */
export function RoleMenu() {
  const { t } = useI18n();
  const { prefs, update } = usePreferences();
  const user = DEMO_USERS[prefs.role];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2.5 rounded-full bg-soft ps-1 pe-3.5 text-start transition-colors hover:bg-[color-mix(in_srgb,var(--fg)_11%,var(--bg))]"
        >
          <span className="grid size-8 place-items-center rounded-full bg-ink text-[11.5px] font-semibold text-ink-fg">
            {initials(user.name.replace(/^Dr\s+/, ""))}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[12.5px] font-semibold">{user.name}</span>
            <span className="block text-[11px] text-muted-fg">{t(`role.${prefs.role}`)}</span>
          </span>
          <UserRoundCog className="size-4 text-muted-fg" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t("prefs.demoRole")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={prefs.role} onValueChange={(v) => update({ role: v as Role })}>
          {ROLES.map((role) => (
            <DropdownMenuRadioItem key={role} value={role} className="h-auto py-1.5">
              <span className="leading-tight">
                <span className="block">{t(`role.${role}`)}</span>
                <span className="block text-[11.5px] text-muted-fg">{DEMO_USERS[role].name}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="h-auto py-1.5 text-[11.5px] leading-snug whitespace-normal">
          {t("prefs.demoRoleHint")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
