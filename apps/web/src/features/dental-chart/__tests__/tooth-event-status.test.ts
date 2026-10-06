import { describe, expect, it } from "vitest";
import { canTransition, initialStatusFor, isInvoiceable, toothFlow } from "../lib/tooth-event-status";
import type { ToothEvent } from "../types";

const base: Omit<ToothEvent, "id" | "status" | "kind"> = {
  patientId: "p",
  tooth: 16,
  summary: "",
  createdBy: { id: "u", name: "U", role: "dentist" },
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("tooth event status", () => {
  it("only lets pending entries be validated or rejected", () => {
    expect(canTransition("pending_validation", "validated")).toBe(true);
    expect(canTransition("pending_validation", "rejected")).toBe(true);
    expect(canTransition("validated", "rejected")).toBe(false);
    expect(canTransition("rejected", "validated")).toBe(false);
  });

  it("keeps history append-only: terminal statuses go nowhere", () => {
    for (const terminal of ["rejected", "cancelled", "paid"] as const) {
      for (const to of ["draft", "validated", "completed", "invoiced"] as const) expect(canTransition(terminal, to)).toBe(false);
    }
  });

  it("invoices only validated or completed treatment", () => {
    expect(isInvoiceable("validated")).toBe(true);
    expect(isInvoiceable("completed")).toBe(true);
    expect(isInvoiceable("pending_validation")).toBe(false);
    expect(isInvoiceable("draft")).toBe(false);
    expect(isInvoiceable("invoiced")).toBe(false);
  });

  it("makes assistant entries pending and dentist entries validated", () => {
    expect(initialStatusFor("assistant")).toBe("pending_validation");
    expect(initialStatusFor("dentist")).toBe("validated");
    expect(initialStatusFor("owner")).toBe("validated");
  });

  it("marks a tooth by priority: pending > planned > done, ignoring rejected", () => {
    const done: ToothEvent = { ...base, id: "1", kind: "completed", status: "paid" };
    const planned: ToothEvent = { ...base, id: "2", kind: "planned", status: "validated" };
    const pending: ToothEvent = { ...base, id: "3", kind: "diagnosis", status: "pending_validation" };
    const rejected: ToothEvent = { ...base, id: "4", kind: "diagnosis", status: "rejected" };
    expect(toothFlow([done])).toBe("done");
    expect(toothFlow([done, planned])).toBe("planned");
    expect(toothFlow([done, planned, pending])).toBe("pending");
    expect(toothFlow([rejected])).toBeNull();
  });
});
