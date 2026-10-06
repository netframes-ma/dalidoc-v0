"use client";

import { ChevronDown, ChevronsUpDown, RotateCw, SearchX, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToothInfoSurface } from "react-advanced-odontogram";
import { useI18n, usePreferences } from "@/components/providers/AppProviders";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { can } from "@/lib/permissions";
import { BRAND_ON_DARK } from "@/lib/preferences";
import { dentalChartApi } from "../api/mock-dental-chart.api";
import { DEMO_USERS } from "../api/mock-data";
import * as engine from "../engine/engine";
import { useTileAnnotations, useToothSelection } from "../engine/hooks";
import { useChartWorkflow } from "../hooks/useChartWorkflow";
import { useOdontogramRecord } from "../hooks/useOdontogramRecord";
import type { ChartMarker } from "../lib/tooth-event-status";
import type { OdontogramRecord, PatientSummary } from "../types";
import { ChartStage } from "./ChartStage";
import { OdontogramEngine, useEngineReady } from "./OdontogramEngine";
import { PatientContextPanel } from "./PatientContextPanel";
import { PlanProposalsPanel } from "./PlanProposalsPanel";
import { SelectedToothDrawer } from "./SelectedToothDrawer";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

const ABSENT = new Set(["none", "no-tooth-after-extraction"]);

/** Schéma dentaire: the odontogram workspace for one patient. */
export function OdontogramWorkspace({ patientId }: { patientId: string }) {
  const { t } = useI18n();
  const { state, update, retry } = useOdontogramRecord(dentalChartApi, patientId);

  if (state.status === "loading") return <WorkspaceSkeleton />;
  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-xl px-5 py-16">
        <EmptyState
          icon={<SearchX />}
          title={state.error.code === "NOT_FOUND" ? t("workspace.notFound") : t("workspace.loadError")}
          description={state.error.code === "NOT_FOUND" ? t("workspace.notFoundHint") : undefined}
          action={
            state.error.code === "NOT_FOUND" ? null : (
              <Button variant="outline" onClick={retry}>
                <RotateCw />
                {t("common.retry")}
              </Button>
            )
          }
        />
      </div>
    );
  }
  return <ReadyWorkspace record={state.record} update={update} />;
}

function ReadyWorkspace({
  record,
  update,
}: {
  record: OdontogramRecord;
  update: (recipe: (record: OdontogramRecord) => OdontogramRecord) => void;
}) {
  const { prefs } = usePreferences();
  const canEdit = can(prefs.role, "chart:edit");
  return (
    <OdontogramEngine readOnly={!canEdit}>
      <Workspace record={record} update={update} canEdit={canEdit} />
    </OdontogramEngine>
  );
}

function Workspace({
  record,
  update,
  canEdit,
}: {
  record: OdontogramRecord;
  update: (recipe: (record: OdontogramRecord) => OdontogramRecord) => void;
  canEdit: boolean;
}) {
  const { t } = useI18n();
  const { prefs } = usePreferences();
  const actor = DEMO_USERS[prefs.role];
  const stageRef = useRef<HTMLElement>(null);
  const ready = useEngineReady(stageRef);
  const workflow = useChartWorkflow({ api: dentalChartApi, record, update, actor, engineReady: ready });
  const selection = useToothSelection(stageRef, canEdit, workflow.loaded);

  // The lightbox is dark in every theme, so the ring uses the brand's on-dark tone.
  useEffect(() => {
    if (ready) engine.setSelectionStyle(BRAND_ON_DARK[prefs.brand]);
  }, [ready, prefs.brand]);

  const describe = useCallback((_tooth: number, marker: ChartMarker) => t(`marker.${marker}`), [t]);
  useTileAnnotations(stageRef, workflow.loaded, workflow.markers, describe);

  const missing = useMemo(() => {
    const set = new Set<number>();
    for (const [key, state] of Object.entries(workflow.live?.teeth ?? {})) if (ABSENT.has(state.toothSelection)) set.add(Number(key));
    return set;
  }, [workflow.live]);

  const selectTooth = selection.select;

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-3 py-4 sm:px-5 sm:py-5">
      <WorkspaceHeader patient={record.patient} />
      <div className="animate-rise">
        <PatientContextPanel record={record} />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-4 animate-rise [animation-delay:60ms]">
          <ChartStage
            ref={stageRef}
            record={record}
            workflow={workflow}
            canEdit={canEdit}
            isAssistant={prefs.role === "assistant"}
            ready={workflow.loaded}
          />
          <div className="grid items-start gap-4 2xl:grid-cols-2">
            <PlanProposalsPanel workflow={workflow} onSelectTooth={selectTooth} />
            <ChartSummaryCard />
          </div>
        </div>
        <div className="animate-rise [animation-delay:120ms] xl:sticky xl:top-4">
          <SelectedToothDrawer
            tooth={selection.tooth}
            selectionCount={selection.count}
            record={record}
            workflow={workflow}
            canEdit={canEdit}
            missing={missing}
            onSelectTooth={selectTooth}
          />
        </div>
      </div>
    </div>
  );
}

function ChartSummaryCard() {
  const { t } = useI18n();
  return (
    <details className="group rounded-card border border-border bg-card shadow-soft">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{t("summary.title")}</span>
          <span className="mt-1 block text-[12.5px] text-muted-fg">{t("summary.description")}</span>
        </span>
        <ChevronDown className="size-4 text-muted-fg transition-transform group-open:rotate-180" />
      </summary>
      <div className="dd-info border-t border-border px-4 py-4">
        <ToothInfoSurface />
      </div>
    </details>
  );
}

function usePatients(): PatientSummary[] {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  useEffect(() => {
    let cancelled = false;
    dentalChartApi.listPatients().then((r) => {
      if (!cancelled && r.data) setPatients(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return patients;
}

function WorkspaceHeader({ patient }: { patient: PatientSummary }) {
  const { t } = useI18n();
  const patients = usePatients();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-1.5">
          <Users className="size-3.5" />
          {t("nav.patients")} <span aria-hidden>/</span> {patient.firstName} {patient.lastName}
        </p>
        <h1 className="mt-1.5 text-[26px] leading-tight font-semibold tracking-tight">{t("workspace.title")}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ms-auto">
            {t("workspace.switchPatient")}
            <ChevronsUpDown className="text-muted-fg" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>{t("workspace.demoPatients")}</DropdownMenuLabel>
          {patients.map((p) => (
            <DropdownMenuItem key={p.id} asChild disabled={p.id === patient.id}>
              <Link href={`/patients/${p.id}/odontogram`} className="h-auto py-2">
                <span className="leading-tight">
                  <span className="block font-medium">
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="block font-mono text-[11px] text-muted-fg">{p.fileNumber}</span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
