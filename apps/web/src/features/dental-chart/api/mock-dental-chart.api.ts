import { can, type Permission } from "@/lib/permissions";
import { canTransition, initialStatusFor, isInvoiceable } from "../lib/tooth-event-status";
import type { Actor, OdontogramRecord, SparseTeeth, StoredChart, ToothChartState, ToothEvent } from "../types";
import type { ApiError, ApiResult, DentalChartApi, NewToothEvent } from "./dental-chart.api";
import { seedRecords } from "./mock-data";

/**
 * In-memory implementation of {@link DentalChartApi} for the MVP front end.
 * It mirrors the backend rules the UI relies on (permissions, status
 * transitions, invoiceable statuses, chart updates on validation) so the
 * Fastify service can replace it without changing any component.
 */

const LATENCY_MS = 220;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function fail<T>(code: ApiError["code"], message: string): ApiResult<T> {
  return { error: { code, message } };
}

function ok<T>(data: T): ApiResult<T> {
  return { data: structuredClone(data) };
}

function now(): string {
  return new Date().toISOString();
}

function applyToSparse(sparse: SparseTeeth, tooth: number, patch: Partial<ToothChartState>): SparseTeeth {
  const key = String(tooth);
  return { ...sparse, [key]: { ...(sparse[key] ?? {}), ...structuredClone(patch) } };
}

export function createMockDentalChartApi(): DentalChartApi {
  const records: Record<string, OdontogramRecord> = seedRecords();
  let eventSeq = 1000;
  let invoiceSeq = 230;

  function guard(actor: Actor, permission: Permission): ApiError | null {
    return can(actor.role, permission) ? null : { code: "FORBIDDEN", message: `${actor.role} cannot ${permission}` };
  }

  function findEvent(eventId: string): { record: OdontogramRecord; event: ToothEvent } | null {
    for (const record of Object.values(records)) {
      const event = record.events.find((e) => e.id === eventId);
      if (event) return { record, event };
    }
    return null;
  }

  function bumpChart(record: OdontogramRecord, actor: Actor, mutate: (chart: StoredChart) => StoredChart): StoredChart {
    record.chart = { ...mutate(record.chart), version: record.chart.version + 1, updatedAt: now(), updatedBy: actor };
    return record.chart;
  }

  /** A validated charting change becomes part of the stored chart. */
  function applyEventChart(record: OdontogramRecord, event: ToothEvent, actor: Actor): void {
    const change = event.chart;
    if (!change) return;
    bumpChart(record, actor, (chart) =>
      change.target === "status"
        ? { ...chart, status: applyToSparse(chart.status, event.tooth, change.after) }
        : { ...chart, plan: applyToSparse(chart.plan ?? {}, event.tooth, change.after) },
    );
  }

  return {
    async listPatients() {
      await delay();
      return ok(Object.values(records).map((r) => r.patient));
    },

    async getOdontogram(patientId) {
      await delay();
      const record = records[patientId];
      return record ? ok(record) : fail("NOT_FOUND", "Patient not found");
    },

    async createToothEvents(patientId, input: NewToothEvent[], actor) {
      await delay();
      const denied = guard(actor, "events:create");
      if (denied) return { error: denied };
      const record = records[patientId];
      if (!record) return fail("NOT_FOUND", "Patient not found");
      if (input.length === 0) return fail("VALIDATION", "No tooth event to create");
      const status = initialStatusFor(actor.role);
      const created = input.map<ToothEvent>((e) => ({
        ...structuredClone(e),
        id: `te-${++eventSeq}`,
        patientId,
        status,
        createdBy: actor,
        createdAt: now(),
        ...(status === "validated" ? { validatedBy: actor, validatedAt: now() } : {}),
      }));
      record.events.push(...created);
      if (status === "validated") for (const event of created) applyEventChart(record, event, actor);
      return ok({ events: created, chart: record.chart });
    },

    async validateToothEvent(eventId, actor) {
      await delay();
      const denied = guard(actor, "clinical:validate");
      if (denied) return { error: denied };
      const found = findEvent(eventId);
      if (!found) return fail("NOT_FOUND", "Tooth event not found");
      const { record, event } = found;
      if (!canTransition(event.status, "validated")) return fail("CONFLICT", `Cannot validate a ${event.status} event`);
      Object.assign(event, { status: "validated", validatedBy: actor, validatedAt: now() });
      applyEventChart(record, event, actor);
      return ok({ event, chart: record.chart });
    },

    async rejectToothEvent(eventId, reason, actor) {
      await delay();
      const denied = guard(actor, "clinical:validate");
      if (denied) return { error: denied };
      if (reason.trim().length < 3) return fail("VALIDATION", "A rejection reason is required");
      const found = findEvent(eventId);
      if (!found) return fail("NOT_FOUND", "Tooth event not found");
      const { event } = found;
      if (!canTransition(event.status, "rejected")) return fail("CONFLICT", `Cannot reject a ${event.status} event`);
      Object.assign(event, { status: "rejected", rejectedReason: reason.trim(), validatedBy: actor, validatedAt: now() });
      return ok({ event });
    },

    async completeToothEvent(eventId, actor, appointmentId) {
      await delay();
      const denied = guard(actor, "clinical:validate");
      if (denied) return { error: denied };
      const found = findEvent(eventId);
      if (!found) return fail("NOT_FOUND", "Tooth event not found");
      const { record, event } = found;
      if (event.kind !== "planned" || !canTransition(event.status, "completed")) {
        return fail("CONFLICT", `Cannot complete a ${event.kind} ${event.status} event`);
      }
      Object.assign(event, { status: "completed", completedAt: now(), ...(appointmentId ? { appointmentId } : {}) });
      // The treatment is done: what the plan drew for this tooth is now its status.
      if (event.chart?.target === "plan") {
        bumpChart(record, actor, (chart) => ({ ...chart, status: applyToSparse(chart.status, event.tooth, event.chart!.after) }));
      }
      return ok({ event, chart: record.chart });
    },

    async savePlanChart(patientId, plan, actor) {
      await delay();
      const denied = guard(actor, "chart:edit");
      if (denied) return { error: denied };
      const record = records[patientId];
      if (!record) return fail("NOT_FOUND", "Patient not found");
      return ok(bumpChart(record, actor, (chart) => ({ ...chart, plan: plan ? structuredClone(plan) : null })));
    },

    async invoiceFromTreatment(patientId, eventIds, actor) {
      await delay();
      const denied = guard(actor, "billing:create");
      if (denied) return { error: denied };
      const record = records[patientId];
      if (!record) return fail("NOT_FOUND", "Patient not found");
      const events = record.events.filter((e) => eventIds.includes(e.id));
      if (events.length === 0) return fail("VALIDATION", "No treatment selected");
      const blocked = events.find((e) => !isInvoiceable(e.status) || !e.price);
      if (blocked) return fail("CONFLICT", `Tooth event ${blocked.id} is not invoiceable (${blocked.status})`);
      const total = events.reduce((sum, e) => sum + (e.price ?? 0), 0);
      const invoice = { id: `inv-${++invoiceSeq}`, number: `FAC-${new Date().getFullYear()}-${String(invoiceSeq).padStart(4, "0")}`, total, paid: 0, status: "unpaid" as const };
      record.invoices.push(invoice);
      record.patient.balance += total;
      for (const event of events) Object.assign(event, { status: "invoiced", invoiceId: invoice.id });
      return ok({ invoice, events });
    },
  };
}

export const dentalChartApi: DentalChartApi = createMockDentalChartApi();
