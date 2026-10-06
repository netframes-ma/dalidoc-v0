import { archOf, quadrantOf } from "@/lib/fdi";
import type { Locale } from "@/lib/i18n/locales";

const FR = ["incisive centrale", "incisive latérale", "canine", "première prémolaire", "deuxième prémolaire", "première molaire", "deuxième molaire", "dent de sagesse"];
const EN = ["central incisor", "lateral incisor", "canine", "first premolar", "second premolar", "first molar", "second molar", "wisdom tooth"];
/** Arabic position names with their grammatical gender (adjectives agree with it). */
const AR: readonly (readonly [string, "m" | "f"])[] = [
  ["القاطع المركزي", "m"],
  ["القاطع الجانبي", "m"],
  ["الناب", "m"],
  ["الضاحك الأول", "m"],
  ["الضاحك الثاني", "m"],
  ["الرحى الأولى", "f"],
  ["الرحى الثانية", "f"],
  ["ضرس العقل", "m"],
];

/** Anatomical name of a permanent tooth, e.g. 16 → "première molaire supérieure droite". */
export function toothName(n: number, locale: Locale): string {
  const pos = (n % 10) - 1;
  const upper = archOf(n) === "upper";
  const right = quadrantOf(n) === 1 || quadrantOf(n) === 4;
  if (locale === "en") {
    return `${upper ? "Upper" : "Lower"} ${right ? "right" : "left"} ${EN[pos] ?? ""}`;
  }
  if (locale === "ar") {
    const [name, gender] = AR[pos] ?? ["", "m"];
    const arch = upper ? (gender === "f" ? "العلوية" : "العلوي") : gender === "f" ? "السفلية" : "السفلي";
    const side = right ? (gender === "f" ? "اليمنى" : "الأيمن") : gender === "f" ? "اليسرى" : "الأيسر";
    return `${name} ${arch} ${side}`;
  }
  const label = FR[pos] ?? "";
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
  return `${capitalized} ${upper ? "supérieure" : "inférieure"} ${right ? "droite" : "gauche"}`;
}
