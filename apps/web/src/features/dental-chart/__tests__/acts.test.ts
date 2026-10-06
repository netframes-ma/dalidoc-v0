import { describe, expect, it } from "vitest";
import { proposalTotal, proposeActs } from "../lib/acts";
import { applyPatches } from "../lib/chart-diff";
import { healthyMouth } from "./fixtures";

describe("plan → act proposals", () => {
  const status = applyPatches(healthyMouth(), {
    "26": { caries: ["caries-occlusal", "caries-distal"] },
    "46": { toothSelection: "none" },
  });

  it("prices fillings by number of new surfaces", () => {
    const plan = applyPatches(status, {
      "26": { caries: [], fillingSurfaces: ["occlusal", "distal"], fillingSurfaceMaterials: { occlusal: "composite", distal: "composite" } },
    });
    expect(proposeActs(status, plan)).toEqual([{ tooth: 26, reason: "filling", actCode: "RC2", surfaces: ["occlusal", "distal"] }]);
  });

  it("proposes an implant and its crown for a missing tooth", () => {
    const plan = applyPatches(status, { "46": { toothSelection: "implant", restorationType: "crown", restorationMaterial: "zircon" } });
    const proposals = proposeActs(status, plan);
    expect(proposals.map((p) => p.actCode)).toEqual(["IMP", "CZR"]);
    expect(proposalTotal(proposals)).toBe(9500 + 4800);
  });

  it("distinguishes surgical wisdom-tooth extraction and multi-rooted endodontics", () => {
    const plan = applyPatches(status, { "38": { toothSelection: "none" }, "21": { toothSelection: "none" }, "36": { endo: "endo-filling" }, "11": { endo: "endo-filling" } });
    const byTooth = Object.fromEntries(proposeActs(status, plan).map((p) => [p.tooth, p.actCode]));
    expect(byTooth).toMatchObject({ 38: "EXTC", 21: "EXT", 36: "END3", 11: "END1" });
  });

  it("maps crown materials and keeps unbillable changes for manual coding", () => {
    const plan = applyPatches(status, {
      "16": { restorationType: "crown", restorationMaterial: "metal-ceramic" },
      "13": { orthoAppliance: "bracket" },
    });
    expect(proposeActs(status, plan)).toEqual([
      { tooth: 16, reason: "crown", actCode: "CCM" },
      { tooth: 13, reason: "other", actCode: null },
    ]);
  });
});
