import { ALL_TEETH, isMultiRooted, isWisdomTooth } from "@/lib/fdi";
import type { Locale } from "@/lib/i18n/locales";
import type { ChartTeeth, ToothChartState, ToothSurface } from "../types";
import { diffTeeth, groupByTooth } from "./chart-diff";

type Localized = Record<Locale, string>;

export type ActCategory = "diagnostic" | "prevention" | "restorative" | "endo" | "surgery" | "prosthesis" | "implant";

export interface Act {
  code: string;
  category: ActCategory;
  /** Unit price in MAD. */
  price: number;
  surfaces?: boolean;
  label: Localized;
}

/** Tooth-level act catalogue (prices in MAD), shared with the DaliDoc template. */
export const ACTS = {
  RX: { code: "RX", category: "diagnostic", price: 120, label: { fr: "Radio rétro-alvéolaire", en: "Periapical X-ray", ar: "أشعة ذروية" } },
  SCEL: { code: "SCEL", category: "prevention", price: 250, label: { fr: "Scellement de sillons", en: "Fissure sealant", ar: "سد الشقوق" } },
  RC1: { code: "RC1", category: "restorative", price: 550, surfaces: true, label: { fr: "Composite 1 face", en: "Composite, 1 surface", ar: "حشوة تجميلية سطح واحد" } },
  RC2: { code: "RC2", category: "restorative", price: 750, surfaces: true, label: { fr: "Composite 2 faces", en: "Composite, 2 surfaces", ar: "حشوة تجميلية سطحان" } },
  RC3: { code: "RC3", category: "restorative", price: 950, surfaces: true, label: { fr: "Composite 3 faces", en: "Composite, 3 surfaces", ar: "حشوة تجميلية ثلاثة أسطح" } },
  END1: { code: "END1", category: "endo", price: 1300, label: { fr: "Traitement de canal (monoradiculée)", en: "Root canal, single root", ar: "علاج عصب جذر واحد" } },
  END3: { code: "END3", category: "endo", price: 2200, label: { fr: "Traitement de canal (pluriradiculée)", en: "Root canal, multi-root", ar: "علاج عصب متعدد الجذور" } },
  EXT: { code: "EXT", category: "surgery", price: 450, label: { fr: "Extraction simple", en: "Simple extraction", ar: "قلع بسيط" } },
  EXTC: { code: "EXTC", category: "surgery", price: 1400, label: { fr: "Extraction chirurgicale", en: "Surgical extraction", ar: "قلع جراحي" } },
  INL: { code: "INL", category: "prosthesis", price: 1600, label: { fr: "Inlay-core", en: "Post and core", ar: "دعامة داخلية" } },
  INO: { code: "INO", category: "prosthesis", price: 2600, label: { fr: "Inlay / onlay céramique", en: "Ceramic inlay / onlay", ar: "حشوة خزفية داخلية / خارجية" } },
  VEN: { code: "VEN", category: "prosthesis", price: 3500, label: { fr: "Facette céramique", en: "Ceramic veneer", ar: "قشرة خزفية" } },
  CCM: { code: "CCM", category: "prosthesis", price: 3200, label: { fr: "Couronne céramo-métallique", en: "Porcelain-fused-to-metal crown", ar: "تاج خزفي معدني" } },
  CZR: { code: "CZR", category: "prosthesis", price: 4800, label: { fr: "Couronne zircone", en: "Zirconia crown", ar: "تاج زركونيا" } },
  BRG: { code: "BRG", category: "prosthesis", price: 3200, label: { fr: "Élément de bridge", en: "Bridge unit", ar: "وحدة جسر" } },
  IMP: { code: "IMP", category: "implant", price: 9500, label: { fr: "Pose d’implant", en: "Implant placement", ar: "زرع سن" } },
} as const satisfies Record<string, Act>;

export type ActCode = keyof typeof ACTS;

export function getAct(code: string | undefined): Act | undefined {
  return code && code in ACTS ? ACTS[code as ActCode] : undefined;
}

export const DIAGNOSES = {
  CAR: { label: { fr: "Carie", en: "Caries", ar: "تسوس" } },
  LPA: { label: { fr: "Lésion périapicale", en: "Periapical lesion", ar: "آفة ذروية" } },
  PUL: { label: { fr: "Pulpite", en: "Pulpitis", ar: "التهاب اللب" } },
  FRA: { label: { fr: "Fracture", en: "Fracture", ar: "كسر" } },
  MOB: { label: { fr: "Mobilité", en: "Mobility", ar: "حركة السن" } },
  USU: { label: { fr: "Usure", en: "Wear", ar: "تآكل" } },
  ABS: { label: { fr: "Dent absente", en: "Missing tooth", ar: "سن مفقود" } },
} as const satisfies Record<string, { label: Localized }>;

