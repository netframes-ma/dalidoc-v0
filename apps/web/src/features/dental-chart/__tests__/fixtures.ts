import { ALL_TEETH } from "@/lib/fdi";
import type { ChartTeeth, ToothChartState } from "../types";

/** A healthy tooth as the engine serializes it (the fields DaliDoc reads). */
export function healthyTooth(): ToothChartState {
  return {
    toothSelection: "tooth-base",
    toothSubstrate: "natural",
    restorationType: "none",
    restorationMaterial: "none",
    prosthesis: "none",
    endo: "none",
    pulpDx: "normal",
    apicalDx: "normal",
    caries: [],
    cariesSeverity: {},
    fillingSurfaces: [],
    fillingSurfaceMaterials: {},
    fissureSealing: false,
    calculus: false,
    extractionPlan: false,
    crownNeeded: false,
    crownReplace: false,
    mobility: "none",
    orthoAppliance: "none",
    cariesActiveDepth: 2,
  };
}

export function healthyMouth(): ChartTeeth {
  return Object.fromEntries(ALL_TEETH.map((n) => [String(n), healthyTooth()]));
}
