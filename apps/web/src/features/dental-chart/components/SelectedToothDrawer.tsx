"use client";

import { ClipboardPlus, MousePointerClick, NotebookPen, PenLine, Stethoscope, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ToothControlsSurface } from "react-advanced-odontogram";
import { useI18n } from "@/components/providers/AppProviders";
import { useCan } from "@/components/common/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { quadrantOf, toothKind } from "@/lib/fdi";
import * as engine from "../engine/engine";
import { fieldGroup, type ChartWorkflow } from "../hooks/useChartWorkflow";
import { isActive, isPending, type ChartMarker } from "../lib/tooth-event-status";
import { toothName } from "../lib/tooth-names";
import type { OdontogramRecord, ToothEvent } from "../types";
import { AssistantDraftValidation } from "./AssistantDraftValidation";
import { OvalDentalArch } from "./OvalDentalArch";
import { CompletedTreatmentsSection, DiagnosisSection, NotesSection, PlannedTreatmentsSection } from "./ToothEventSections";
import { ToothEventForm, type FormKind } from "./ToothEventForm";
import { ToothTimeline } from "./ToothTimeline";

const MARKER_TONE = { pending: "warning", unsaved: "warning", planned: "brand", done: "success" } as const;

interface Props {
  tooth: number | null;
  selectionCount: number;
  record: OdontogramRecord;
  workflow: ChartWorkflow;
  canEdit: boolean;
  missing: ReadonlySet<number>;
  onSelectTooth: (tooth: number | null) => void;
}

/**
 * Everything about the selected tooth: findings drawn on the chart, entries
 * waiting for validation, diagnoses, planned and completed treatment, notes,
 * linked appointment and invoice, and the audit trail. The "Charting" tab
 * hosts the engine's own editing controls.
 */
export function SelectedToothDrawer({ tooth, selectionCount, record, workflow, canEdit, missing, onSelectTooth }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"flow" | "chart">("flow");

  return (
    <aside
      aria-label={t("drawer.label")}
      className="flex min-w-0 flex-col rounded-card border border-border bg-card shadow-soft xl:max-h-[calc(100dvh-9.5rem)]"
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as "flow" | "chart")} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <TabsList>
            <TabsTrigger value="flow">
              <Stethoscope />
              {t("drawer.tabFlow")}
            </TabsTrigger>
            {canEdit && (
              <TabsTrigger value="chart">
                <PenLine />
                {t("drawer.tabChart")}
              </TabsTrigger>
            )}
          </TabsList>
          {tooth !== null && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="ms-auto"
              aria-label={t("drawer.clear")}
              onClick={() => {
                engine.clearSelection();
                onSelectTooth(null);
              }}
            >
              <X />
            </Button>
          )}
        </div>

        <TabsContent value="flow" className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-5">
          {tooth === null ? (
            <Overview record={record} workflow={workflow} missing={missing} onSelectTooth={onSelectTooth} />
          ) : (
            <ToothDetail key={tooth} tooth={tooth} record={record} workflow={workflow} missing={missing} />
          )}
        </TabsContent>

        {canEdit && (
          <TabsContent
            value="chart"
            forceMount
            className="dd-controls min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-4 data-[state=inactive]:hidden"
          >
            <p className="mb-2 px-1 text-[12px] text-muted-fg">
              {selectionCount > 1
                ? t("drawer.chartMulti", { n: selectionCount })
                : tooth !== null
                  ? t("drawer.chartOne", { tooth })
                  : t("drawer.chartNone")}
            </p>
            <ToothControlsSurface />
          </TabsContent>
        )}
      </Tabs>
    </aside>
  );
}

function Overview({
  record,
  workflow,
  missing,
  onSelectTooth,
}: {
  record: OdontogramRecord;
  workflow: ChartWorkflow;
  missing: ReadonlySet<number>;
  onSelectTooth: (tooth: number) => void;
}) {
  const { t } = useI18n();
  const can = useCan();
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="flex items-center gap-2 text-[14px] font-semibold">
          <MousePointerClick className="size-4 text-muted-fg" />
          {t("drawer.pickTitle")}
        </p>
        <p className="mt-1 text-[12.5px] text-muted-fg">{t("drawer.pickHint")}</p>
      </div>
      <OvalDentalArch markers={workflow.markers} missing={missing} selected={null} onSelect={onSelectTooth} />
      <AssistantDraftValidation
        events={workflow.pending}
        workflow={workflow}
        canValidate={can("clinical:validate")}
        onSelectTooth={onSelectTooth}
      />
      {workflow.pending.length === 0 && (
        <p className="rounded-2xl bg-soft px-3.5 py-3 text-[12.5px] text-muted-fg">{t("drafts.none")}</p>
      )}
      <p className="text-[11.5px] text-muted-fg">{t("drawer.recordNote", { n: record.events.length })}</p>
    </div>
  );
}

