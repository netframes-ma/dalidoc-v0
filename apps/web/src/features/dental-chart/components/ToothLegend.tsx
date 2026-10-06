"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { cn } from "@/lib/utils";
import type { ChartMarker } from "../lib/tooth-event-status";

const ORDER: readonly ChartMarker[] = ["unsaved", "pending", "planned", "done"];

/** Legend for the workflow markers DaliDoc paints on the engine's tiles. */
export function ToothLegend({ counts, className }: { counts: ReadonlyMap<ChartMarker, number>; className?: string }) {
  const { t } = useI18n();
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)} aria-label={t("legend.label")}>
      {ORDER.map((marker) => (
        <li key={marker} className="inline-flex items-center gap-2 text-[11.5px]">
          <span aria-hidden className="dd-marker-dot" data-dd-marker={marker} />
          <span>{t(`marker.${marker}`)}</span>
          <span className="font-mono text-[11px] opacity-60 tnum">{counts.get(marker) ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}
