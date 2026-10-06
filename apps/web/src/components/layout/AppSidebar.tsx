"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/AppProviders";
import { DEFAULT_PATIENT_ID } from "@/features/dental-chart/api/mock-data";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";
import { NAV } from "./nav";

export function AppSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const patientId = /\/patients\/([^/]+)/.exec(pathname)?.[1] ?? DEFAULT_PATIENT_ID;

  return (
    <nav aria-label={t("nav.label")} className={cn("flex h-full w-[252px] flex-col px-3.5 pt-5 pb-3.5", className)}>
      <div className="flex items-center gap-3 px-1 pb-5">
        <BrandMark />
        <div className="min-w-0">
          <p className="text-[17px] leading-none font-bold tracking-[0.14em]">DALIDOC</p>
          <p className="mt-1.5 truncate font-mono text-[10.5px] text-muted-fg">{t("app.caption")}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const href = item.href?.(patientId);
          const active = item.match?.test(pathname) ?? false;
          const content = (
            <>
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
              <span className="truncate">{t(item.key)}</span>
              {!href && <span className="sr-only"> — {t("nav.soon")}</span>}
            </>
          );
          const base = "flex h-10 items-center gap-3 rounded-full px-3.5 text-[13.5px] font-medium transition-colors";
          return (
            <li key={item.key}>
              {href ? (
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(base, active ? "bg-nav-active text-primary-dark dark:text-primary" : "text-fg hover:bg-soft")}
                >
                  {content}
                </Link>
              ) : (
                <span aria-disabled title={t("nav.soon")} className={cn(base, "cursor-default text-muted-fg/75")}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-auto rounded-2xl border border-dashed border-border p-3 text-[12px] leading-snug text-muted-fg">
        {t("app.roadmapNote")}
      </div>
    </nav>
  );
}
