import type { ChartTeeth, OdontogramRecord, ToothChartState, ToothEvent } from "../types";
import { materialize, sameValue } from "./chart-diff";

/**
 * The chart DaliDoc expects the engine to show for a record: the validated
 * chart plus every charting change still waiting for a dentist. Anything the
 * live engine shows beyond this is unsaved.
 */
export interface ReferenceChart {
  status: ChartTeeth;
  plan: ChartTeeth | null;
}

function pendingChartEvents(events: readonly ToothEvent[], target: "status" | "plan"): ToothEvent[] {
  return events.filter((e) => e.status === "pending_validation" && e.chart?.target === target);
}

/**
 * Apply a charting change to a plan tooth only where the plan still agrees
 * with the status it was copied from — a pending finding must not overwrite a
 * treatment the plan already draws.
 */
export function carryIntoPlan(
  plan: ToothChartState,
  before: Partial<ToothChartState>,
  after: Partial<ToothChartState>,
): ToothChartState {
  const next = { ...plan };
  for (const [field, value] of Object.entries(after)) {
    if (sameValue(plan[field], before[field])) next[field] = structuredClone(value);
  }
  return next;
}

export function composeReference(record: OdontogramRecord, template: ChartTeeth): ReferenceChart {
  const status = materialize(record.chart.status, template);
  const plan = record.chart.plan ? materialize(record.chart.plan, template) : null;

  for (const event of pendingChartEvents(record.events, "status")) {
    const key = String(event.tooth);
    const tooth = status[key];
    if (!tooth || !event.chart) continue;
    status[key] = { ...tooth, ...structuredClone(event.chart.after) };
    const planned = plan?.[key];
    if (plan && planned) plan[key] = carryIntoPlan(planned, event.chart.before, event.chart.after);
  }
  if (plan) {
    for (const event of pendingChartEvents(record.events, "plan")) {
      const key = String(event.tooth);
      const tooth = plan[key];
      if (tooth && event.chart) plan[key] = { ...tooth, ...structuredClone(event.chart.after) };
    }
  }
  return { status, plan };
}
