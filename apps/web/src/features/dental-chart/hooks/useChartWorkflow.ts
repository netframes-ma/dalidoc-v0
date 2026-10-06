"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/AppProviders";
import type { ApiError, ApiResult, DentalChartApi, NewToothEvent } from "../api/dental-chart.api";
import * as engine from "../engine/engine";
import { useEngineRevision } from "../engine/hooks";
import { ACTS, proposeActs, type ActProposal, type ProposalReason } from "../lib/acts";
import { changedTeeth, diffTeeth, groupByTooth, pickFields, sameValue, toSparse } from "../lib/chart-diff";
import { carryIntoPlan, composeReference } from "../lib/reference";
import { isActive, isPending, toothFlow, type ChartMarker } from "../lib/tooth-event-status";
import type { Actor, ChartFieldChange, ChartPayload, ChartTeeth, OdontogramRecord, ToothEvent } from "../types";

const REASON_FIELDS: Record<Exclude<ProposalReason, "other">, readonly string[]> = {
  extraction: ["toothSelection", "extractionPlan"],
  implant: ["toothSelection"],
  crown: ["restorationType", "restorationMaterial"],
  inlay: ["restorationType", "restorationMaterial"],
  veneer: ["restorationType", "restorationMaterial"],
  bridge: ["restorationType", "restorationMaterial", "bridgePillar"],
  filling: ["fillingSurfaces", "fillingSurfaceMaterials", "caries", "cariesSeverity"],
  endo: ["endo", "pulpDx", "apicalDx"],
  sealant: ["fissureSealing"],
};

interface Options {
  api: DentalChartApi;
  record: OdontogramRecord;
  update: (recipe: (record: OdontogramRecord) => OdontogramRecord) => void;
  actor: Actor;
  engineReady: boolean;
}

function upsertEvents(events: ToothEvent[], changed: ToothEvent[]): ToothEvent[] {
  const byId = new Map(changed.map((e) => [e.id, e]));
  const kept = events.map((e) => byId.get(e.id) ?? e);
  const added = changed.filter((e) => !events.some((x) => x.id === e.id));
  return [...kept, ...added];
}

/**
 * Keeps the odontogram engine and DaliDoc's tooth-event workflow in step:
 * loads the patient's chart into the engine, tracks what the user charted
 * since, and turns it into tooth events (validated for a dentist, pending for
 * an assistant). Rejecting or completing an event updates the chart.
 */
