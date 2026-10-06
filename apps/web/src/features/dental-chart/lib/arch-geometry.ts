import { FDI_LOWER, FDI_UPPER, toothKind, type ToothKind } from "@/lib/fdi";

/**
 * Oval open-mouth FDI arch (anatomical view: the patient's right is on the
 * viewer's left, never mirrored). Teeth are placed by arc length on two
 * ellipses, so molars take more of the curve than incisors.
 */
export interface ArchTooth {
  n: number;
  kind: ToothKind;
  x: number;
  y: number;
  /** Rotation in degrees, tangent to the arch. */
  rot: number;
  /** Unit normal pointing out of the mouth (used to place labels and badges). */
  nx: number;
  ny: number;
  w: number;
  h: number;
}

export const ARCH_WIDTH = 760;
export const ARCH_HEIGHT = 560;
const CX = 380;

function widthOf(n: number): number {
  const kind = toothKind(n);
  if (kind === "molar") return 1.32;
  if (kind === "premolar") return 1;
  if (kind === "canine") return 0.98;
  return n % 10 === 1 ? 0.98 : 0.86;
}

function heightOf(kind: ToothKind): number {
  return kind === "molar" ? 50 : kind === "premolar" ? 44 : 42;
}

function place(teeth: readonly number[], cy: number, rx: number, ry: number, upper: boolean): ArchTooth[] {
  const a0 = upper ? Math.PI + 0.1 : Math.PI - 0.1;
  const a1 = upper ? 2 * Math.PI - 0.1 : 0.1;
  const steps = 400;
  const pts: { a: number; x: number; y: number; s: number }[] = [];
  let len = 0;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    const x = CX + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    const prev = pts[i - 1];
    if (prev) len += Math.hypot(x - prev.x, y - prev.y);
    pts.push({ a, x, y, s: len });
  }
  const widths = teeth.map(widthOf);
  const total = widths.reduce((sum, w) => sum + w, 0);
  let acc = 0;
  return teeth.map((n, k) => {
    const w = widths[k] ?? 1;
    const target = ((acc + w / 2) / total) * len;
    acc += w;
    let j = pts.findIndex((p) => p.s >= target);
    if (j < 1) j = 1;
    const p = pts[j]!;
    const q = pts[j - 1]!;
    const tangent = Math.atan2(p.y - q.y, p.x - q.x);
    const nx = Math.cos(p.a) * ry;
    const ny = Math.sin(p.a) * rx;
    const nl = Math.hypot(nx, ny);
    const kind = toothKind(n);
    return {
      n,
      kind,
      x: p.x,
      y: p.y,
      rot: (tangent * 180) / Math.PI,
      nx: nx / nl,
      ny: ny / nl,
      w: (w / total) * len - 5,
      h: heightOf(kind),
    };
  });
}

export const ARCH_TEETH: readonly ArchTooth[] = [
  ...place(FDI_UPPER, 262, 300, 205, true),
  ...place(FDI_LOWER, 300, 290, 200, false),
];

/** Crown outline centred on (0,0), drawn before rotation. */
export function toothPath(kind: ToothKind, w: number, h: number): string {
  const x = -w / 2;
  const y = -h / 2;
  if (kind === "molar") {
    const r = 11;
    return `M${x + r},${y}H${-r * 0.3}Q0,${y + 4} ${r * 0.3},${y}H${-x - r}Q${-x},${y} ${-x},${y + r}V${-y - r}Q${-x},${-y} ${-x - r},${-y}H${r * 0.3}Q0,${-y - 4} ${-r * 0.3},${-y}H${x + r}Q${x},${-y} ${x},${-y - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
  }
  if (kind === "canine") {
    return `M0,${y}Q${-x},${y + h * 0.18} ${-x},${y + h * 0.5}Q${-x},${-y} 0,${-y}Q${x},${-y} ${x},${y + h * 0.5}Q${x},${y + h * 0.18} 0,${y}Z`;
  }
  const r = kind === "incisor" ? Math.min(w / 2.2, 10) : 12;
  return `M${x + r},${y}H${-x - r}Q${-x},${y} ${-x},${y + r}V${-y - r}Q${-x},${-y} ${-x - r},${-y}H${x + r}Q${x},${-y} ${x},${-y - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;
}
