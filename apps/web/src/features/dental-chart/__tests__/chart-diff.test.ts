import { describe, expect, it } from "vitest";
import { applyPatches, changedTeeth, diffTeeth, materialize, replaceTeeth, toSparse } from "../lib/chart-diff";
import { healthyMouth } from "./fixtures";

describe("chart diff", () => {
  it("reports field-level changes per tooth", () => {
    const before = healthyMouth();
    const after = applyPatches(before, { "26": { caries: ["caries-occlusal"], cariesSeverity: { occlusal: 3 } }, "46": { toothSelection: "none" } });
    const changes = diffTeeth(before, after);
    expect(changedTeeth(changes).sort()).toEqual([26, 46]);
    expect(changes.find((c) => c.tooth === 46)).toMatchObject({ field: "toothSelection", from: "tooth-base", to: "none" });
  });

  it("ignores array order and UI-only fields", () => {
    const before = applyPatches(healthyMouth(), { "26": { fillingSurfaces: ["occlusal", "distal"] } });
    const after = applyPatches(before, {
      "26": { fillingSurfaces: ["distal", "occlusal"], cariesActiveDepth: 5, customStates: { x: 1 }, note: "n" },
    });
    expect(diffTeeth(before, after)).toEqual([]);
  });

  it("round-trips through the sparse storage shape", () => {
    const template = healthyMouth();
    const chart = applyPatches(template, { "16": { restorationType: "crown", restorationMaterial: "zircon" } });
    const sparse = toSparse(chart, template);
    expect(sparse).toEqual({ "16": { restorationType: "crown", restorationMaterial: "zircon" } });
    expect(diffTeeth(materialize(sparse, template), chart)).toEqual([]);
  });

  it("copies only the requested teeth when reverting", () => {
    const reference = healthyMouth();
    const live = applyPatches(reference, { "11": { calculus: true }, "21": { calculus: true } });
    const reverted = replaceTeeth(live, reference, [11]);
    expect(reverted["11"]?.calculus).toBe(false);
    expect(reverted["21"]?.calculus).toBe(true);
    expect(live["11"]?.calculus).toBe(true);
  });
});
