import { describe, expect, it } from "vitest";
import { ARCH_TEETH } from "../lib/arch-geometry";
import { toothName } from "../lib/tooth-names";

describe("oval arch", () => {
  it("places all 32 permanent teeth, patient's right on the viewer's left", () => {
    expect(ARCH_TEETH).toHaveLength(32);
    const x = (n: number) => ARCH_TEETH.find((t) => t.n === n)!.x;
    expect(x(18)).toBeLessThan(x(11));
    expect(x(11)).toBeLessThan(x(21));
    expect(x(48)).toBeLessThan(x(38));
  });

  it("keeps the upper arch above the lower one at the incisors", () => {
    const y = (n: number) => ARCH_TEETH.find((t) => t.n === n)!.y;
    expect(y(11)).toBeLessThan(y(41));
  });

  it("names teeth in each locale", () => {
    expect(toothName(16, "fr")).toBe("Première molaire supérieure droite");
    expect(toothName(16, "en")).toBe("Upper right first molar");
    expect(toothName(16, "ar")).toBe("الرحى الأولى العلوية اليمنى");
    expect(toothName(33, "ar")).toBe("الناب السفلي الأيسر");
  });
});
