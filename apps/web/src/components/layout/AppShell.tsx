"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { useNow } from "@/lib/use-now";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./AppSidebar";
import { AppearanceMenu, LocaleMenu, RoleMenu } from "./PreferenceMenus";

function Clock() {
  const { fmt } = useI18n();
  const now = new Date(useNow()).toISOString();
  return (
    <time className="text-frame-fg tnum" suppressHydrationWarning>
      {fmt.weekdayDate(now)} · {fmt.time(now)}
    </time>
  );
}

/**
 * The MIRQAB frame: a dark grained bezel holding one rounded panel with the
 * rail sidebar and the page.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <TooltipProvider>
      <a
        href="#main"
        className="absolute start-4 -top-16 z-[300] rounded-full bg-primary px-4 py-2.5 text-primary-fg focus:top-4"
      >
        {t("app.skip")}
      </a>
      <div className="flex h-dvh flex-col px-2 pb-2 sm:px-3 sm:pb-3">
        <header className="flex h-11 shrink-0 items-center justify-between gap-4 ps-3 pe-2.5 font-mono text-[11.5px] text-frame-muted">
          <div className="flex min-w-0 items-baseline gap-3 overflow-hidden whitespace-nowrap">
            <b className="font-sans text-[12.5px] font-bold tracking-[0.22em] text-frame-fg">DALIDOC</b>
            <span className="truncate">{t("app.clinic")}</span>
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-od-warning shadow-[0_0_0_3px_color-mix(in_srgb,var(--od-warning)_22%,transparent)]" />
              {t("app.demo")}
            </span>
            <span className="hidden sm:inline">
              <Clock />
            </span>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-shell bg-bg shadow-[0_0_0_1px_color-mix(in_srgb,#ffffff_4%,transparent)] [background-image:radial-gradient(80%_42%_at_50%_-6%,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_72%)]">
          <aside className="hidden h-full shrink-0 border-e border-border bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] xl:block">
            <AppSidebar />
          </aside>

          <DialogPrimitive.Root open={navOpen} onOpenChange={setNavOpen}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-frame/50 xl:hidden" />
              <DialogPrimitive.Content className="fixed inset-y-0 start-0 z-50 bg-bg shadow-lg xl:hidden">
                <DialogPrimitive.Title className="sr-only">{t("nav.label")}</DialogPrimitive.Title>
                <AppSidebar onNavigate={() => setNavOpen(false)} />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-5">
              <Button variant="soft" size="icon" className="xl:hidden" aria-label={t("nav.open")} onClick={() => setNavOpen(true)}>
                <Menu />
              </Button>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="hidden h-10 items-center gap-2.5 rounded-full border border-border bg-card ps-1.5 pe-4 text-[12.5px] shadow-soft md:inline-flex">
                  <span className="grid size-7 place-items-center rounded-full bg-primary-tint font-mono text-[10.5px] font-semibold text-primary-dark dark:text-primary">
                    CA
                  </span>
                  <span className="truncate font-medium">{t("app.clinicShort")}</span>
                </span>
              </div>
              <LocaleMenu />
              <AppearanceMenu />
              <RoleMenu />
            </div>
            <main id="main" className="min-h-0 flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
