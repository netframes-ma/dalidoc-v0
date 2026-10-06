import { describe, expect, it } from "vitest";
import { seedRecords } from "../api/mock-data";
import { composeReference } from "../lib/reference";
import { healthyMouth } from "./fixtures";

describe("reference chart", () => {
  const record = seedRecords()["pt-1042"]!;
  const ref = composeReference(record, healthyMouth());

  it("expands the stored chart and shows pending drafts on it", () => {
    expect(ref.status["16"]?.restorationType).toBe("crown");
    expect(ref.status["11"]?.caries).toEqual(["caries-mesial"]);
    expect(ref.status["37"]?.calculus).toBe(true);
  });

  it("carries a pending finding into the plan only where the plan still matches the status", () => {
    expect(ref.plan?.["11"]?.caries).toEqual(["caries-mesial"]);
    expect(ref.plan?.["46"]?.toothSelection).toBe("implant");
  });
});
