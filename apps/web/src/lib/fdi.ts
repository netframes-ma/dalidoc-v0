/**
 * FDI (ISO 3950) tooth numbering for the permanent dentition.
 * Order is the anatomical chart order: patient's right on the viewer's left.
 */
export const FDI_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const FDI_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
export const ALL_TEETH: readonly number[] = [...FDI_UPPER, ...FDI_LOWER];

export type ToothKind = "incisor" | "canine" | "premolar" | "molar";
export type Quadrant = 1 | 2 | 3 | 4;
export type Arch = "upper" | "lower";

export function isPermanentFdi(n: number): boolean {
  const q = Math.floor(n / 10);
  const p = n % 10;
  return Number.isInteger(n) && q >= 1 && q <= 4 && p >= 1 && p <= 8;
}

export function quadrantOf(n: number): Quadrant {
  return Math.floor(n / 10) as Quadrant;
}

export function archOf(n: number): Arch {
  return quadrantOf(n) <= 2 ? "upper" : "lower";
}

export function toothKind(n: number): ToothKind {
  const p = n % 10;
  if (p <= 2) return "incisor";
  if (p === 3) return "canine";
  if (p <= 5) return "premolar";
  return "molar";
}

/** Single-rooted for endodontic pricing (molars are multi-rooted; upper first premolars usually two roots). */
export function isMultiRooted(n: number): boolean {
  return toothKind(n) === "molar" || n === 14 || n === 24;
}

export function isWisdomTooth(n: number): boolean {
  return n % 10 === 8;
}
