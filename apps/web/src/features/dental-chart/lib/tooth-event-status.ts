import type { Role, ToothEvent, ToothEventStatus } from "../types";

/**
 * Allowed tooth-event transitions. Clinical history is append-only: an event is
 * never deleted, it moves to `rejected` or `cancelled` and stays in the timeline.
 */
const TRANSITIONS: Record<ToothEventStatus, readonly ToothEventStatus[]> = {
  draft: ["pending_validation", "validated", "cancelled"],
  pending_validation: ["validated", "rejected"],
  validated: ["completed", "invoiced", "cancelled"],
  rejected: [],
  cancelled: [],
  completed: ["invoiced"],
  invoiced: ["paid"],
  paid: [],
};

export function canTransition(from: ToothEventStatus, to: ToothEventStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Only validated or completed tooth events can be invoiced. */
export function isInvoiceable(status: ToothEventStatus): boolean {
  return status === "validated" || status === "completed";
}

/** Entries made by an assistant wait for a dentist; dentists and owners sign their own. */
export function initialStatusFor(role: Role): ToothEventStatus {
  return role === "assistant" ? "pending_validation" : "validated";
}

export function isPending(event: Pick<ToothEvent, "status">): boolean {
  return event.status === "pending_validation" || event.status === "draft";
}

/** Events that still describe the tooth (rejected/cancelled ones only remain in the timeline). */
export function isActive(event: Pick<ToothEvent, "status">): boolean {
  return event.status !== "rejected" && event.status !== "cancelled";
}

export type StatusTone = "neutral" | "warning" | "brand" | "success" | "danger" | "info";

export const STATUS_TONE: Record<ToothEventStatus, StatusTone> = {
  draft: "neutral",
  pending_validation: "warning",
  validated: "brand",
  rejected: "danger",
  cancelled: "neutral",
  completed: "success",
  invoiced: "info",
  paid: "success",
};

/** What a tooth shows on the chart, by priority. */
export type ToothFlow = "pending" | "planned" | "done";

/** Chart marker: the workflow state, or edits on the chart that are not saved yet. */
export type ChartMarker = ToothFlow | "unsaved";

export function toothFlow(events: readonly ToothEvent[]): ToothFlow | null {
  const active = events.filter(isActive);
  if (active.some(isPending)) return "pending";
  if (active.some((e) => e.kind === "planned" && e.status === "validated")) return "planned";
  if (active.some((e) => e.status === "completed" || e.status === "invoiced" || e.status === "paid")) return "done";
  return null;
}