export function useChartWorkflow({ api, record, update, actor, engineReady }: Options) {
  const { t, locale } = useI18n();
  const revision = useEngineRevision(engineReady);
  const session = useSyncExternalStore(engine.subscribeSession, engine.getSession, () => null);
  const [busy, setBusy] = useState(0);
  const patientId = record.patient.id;
  const loaded = engineReady && session?.patientId === patientId;
  const template = loaded ? session.template : null;

  const reference = useMemo(() => (template ? composeReference(record, template) : null), [record, template]);

  // Load the patient's chart into the engine once it is ready (and on patient change).
  useEffect(() => {
    if (!engineReady || engine.getSession()?.patientId === patientId) return;
    engine.startSession(patientId, (healthy) => {
      const ref = composeReference(record, healthy);
      engine.loadChart(ref.status, ref.plan);
      engine.clearSelection();
    });
  }, [engineReady, patientId, record]);

  // The engine is torn down with its provider: forget the session with it.
  useEffect(() => () => engine.endSession(), []);

  const live = useMemo<ChartPayload | null>(() => {
    void revision;
    return loaded ? engine.readChart() : null;
  }, [loaded, revision]);

  const unsaved = useMemo<ChartFieldChange[]>(
    () => (live && reference ? diffTeeth(reference.status, live.teeth) : []),
    [live, reference],
  );
  const unsavedTeeth = useMemo(() => changedTeeth(unsaved), [unsaved]);

  const livePlan = useMemo<ChartTeeth | null>(() => (live?.plan ? engine.readPlanTeeth() : null), [live]);

  const proposals = useMemo<ActProposal[]>(() => {
    if (!live || !livePlan) return [];
    const covered = record.events.filter((e) => isActive(e) && (e.kind === "planned" || e.kind === "completed"));
    return proposeActs(live.teeth, livePlan).filter(
      (p) => !covered.some((e) => e.tooth === p.tooth && p.actCode !== null && e.actCode === p.actCode),
    );
  }, [live, livePlan, record.events]);

  const eventsByTooth = useMemo(() => {
    const map = new Map<number, ToothEvent[]>();
    for (const event of [...record.events].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      const list = map.get(event.tooth) ?? [];
      list.push(event);
      map.set(event.tooth, list);
    }
    return map;
  }, [record.events]);

  const pending = useMemo(
    () => record.events.filter((e) => isPending(e)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [record.events],
  );

  const markers = useMemo(() => {
    const map = new Map<number, ChartMarker>();
    for (const [tooth, events] of eventsByTooth) {
      const flow = toothFlow(events);
      if (flow) map.set(tooth, flow);
    }
    for (const tooth of unsavedTeeth) map.set(tooth, "unsaved");
    return map;
  }, [eventsByTooth, unsavedTeeth]);

  /* ── helpers ── */

  const errorMessage = useCallback(
    (error: ApiError) =>
      ({
        FORBIDDEN: t("error.forbidden"),
        NOT_FOUND: t("error.notFound"),
        CONFLICT: t("error.conflict"),
        VALIDATION: t("error.validation"),
      })[error.code],
    [t],
  );

  const run = useCallback(
    async <T,>(call: () => Promise<ApiResult<T>>, onData: (data: T) => void, success?: string) => {
      setBusy((n) => n + 1);
      try {
        const result = await call();
        if (result.error) {
          toast.error(errorMessage(result.error));
          return false;
        }
        onData(result.data);
        if (success) toast.success(success);
        return true;
      } finally {
        setBusy((n) => n - 1);
      }
    },
    [errorMessage],
  );

  /** Put `fields` of `tooth` back to `values` in the live chart (status and, where it followed, plan). */
  const revertLive = useCallback((tooth: number, before: Record<string, unknown>, after: Record<string, unknown>) => {
    const current = engine.readChart();
    const key = String(tooth);
    const state = current.teeth[key];
    if (!state) return;
    const teeth = { ...current.teeth, [key]: { ...state, ...structuredClone(before) } };
    let plan = current.plan ? engine.readPlanTeeth() : null;
    const planned = plan?.[key];
    if (plan && planned) plan = { ...plan, [key]: carryIntoPlan(planned, after, before) };
    engine.loadChart(teeth, plan);
  }, []);

  const summarize = useCallback(
    (tooth: number, changes: readonly ChartFieldChange[]) => {
      const lines = engine.toothSummary(tooth);
      if (lines.length > 0) return lines.join(" · ");
      return changes.map((c) => t(`field.${fieldGroup(c.field)}`)).filter((v, i, a) => a.indexOf(v) === i).join(", ");
    },
    [t],
  );

  /* ── actions ── */

  const saveCharting = useCallback(async () => {
    const ref = reference;
    if (!ref || !live || unsaved.length === 0) return;
    const inputs: NewToothEvent[] = [];
    for (const [tooth, changes] of groupByTooth(unsaved)) {
      const fields = changes.map((c) => c.field);
      inputs.push({
        tooth,
        kind: "diagnosis",
        summary: summarize(tooth, changes),
        chart: { target: "status", before: pickFields(ref.status[String(tooth)], fields), after: pickFields(live.teeth[String(tooth)], fields) },
      });
    }
    const asDraft = actor.role === "assistant";
    await run(
      () => api.createToothEvents(patientId, inputs, actor),
      (data) => update((r) => ({ ...r, events: upsertEvents(r.events, data.events), chart: data.chart })),
      t(asDraft ? "toast.submitted" : "toast.saved", { n: inputs.length }),
    );
  }, [actor, api, live, patientId, reference, run, summarize, t, unsaved, update]);

  const discardCharting = useCallback(() => {
    const ref = reference;
    if (!ref || !live) return;
    const teeth = { ...live.teeth };
    for (const tooth of unsavedTeeth) {
      const key = String(tooth);
      if (ref.status[key]) teeth[key] = structuredClone(ref.status[key]);
    }
    engine.loadChart(teeth, live.plan ? engine.readPlanTeeth() : null);
    toast(t("toast.discarded"));
  }, [live, reference, t, unsavedTeeth]);

  const validate = useCallback(
    (event: ToothEvent) =>
      run(
        () => api.validateToothEvent(event.id, actor),
        (data) => update((r) => ({ ...r, events: upsertEvents(r.events, [data.event]), chart: data.chart })),
        t("toast.validated", { tooth: event.tooth }),
      ),
    [actor, api, run, t, update],
  );

  const reject = useCallback(
    (event: ToothEvent, reason: string) =>
      run(
        () => api.rejectToothEvent(event.id, reason, actor),
        (data) => {
          update((r) => ({ ...r, events: upsertEvents(r.events, [data.event]) }));
          if (event.chart?.target === "status") revertLive(event.tooth, event.chart.before, event.chart.after);
        },
        t("toast.rejected", { tooth: event.tooth }),
      ),
    [actor, api, revertLive, run, t, update],
  );

  const complete = useCallback(
    (event: ToothEvent) => {
      const today = record.appointments.find((a) => new Date(a.start).toDateString() === new Date().toDateString());
      return run(
        () => api.completeToothEvent(event.id, actor, today?.id),
        (data) => {
          update((r) => ({ ...r, events: upsertEvents(r.events, [data.event]), chart: data.chart }));
          if (event.chart?.target === "plan") {
            const current = engine.readChart();
            const key = String(event.tooth);
            const state = current.teeth[key];
            if (state) {
              engine.loadChart(
                { ...current.teeth, [key]: { ...state, ...structuredClone(event.chart.after) } },
                current.plan ? engine.readPlanTeeth() : null,
              );
            }
          }
        },
        t("toast.completed", { tooth: event.tooth }),
      );
    },
    [actor, api, record.appointments, run, t, update],
  );

  const addEvents = useCallback(
    (inputs: NewToothEvent[]) =>
      run(
        () => api.createToothEvents(patientId, inputs, actor),
        (data) => update((r) => ({ ...r, events: upsertEvents(r.events, data.events), chart: data.chart })),
        t(actor.role === "assistant" ? "toast.submitted" : "toast.saved", { n: inputs.length }),
      ),
    [actor, api, patientId, run, t, update],
  );

  const planFromProposals = useCallback(
    async (selected: readonly ActProposal[]) => {
      if (!live || !livePlan || !template) return;
      const byTooth = groupByTooth(diffTeeth(live.teeth, livePlan));
      const inputs: NewToothEvent[] = selected
        .filter((p): p is ActProposal & { actCode: NonNullable<ActProposal["actCode"]> } => p.actCode !== null)
        .map((p) => {
          const fields = p.reason === "other" ? (byTooth.get(p.tooth) ?? []).map((c) => c.field) : REASON_FIELDS[p.reason];
          const act = ACTS[p.actCode];
          return {
            tooth: p.tooth,
            kind: "planned" as const,
            actCode: p.actCode,
            price: act.price,
            surfaces: p.surfaces,
            summary: act.label[locale],
            chart: {
              target: "plan" as const,
              before: pickFields(live.teeth[String(p.tooth)], fields),
              after: pickFields(livePlan[String(p.tooth)], fields),
            },
          };
        });
      if (inputs.length === 0) return;
      const planSaved = await run(
        () => api.savePlanChart(patientId, toSparse(livePlan, template), actor),
        (chart) => update((r) => ({ ...r, chart })),
      );
      if (!planSaved) return;
      await addEvents(inputs);
    },
    [actor, addEvents, api, live, livePlan, locale, patientId, run, template, update],
  );

  const invoice = useCallback(
    (events: readonly ToothEvent[]) =>
      run(
        () => api.invoiceFromTreatment(patientId, events.map((e) => e.id), actor),
        (data) =>
          update((r) => ({
            ...r,
            events: upsertEvents(r.events, data.events),
            invoices: [...r.invoices, data.invoice],
            patient: { ...r.patient, balance: r.patient.balance + data.invoice.total },
          })),
        t("toast.invoiced"),
      ),
    [actor, api, patientId, run, t, update],
  );

  /** True when the live chart still shows a pending draft's change for that tooth. */
  const isDraftOnChart = useCallback(
    (event: ToothEvent) => {
      const state = live?.teeth[String(event.tooth)];
      if (!state || !event.chart) return false;
      return Object.entries(event.chart.after).every(([field, value]) => sameValue(state[field], value));
    },
    [live],
  );

  return {
    loaded,
    live,
    unsaved,
    unsavedTeeth,
    proposals,
    eventsByTooth,
    pending,
    markers,
    busy: busy > 0,
    isDraftOnChart,
    actions: { saveCharting, discardCharting, validate, reject, complete, addEvents, planFromProposals, invoice },
  };
}

export type ChartWorkflow = ReturnType<typeof useChartWorkflow>;

/** Groups the engine's ~60 per-tooth fields into the handful a clinician recognises. */
export function fieldGroup(field: string): FieldGroup {
  if (["toothSelection", "toothSubstrate", "extractionPlan", "extractionWound", "missingClosed"].includes(field)) return "presence";
  if (/^(restoration|prosthesis|bridge|crown)/.test(field)) return "restoration";
  if (/^(caries|rootCaries|radiographicDepth)/.test(field)) return "caries";
  if (/^(filling|fissureSealing|parapulpalPin)/.test(field)) return "filling";
  if (/^(endo|pulp)/.test(field)) return "endo";
  if (/^(apical|periapical|resorption|mods)/.test(field)) return "apical";
  if (/^(perio|mobility|calculus|furcation|plaque|periImplant|pi|gi|cej|kg|gt|miller)/.test(field)) return "perio";
  if (/^ortho/.test(field)) return "ortho";
  if (/^(wear|discoloration|broken|contact)/.test(field)) return "surface";
  return "other";
}

export type FieldGroup = "presence" | "restoration" | "caries" | "filling" | "endo" | "apical" | "perio" | "ortho" | "surface" | "other";
