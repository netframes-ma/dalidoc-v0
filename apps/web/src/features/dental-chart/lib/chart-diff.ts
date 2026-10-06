import type { ChartFieldChange, ChartTeeth, SparseTeeth, ToothChartState, ToothNumber } from "../types";

/**
 * Pure helpers over the engine's chart payloads. They never touch the engine,
 * so they run in unit tests and on the server alike.
 */

/** Fields that are UI/session state rather than clinical findings. */
const IGNORED_FIELDS = new Set(["customStates", "cariesActiveDepth", "note"]);

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(normalize);
    return items.every((v) => typeof v !== "object" || v === null) ? [...items].sort() : items;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, normalize(v)] as const);
    return Object.fromEntries(entries);
  }
  return value;
}

export function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

/** Field-level differences, tooth by tooth, in FDI chart order of the `after` payload. */
export function diffTeeth(before: ChartTeeth, after: ChartTeeth): ChartFieldChange[] {
  const teeth = Array.from(new Set([...Object.keys(after), ...Object.keys(before)]));
  const changes: ChartFieldChange[] = [];
  for (const key of teeth) {
    const a = before[key] ?? ({} as ToothChartState);
    const b = after[key] ?? ({} as ToothChartState);
    const fields = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const field of fields) {
      if (IGNORED_FIELDS.has(field)) continue;
      if (!sameValue(a[field], b[field])) changes.push({ tooth: Number(key), field, from: a[field], to: b[field] });
    }
  }
  return changes;
}

export function changedTeeth(changes: readonly ChartFieldChange[]): ToothNumber[] {
  return Array.from(new Set(changes.map((c) => c.tooth)));
}

export function groupByTooth(changes: readonly ChartFieldChange[]): Map<ToothNumber, ChartFieldChange[]> {
  const out = new Map<ToothNumber, ChartFieldChange[]>();
  for (const change of changes) {
    const list = out.get(change.tooth) ?? [];
    list.push(change);
    out.set(change.tooth, list);
  }
  return out;
}

/** Keep only what differs from the healthy mouth `template` — the shape the API stores. */
export function toSparse(teeth: ChartTeeth, template: ChartTeeth): SparseTeeth {
  const out: SparseTeeth = {};
  for (const [key, state] of Object.entries(teeth)) {
    const healthy = template[key] ?? ({} as ToothChartState);
    const delta: Partial<ToothChartState> = {};
    for (const [field, value] of Object.entries(state)) {
      if (IGNORED_FIELDS.has(field)) continue;
      if (!sameValue(value, healthy[field])) delta[field] = clone(value);
    }
    if (Object.keys(delta).length > 0) out[key] = delta;
  }
  return out;
}

/** Expand a sparse chart over a healthy tooth template for every tooth in `template`. */
export function materialize(sparse: SparseTeeth, template: ChartTeeth): ChartTeeth {
  const out: ChartTeeth = {};
  for (const [key, healthy] of Object.entries(template)) {
    out[key] = { ...clone(healthy), ...clone(sparse[key] ?? {}) } as ToothChartState;
  }
  return out;
}

/** The subset of a tooth's state named by `fields`. */
export function pickFields(state: ToothChartState | undefined, fields: readonly string[]): Partial<ToothChartState> {
  const out: Partial<ToothChartState> = {};
  if (!state) return out;
  for (const field of fields) out[field] = clone(state[field]);
  return out;
}

/** Apply per-tooth partial states on top of `teeth` (returns a new object). */
export function applyPatches(teeth: ChartTeeth, patches: Record<string, Partial<ToothChartState>>): ChartTeeth {
  const out = clone(teeth);
  for (const [key, patch] of Object.entries(patches)) {
    const current = out[key];
    if (current) out[key] = { ...current, ...clone(patch) } as ToothChartState;
  }
  return out;
}

/** Copy the given teeth from `source` into `target` (returns a new object). */
export function replaceTeeth(target: ChartTeeth, source: ChartTeeth, teeth: readonly ToothNumber[]): ChartTeeth {
  const out = clone(target);
  for (const tooth of teeth) {
    const key = String(tooth);
    if (source[key]) out[key] = clone(source[key]);
  }
  return out;
}