function ToothDetail({
  tooth,
  record,
  workflow,
  missing,
}: {
  tooth: number;
  record: OdontogramRecord;
  workflow: ChartWorkflow;
  missing: ReadonlySet<number>;
}) {
  const { t, locale } = useI18n();
  const can = useCan();
  const [form, setForm] = useState<FormKind | null>(null);
  const events = useMemo(() => workflow.eventsByTooth.get(tooth) ?? [], [workflow.eventsByTooth, tooth]);
  const marker: ChartMarker | undefined = workflow.markers.get(tooth);
  const findings = useMemo(() => {
    void workflow.live;
    return engine.toothSummary(tooth);
  }, [tooth, workflow.live]);
  const unsavedGroups = useMemo(
    () => Array.from(new Set(workflow.unsaved.filter((c) => c.tooth === tooth).map((c) => fieldGroup(c.field)))),
    [tooth, workflow.unsaved],
  );

  const by = (pred: (e: ToothEvent) => boolean) => events.filter((e) => isActive(e) && !isPending(e) && pred(e));
  const pendingHere = events.filter(isPending);
  const sectionProps = { record, workflow };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{t("drawer.tooth")}</p>
          <p className="mt-1 font-mono text-[46px] leading-none font-semibold tracking-tight tnum">{tooth}</p>
          <p className="mt-2 text-[14px] leading-snug font-semibold">{toothName(tooth, locale)}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted-fg">
            <span className="font-mono">Q{quadrantOf(tooth)}</span> · {t(`kind.${toothKind(tooth)}`)}
            {missing.has(tooth) && <Badge>{t("drawer.missing")}</Badge>}
            {marker && (
              <Badge tone={MARKER_TONE[marker]} dot>
                {t(`marker.${marker}`)}
              </Badge>
            )}
          </p>
        </div>
        <OvalDentalArch variant="locator" markers={workflow.markers} missing={missing} selected={tooth} className="w-32 shrink-0" />
      </header>

      <section className="rounded-2xl bg-soft px-3.5 py-3">
        <h3 className="eyebrow mb-1.5">{t("drawer.findings")}</h3>
        {findings.length === 0 ? (
          <p className="text-[12.5px] text-muted-fg">{t("drawer.healthy")}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {findings.map((line) => (
              <li key={line} className="flex gap-2 text-[12.5px] leading-snug">
                <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-fg/50" />
                {line}
              </li>
            ))}
          </ul>
        )}
        {unsavedGroups.length > 0 && (
          <p className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5 text-[12px] text-warning">
            <span aria-hidden className="dd-marker-dot" data-dd-marker="unsaved" />
            {t("drawer.unsaved")} {unsavedGroups.map((g) => t(`field.${g}`)).join(", ")}
          </p>
        )}
      </section>

      <AssistantDraftValidation events={pendingHere} workflow={workflow} canValidate={can("clinical:validate")} />

      <DiagnosisSection events={by((e) => e.kind === "diagnosis")} {...sectionProps} />
      <PlannedTreatmentsSection events={by((e) => e.kind === "planned" && e.status === "validated")} {...sectionProps} />
      <CompletedTreatmentsSection
        events={by((e) => e.status === "completed" || e.status === "invoiced" || e.status === "paid")}
        {...sectionProps}
      />
      <NotesSection events={by((e) => e.kind === "note")} {...sectionProps} />

      {can("events:create") && (
        <div className="flex flex-col gap-2.5">
          {form ? (
            <ToothEventForm
              tooth={tooth}
              kind={form}
              busy={workflow.busy}
              onCancel={() => setForm(null)}
              onSubmit={(input) => workflow.actions.addEvents([input])}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setForm("diagnosis")}>
                <Stethoscope />
                {t("quick.diagnosis")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setForm("planned")}>
                <ClipboardPlus />
                {t("quick.planned")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setForm("note")}>
                <NotebookPen />
                {t("quick.note")}
              </Button>
            </div>
          )}
        </div>
      )}

      <Separator />
      <section>
        <h3 className="eyebrow mb-3">{t("timeline.title")}</h3>
        <ToothTimeline events={events} />
      </section>
    </div>
  );
}
