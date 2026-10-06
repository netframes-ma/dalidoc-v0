import * as Odontogram from "react-advanced-odontogram";
import type { ChartPayload, ChartTeeth } from "../types";

/**
 * The only module that talks to React Advanced Odontogram's imperative API.
 *
 * The engine is a page-level singleton (one chart per page, see the package
 * README), so these helpers are plain functions. Everything else in DaliDoc
 * works on the payloads they return, never on the engine's internals.
 *
 * Client-only: import it from components loaded with `ssr: false`.
 */

export type ChartMode = "status" | "plan";

export interface EnginePlanChange {
  toothNo: number;
  axis: string;
  from: string;
  to: string;
}

/** Current status chart (and `plan`, when the plan chart differs from it). */
export function readChart(): ChartPayload {
  return Odontogram.getStatusChart() as ChartPayload;
}

export function readPlanTeeth(): ChartTeeth {
  return (Odontogram.getPlanChart() as ChartPayload).teeth;
}

/** Replace the whole case. Keeps the viewer's current display globals (bone, wisdom teeth, occlusal view). */
export function loadChart(teeth: ChartTeeth, plan: ChartTeeth | null): void {
  const current = readChart();
  const payload: ChartPayload = { version: current.version, globals: current.globals, teeth, ...(plan ? { plan } : {}) };
  Odontogram.importStatus(payload);
}

/** A blank, healthy mouth — the template sparse charts are expanded over. */
export function healthyTeeth(): ChartTeeth {
  Odontogram.resetMouth();
  return readChart().teeth;
}

/* ── Session ───────────────────────────────────────────────────────────────
 * Which patient the engine currently shows, and the healthy-mouth template
 * captured before loading it. A tiny external store (read with
 * useSyncExternalStore) because the engine itself is a module singleton.
 */

export interface EngineSession {
  patientId: string;
  template: ChartTeeth;
}

let session: EngineSession | null = null;
const sessionListeners = new Set<() => void>();

function emitSession(): void {
  for (const listener of sessionListeners) listener();
}

export function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function getSession(): EngineSession | null {
  return session;
}

/** Reset the engine, hand the healthy template to `load`, and record the session. */
export function startSession(patientId: string, load: (template: ChartTeeth) => void): void {
  const template = session?.template ?? healthyTeeth();
  load(template);
  session = { patientId, template };
  emitSession();
}

export function endSession(): void {
  session = null;
  emitSession();
}

export function subscribe(listener: () => void): () => void {
  return Odontogram.onStateChange(listener);
}

export function getMode(): ChartMode {
  return Odontogram.getChartMode() as ChartMode;
}

export function planChanges(): EnginePlanChange[] {
  return Odontogram.getPlanChanges() as EnginePlanChange[];
}

/** The engine's own localized description of a tooth's findings. */
export function toothSummary(tooth: number): string[] {
  return Odontogram.getToothStateSummary(tooth);
}

export function clearSelection(): void {
  Odontogram.clearSelection();
}

export function setShowBone(on: boolean): void {
  Odontogram.setShowBase(on);
}

export function setPerioAsPopup(): void {
  Odontogram.setPerioViewMode("popup");
}

export function openPerio(): void {
  Odontogram.openPerioOverlay();
}

export function closePerio(): void {
  Odontogram.closePerioOverlay();
}

export const exportChart = {
  /** `subject` is a FHIR reference such as `Patient/pt-1042`. */
  fhir: (subject: string) => Odontogram.exportFhir({ subject }),
  svg: () => Odontogram.exportSvg(),
  png: () => void Odontogram.exportImage("png"),
};

export const confirmDualState = {
  accept: () => Odontogram.acceptDualStateConfirm(),
  cancel: () => Odontogram.cancelDualStateConfirm(),
};

/* ── Selection ──────────────────────────────────────────────────────────────
 * 2.5.0 has no selection event or `getSelectedTeeth()` (added in 2.6.0), so
 * the selection is read from the tiles the engine marks with `.active`, and a
 * tooth is selected by clicking its tile — the same path a user takes.
 */

type MaybeSelection = { getSelectedTeeth?: () => number[] };

export function selectedTeeth(root: ParentNode): number[] {
  const api = Odontogram as unknown as MaybeSelection;
  if (typeof api.getSelectedTeeth === "function") return api.getSelectedTeeth();
  const teeth = Array.from(root.querySelectorAll<HTMLElement>(".tooth-tile.active[data-tooth]"), (el) =>
    Number(el.dataset.tooth),
  );
  return Array.from(new Set(teeth));
}

export function tilesOf(root: ParentNode, tooth?: number): HTMLElement[] {
  const selector = tooth === undefined ? ".tooth-tile[data-tooth]" : `.tooth-tile[data-tooth="${tooth}"]`;
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}

export function focusTooth(root: ParentNode, tooth: number): boolean {
  const tiles = tilesOf(root, tooth);
  const tile = tiles.find((t) => t.getAttribute("role") === "option") ?? tiles[0];
  if (!tile) return false;
  tile.click();
  tile.focus({ preventScroll: true });
  tile.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  return true;
}
