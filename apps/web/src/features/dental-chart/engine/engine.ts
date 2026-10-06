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

/* ── Selection ────────────────────────────────────────────────────────────── */

/** Follow the selection: the selected teeth and the active tooth (the one the drawer shows). */
export function onSelection(listener: (teeth: number[], active: number | null) => void): () => void {
  listener(Odontogram.getSelectedTeeth(), Odontogram.getActiveTooth());
  return Odontogram.onSelectionChange(listener);
}

/** Select one tooth from DaliDoc (arch navigator, validation queue, plan rows) — works in read-only mode. */
export function selectTooth(root: ParentNode | null, tooth: number | null): void {
  Odontogram.selectTeeth(tooth === null ? [] : [tooth]);
  if (tooth === null || !root) return;
  const tile = tilesOf(root, tooth).find((t) => t.getAttribute("role") === "option");
  tile?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
}

/** Selection ring colour (`#rrggbb`) and a solid ring, to match DaliDoc's focus style. */
export function setSelectionStyle(hex: string): void {
  Odontogram.setSelectionColor(hex);
  Odontogram.setSelectionBorderStyle("solid");
}

export function tilesOf(root: ParentNode, tooth?: number): HTMLElement[] {
  const selector = tooth === undefined ? ".tooth-tile[data-tooth]" : `.tooth-tile[data-tooth="${tooth}"]`;
  return Array.from(root.querySelectorAll<HTMLElement>(selector));
}
