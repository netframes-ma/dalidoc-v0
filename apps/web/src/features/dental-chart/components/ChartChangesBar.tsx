"use client";

import { Send, Undo2, Check } from "lucide-react";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import type { ChartWorkflow } from "../hooks/useChartWorkflow";

/**
 * Appears when the chart differs from the saved record. A dentist saves the
 * changes as validated findings; an assistant submits them for validation.
 */
export function ChartChangesBar({ workflow, isAssistant }: { workflow: ChartWorkflow; isAssistant: boolean }) {
  const { t } = useI18n();
  const { unsaved, unsavedTeeth, busy, actions } = workflow;
  if (unsaved.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label={t("changes.label")}
      className="mx-3 mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--od-warning)_35%,transparent)] bg-[color-mix(in_srgb,var(--frame)_92%,transparent)] px-4 py-3 shadow-lg backdrop-blur animate-in slide-in-from-bottom-2 fade-in-0 sm:mx-5"
    >
      <span aria-hidden className="dd-marker-dot" data-dd-marker="unsaved" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-frame-fg">
          {t("changes.title", { fields: unsaved.length, teeth: unsavedTeeth.length })}
        </p>
        <p className="truncate font-mono text-[11.5px] text-frame-muted">
          {t("changes.teeth")} {unsavedTeeth.join(" · ")}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="text-frame-fg hover:bg-white/8" onClick={actions.discardCharting} disabled={busy}>
        <Undo2 />
        {t("changes.discard")}
      </Button>
      <Button size="sm" onClick={() => void actions.saveCharting()} disabled={busy} className="bg-od-accent text-od-accent-fg">
        {isAssistant ? <Send /> : <Check />}
        {isAssistant ? t("changes.submit") : t("changes.save")}
      </Button>
    </div>
  );
}
