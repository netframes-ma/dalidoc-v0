"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { cn } from "@/lib/utils";
import { ARCH_HEIGHT, ARCH_TEETH, ARCH_WIDTH, toothPath } from "../lib/arch-geometry";
import type { ChartMarker } from "../lib/tooth-event-status";
import { toothName } from "../lib/tooth-names";

const MARKER_FILL: Record<ChartMarker, string> = {
  pending: "fill-[color-mix(in_srgb,var(--od-warning)_55%,var(--tooth))]",
  unsaved: "fill-[color-mix(in_srgb,var(--od-warning)_30%,var(--tooth))]",
  planned: "fill-[color-mix(in_srgb,var(--od-accent)_45%,var(--tooth))]",
  done: "fill-[color-mix(in_srgb,var(--od-success)_40%,var(--tooth))]",
};

interface Props {
  markers: ReadonlyMap<number, ChartMarker>;
  missing: ReadonlySet<number>;
  selected: number | null;
  onSelect?: (tooth: number) => void;
  /** `locator`: small, decorative, highlights the selected tooth only. */
  variant?: "navigator" | "locator";
  className?: string;
}

/**
 * The oval open-mouth FDI arch from the DaliDoc spec, used as an overview and
 * navigator next to the detailed engine chart: where each tooth sits, what is
 * waiting on it, and a way to jump to it (including for read-only roles).
 */
export function OvalDentalArch({ markers, missing, selected, onSelect, variant = "navigator", className }: Props) {
  const { t, locale } = useI18n();
  const locator = variant === "locator";

  return (
    <svg
      viewBox={`0 0 ${ARCH_WIDTH} ${ARCH_HEIGHT}`}
      className={cn("block h-auto w-full select-none", className)}
      role={locator ? "img" : "group"}
      aria-label={locator && selected ? t("arch.locatorLabel", { tooth: selected }) : t("arch.label")}
      style={{ direction: "ltr" }}
    >
      <ellipse cx="380" cy="282" rx="170" ry="96" className="fill-[color-mix(in_srgb,var(--fg)_4%,transparent)]" />
      <line x1="380" y1="40" x2="380" y2="520" className="stroke-border" strokeDasharray="3 6" />
      {!locator && (
        <g className="fill-muted-fg font-mono text-[19px]">
          <text x="380" y="250" textAnchor="middle">{t("arch.maxilla")}</text>
          <text x="380" y="322" textAnchor="middle">{t("arch.mandible")}</text>
          <text x="232" y="290" textAnchor="middle">{t("arch.patientRight")}</text>
          <text x="528" y="290" textAnchor="middle">{t("arch.patientLeft")}</text>
        </g>
      )}
      {ARCH_TEETH.map((g) => {
        const marker = markers.get(g.n);
        const isSelected = selected === g.n;
        const isMissing = missing.has(g.n);
        const label = `${t("tooth.label", { tooth: g.n })}, ${toothName(g.n, locale)}${marker ? `, ${t(`marker.${marker}`)}` : ""}`;
        const lx = g.x + g.nx * (g.h / 2 + 19);
        const ly = g.y + g.ny * (g.h / 2 + 19) + 7;
        const interactive = !locator && onSelect;
        return (
          <g
            key={g.n}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? label : undefined}
            aria-pressed={interactive ? isSelected : undefined}
            className={cn(interactive && "group cursor-pointer outline-none")}
            onClick={interactive ? () => onSelect(g.n) : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(g.n);
                    }
                  }
                : undefined
            }
          >
            <g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(1)})`}>
              <path
                d={toothPath(g.kind, g.w, g.h)}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeDasharray={marker === "unsaved" ? "5 4" : isMissing ? "4 5" : undefined}
                className={cn(
                  "transition-[fill,stroke] duration-200",
                  isMissing ? "fill-transparent stroke-tooth-edge" : marker ? MARKER_FILL[marker] : "fill-tooth",
                  isSelected ? "fill-primary stroke-primary" : !isMissing && "stroke-tooth-edge",
                  interactive && !isSelected && "group-hover:stroke-primary group-focus-visible:stroke-primary group-focus-visible:[stroke-width:3]",
                )}
              />
            </g>
            {!locator && (
              <text
                x={lx.toFixed(1)}
                y={ly.toFixed(1)}
                textAnchor="middle"
                className={cn("font-mono text-[21px]", isSelected ? "fill-primary font-semibold" : "fill-muted-fg")}
              >
                {g.n}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