export type DiagnosisCode = keyof typeof DIAGNOSES;

export type ProposalReason =
  | "extraction"
  | "implant"
  | "crown"
  | "inlay"
  | "veneer"
  | "bridge"
  | "filling"
  | "endo"
  | "sealant"
  | "other";

export interface ActProposal {
  tooth: number;
  reason: ProposalReason;
  /** `null` when the change has no catalogue act: the dentist codes it by hand. */
  actCode: ActCode | null;
  surfaces?: ToothSurface[];
}

const ENDO_TREATED = new Set(["endo-filling", "endo-filling-incomplete", "endo-glass-pin", "endo-metal-pin", "endo-medical-filling"]);
const ABSENT = new Set(["none", "no-tooth-after-extraction"]);
const SURFACES: readonly ToothSurface[] = ["mesial", "occlusal", "distal", "buccal", "lingual"];

function crownAct(material: string): ActCode {
  return material === "zircon" || material === "emax" || material === "gradia" ? "CZR" : "CCM";
}

function proposalsForTooth(tooth: number, s: ToothChartState, p: ToothChartState): ActProposal[] {
  const out: ActProposal[] = [];
  const present = !ABSENT.has(s.toothSelection);

  if (present && (ABSENT.has(p.toothSelection) || (p.extractionPlan && !s.extractionPlan))) {
    out.push({ tooth, reason: "extraction", actCode: isWisdomTooth(tooth) ? "EXTC" : "EXT" });
  }
  if (p.toothSelection === "implant" && s.toothSelection !== "implant") {
    out.push({ tooth, reason: "implant", actCode: "IMP" });
  }
  const restorationChanged = p.restorationType !== s.restorationType || p.restorationMaterial !== s.restorationMaterial;
  if (restorationChanged && p.restorationType !== "none") {
    if (p.restorationType === "crown") out.push({ tooth, reason: "crown", actCode: crownAct(p.restorationMaterial) });
    else if (p.restorationType === "inlay" || p.restorationType === "onlay") out.push({ tooth, reason: "inlay", actCode: "INO" });
    else if (p.restorationType === "veneer") out.push({ tooth, reason: "veneer", actCode: "VEN" });
    else if (p.restorationType === "bridge") out.push({ tooth, reason: "bridge", actCode: "BRG" });
  }
  if (ENDO_TREATED.has(p.endo) && !ENDO_TREATED.has(s.endo)) {
    out.push({ tooth, reason: "endo", actCode: isMultiRooted(tooth) ? "END3" : "END1" });
  }
  const before = new Set(s.fillingSurfaces ?? []);
  const added = SURFACES.filter((surface) => (p.fillingSurfaces ?? []).includes(surface) && !before.has(surface));
  if (added.length > 0) {
    const code = (["RC1", "RC2", "RC3"] as const)[Math.min(added.length, 3) - 1] ?? "RC3";
    out.push({ tooth, reason: "filling", actCode: code, surfaces: added });
  }
  if (p.fissureSealing && !s.fissureSealing) out.push({ tooth, reason: "sealant", actCode: "SCEL" });
  return out;
}

/**
 * Turn the engine's status → plan difference into catalogue acts, tooth by
 * tooth. A tooth whose plan changes nothing billable still yields one `other`
 * proposal so the dentist sees it.
 */
export function proposeActs(status: ChartTeeth, plan: ChartTeeth): ActProposal[] {
  const byTooth = groupByTooth(diffTeeth(status, plan));
  const out: ActProposal[] = [];
  for (const tooth of ALL_TEETH) {
    if (!byTooth.has(tooth)) continue;
    const s = status[String(tooth)];
    const p = plan[String(tooth)];
    if (!s || !p) continue;
    const proposals = proposalsForTooth(tooth, s, p);
    out.push(...(proposals.length > 0 ? proposals : [{ tooth, reason: "other" as const, actCode: null }]));
  }
  return out;
}

export function proposalTotal(proposals: readonly ActProposal[]): number {
  return proposals.reduce((sum, p) => sum + (p.actCode ? ACTS[p.actCode].price : 0), 0);
}
