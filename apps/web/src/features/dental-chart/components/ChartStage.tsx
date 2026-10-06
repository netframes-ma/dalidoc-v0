"use client";

import { Download, FileJson, Image as ImageIcon, PenLine, Waves } from "lucide-react";
import { useMemo, type Ref } from "react";
import { OdontogramChartSurface } from "react-advanced-odontogram";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportChart, openPerio } from "../engine/engine";
import type { ChartWorkflow } from "../hooks/useChartWorkflow";
import type { ChartMarker } from "../lib/tooth-event-status";
import type { OdontogramRecord } from "../types";
import { ChartChangesBar } from "./ChartChangesBar";
import { ToothLegend } from "./ToothLegend";

interface Props {
  ref: Ref<HTMLElement>;
  record: OdontogramRecord;
  workflow: ChartWorkflow;
  canEdit: boolean;
  isAssistant: boolean;
  ready: boolean;
}

/**
 * The lightbox: React Advanced Odontogram's chart surface on an ink panel,
 * whatever the app theme — ivory teeth on dark, like a film on a viewer.
 * DaliDoc's workflow markers ride on the engine's tiles.
 */
export function ChartStage({ ref, record, workflow, canEdit, isAssistant, ready }: Props) {
  const { t, fmt } = useI18n();
  const counts = useMemo(() => {
    const map = new Map<ChartMarker, number>();
    for (const marker of workflow.markers.values()) map.set(marker, (map.get(marker) ?? 0) + 1);
    return map;
  }, [workflow.markers]);
  const chart = record.chart;

  return (
    <section
      ref={ref}
      aria-label={t("chart.label")}
      className="dd-lightbox dark relative isolate flex min-w-0 flex-col overflow-hidden rounded-card text-frame-fg shadow-lg"
    >
      <header className="flex flex-wrap items-start gap-x-4 gap-y-3 px-4 pt-4 sm:px-5">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-od-accent uppercase rtl:tracking-normal">
            {t("chart.eyebrow")}
          </p>
          <p className="mt-1 text-[12.5px] text-frame-muted">
            {t("chart.version", {
              version: chart.version,
              date: fmt.date(chart.updatedAt),
              by: chart.updatedBy?.name ?? "—",
            })}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {!canEdit && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/8 px-3 text-[12px] text-frame-fg">
              {t("chart.readOnly")}
            </span>
          )}
          {canEdit && isAssistant && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--od-warning)_16%,transparent)] px-3 text-[12px] text-od-warning">
              <PenLine className="size-3.5" />
              {t("chart.assistantMode")}
            </span>
          )}
          <Button variant="ghost" size="sm" className="text-frame-fg hover:bg-white/8" onClick={openPerio} disabled={!ready}>
            <Waves />
            <span className="max-sm:hidden">{t("chart.perio")}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-frame-fg hover:bg-white/8" disabled={!ready}>
                <Download />
                <span className="max-sm:hidden">{t("chart.export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("chart.exportLabel")}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => exportChart.fhir(`Patient/${record.patient.id}`)}>
                <FileJson />
                {t("chart.exportFhir")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportChart.svg()}>
                <ImageIcon />
                {t("chart.exportSvg")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportChart.png()}>
                <ImageIcon />
                {t("chart.exportPng")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="dd-chart relative min-h-[420px] px-1.5 pb-2 sm:px-3">
        <OdontogramChartSurface />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[11.5px] text-frame-muted">{t("chart.loading")}</span>
          </div>
        )}
      </div>

      <footer className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/8 px-4 py-3 text-frame-muted sm:px-5">
        <ToothLegend counts={counts} />
        <p className="ms-auto text-[11.5px]">{canEdit ? t("chart.hintEdit") : t("chart.hintRead")}</p>
      </footer>

      {canEdit && <ChartChangesBar workflow={workflow} isAssistant={isAssistant} />}
    </section>
  );
}
