import { describe, expect, it } from "vitest";
import { createMockDentalChartApi } from "../api/mock-dental-chart.api";
import { DEMO_USERS } from "../api/mock-data";

const PATIENT = "pt-1042";

describe("mock dental-chart API", () => {
  it("files assistant entries as pending and dentist entries as validated", async () => {
    const api = createMockDentalChartApi();
    const draft = await api.createToothEvents(PATIENT, [{ tooth: 21, kind: "note", summary: "Note" }], DEMO_USERS.assistant);
    expect(draft.data?.events[0]?.status).toBe("pending_validation");
    const signed = await api.createToothEvents(PATIENT, [{ tooth: 21, kind: "note", summary: "Note" }], DEMO_USERS.dentist);
    expect(signed.data?.events[0]?.status).toBe("validated");
  });

  it("writes a validated charting change into the stored chart", async () => {
    const api = createMockDentalChartApi();
    const before = (await api.getOdontogram(PATIENT)).data!;
    expect(before.chart.status["11"]).toBeUndefined();
    const validated = await api.validateToothEvent("te-0008", DEMO_USERS.dentist);
    expect(validated.data?.event.status).toBe("validated");
    expect(validated.data?.chart.status["11"]).toMatchObject({ caries: ["caries-mesial"] });
    expect(validated.data?.chart.version).toBe(before.chart.version + 1);
  });

  it("requires a reason and the validate permission to reject", async () => {
    const api = createMockDentalChartApi();
    expect((await api.rejectToothEvent("te-0009", "ok", DEMO_USERS.dentist)).error?.code).toBe("VALIDATION");
    expect((await api.rejectToothEvent("te-0009", "Pas de tartre visible", DEMO_USERS.assistant)).error?.code).toBe("FORBIDDEN");
    const rejected = await api.rejectToothEvent("te-0009", "Pas de tartre visible", DEMO_USERS.dentist);
    expect(rejected.data?.event).toMatchObject({ status: "rejected", rejectedReason: "Pas de tartre visible" });
  });

  it("refuses to invoice a pending entry and to let front desk create events", async () => {
    const api = createMockDentalChartApi();
    expect((await api.invoiceFromTreatment(PATIENT, ["te-0008"], DEMO_USERS.dentist)).error?.code).toBe("CONFLICT");
    expect((await api.createToothEvents(PATIENT, [{ tooth: 11, kind: "note", summary: "x" }], DEMO_USERS.receptionist)).error?.code).toBe("FORBIDDEN");
  });

  it("completing a planned act moves its planned drawing into the status chart", async () => {
    const api = createMockDentalChartApi();
    const done = await api.completeToothEvent("te-0007", DEMO_USERS.dentist);
    expect(done.data?.event.status).toBe("completed");
    expect(done.data?.chart.status["26"]).toMatchObject({ fillingSurfaces: ["occlusal", "distal"], caries: [] });
  });
});
