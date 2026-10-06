import type { Actor, OdontogramRecord, ToothEvent } from "../types";

/**
 * Demo data for the in-memory API. Fictional patients of a fictional clinic
 * ("Cabinet Dentaire Atlas", Casablanca). Dates are relative to page load so
 * the demo always reads as current.
 */

export const DEMO_USERS: Record<Actor["role"], Actor> = {
  owner: { id: "u-owner", name: "Dr Leïla Berrada", role: "owner" },
  dentist: { id: "u-dentist", name: "Dr Karim Alaoui", role: "dentist" },
  assistant: { id: "u-assistant", name: "Imane Chraïbi", role: "assistant" },
  receptionist: { id: "u-reception", name: "Hajar Idrissi", role: "receptionist" },
  accountant: { id: "u-accounting", name: "Omar Fassi", role: "accountant" },
};

const DAY = 86_400_000;

function at(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Date(d.getTime() + daysFromToday * DAY).toISOString();
}

const dentist = DEMO_USERS.dentist;
const owner = DEMO_USERS.owner;
const assistant = DEMO_USERS.assistant;

let seq = 0;
function ev(e: Omit<ToothEvent, "id">): ToothEvent {
  seq += 1;
  return { id: `te-${String(seq).padStart(4, "0")}`, ...e };
}

export function seedRecords(): Record<string, OdontogramRecord> {
  seq = 0;
  const salma: OdontogramRecord = {
    patient: {
      id: "pt-1042",
      fileNumber: "DA-2024-1042",
      firstName: "Salma",
      lastName: "Bennani",
      birthDate: "1987-03-14",
      phone: "+212 661 24 58 19",
      insurance: "CNOPS",
      alerts: [{ code: "penicillin_allergy", severity: "high" }],
      balance: 750,
    },
    chart: {
      status: {
        "16": { restorationType: "crown", restorationMaterial: "metal-ceramic" },
        "26": { caries: ["caries-occlusal", "caries-distal"], cariesSeverity: { occlusal: 3, distal: 5 } },
        "36": { endo: "endo-filling", fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } },
        "46": { toothSelection: "none" },
        "48": { toothSelection: "tooth-under-gum" },
        "37": { fillingSurfaces: ["occlusal", "buccal"], fillingSurfaceMaterials: { occlusal: "amalgam", buccal: "amalgam" } },
      },
      plan: {
        "16": { restorationType: "crown", restorationMaterial: "metal-ceramic" },
        "26": { fillingSurfaces: ["occlusal", "distal"], fillingSurfaceMaterials: { occlusal: "composite", distal: "composite" } },
        "36": { endo: "endo-filling", fillingSurfaces: ["occlusal"], fillingSurfaceMaterials: { occlusal: "composite" } },
        "46": { toothSelection: "implant", restorationType: "crown", restorationMaterial: "zircon" },
        "48": { toothSelection: "tooth-under-gum" },
        "37": { fillingSurfaces: ["occlusal", "buccal"], fillingSurfaceMaterials: { occlusal: "amalgam", buccal: "amalgam" } },
      },
      version: 7,
      updatedAt: at(-6, 11, 20),
      updatedBy: dentist,
    },
    events: [
      ev({ patientId: "pt-1042", tooth: 16, kind: "completed", status: "paid", actCode: "CCM", price: 3200, summary: "Couronne céramo-métallique scellée", createdBy: owner, createdAt: at(-430, 10), validatedBy: owner, validatedAt: at(-430, 10), completedAt: at(-402, 15), invoiceId: "inv-0101" }),
      ev({ patientId: "pt-1042", tooth: 36, kind: "diagnosis", status: "validated", diagnosisCode: "LPA", summary: "Lésion périapicale, douleur à la percussion", createdBy: dentist, createdAt: at(-96, 9, 40), validatedBy: dentist, validatedAt: at(-96, 9, 40) }),
      ev({ patientId: "pt-1042", tooth: 36, kind: "completed", status: "invoiced", actCode: "END3", price: 2200, summary: "Traitement endodontique 3 canaux + composite occlusal", createdBy: dentist, createdAt: at(-96, 9, 45), validatedBy: dentist, validatedAt: at(-96, 9, 45), completedAt: at(-82, 16), invoiceId: "inv-0187" }),
      ev({ patientId: "pt-1042", tooth: 46, kind: "diagnosis", status: "validated", diagnosisCode: "ABS", summary: "Extraction ancienne, crête cicatrisée", createdBy: dentist, createdAt: at(-40, 11), validatedBy: dentist, validatedAt: at(-40, 11) }),
      ev({ patientId: "pt-1042", tooth: 46, kind: "planned", status: "validated", actCode: "IMP", price: 9500, summary: "Implant 46, couronne zircone sur implant", createdBy: dentist, createdAt: at(-40, 11, 5), validatedBy: dentist, validatedAt: at(-40, 11, 5), chart: { target: "plan", before: { toothSelection: "none", restorationType: "none", restorationMaterial: "none" }, after: { toothSelection: "implant", restorationType: "crown", restorationMaterial: "zircon" } } }),
      ev({ patientId: "pt-1042", tooth: 26, kind: "diagnosis", status: "validated", diagnosisCode: "CAR", surfaces: ["occlusal", "distal"], summary: "Carie occluso-distale, profonde en distal", createdBy: dentist, createdAt: at(-6, 11, 10), validatedBy: dentist, validatedAt: at(-6, 11, 10) }),
      ev({ patientId: "pt-1042", tooth: 26, kind: "planned", status: "validated", actCode: "RC2", price: 750, surfaces: ["occlusal", "distal"], summary: "Composite OD", createdBy: dentist, createdAt: at(-6, 11, 15), validatedBy: dentist, validatedAt: at(-6, 11, 15), appointmentId: "ap-5521", chart: { target: "plan", before: { fillingSurfaces: [], fillingSurfaceMaterials: {}, caries: ["caries-occlusal", "caries-distal"], cariesSeverity: { occlusal: 3, distal: 5 } }, after: { fillingSurfaces: ["occlusal", "distal"], fillingSurfaceMaterials: { occlusal: "composite", distal: "composite" }, caries: [], cariesSeverity: {} } } }),
      ev({ patientId: "pt-1042", tooth: 11, kind: "diagnosis", status: "pending_validation", diagnosisCode: "CAR", surfaces: ["mesial"], summary: "Carie mésiale débutante vue au miroir", createdBy: assistant, createdAt: at(-2, 15, 32), chart: { target: "status", before: { caries: [], cariesSeverity: {} }, after: { caries: ["caries-mesial"], cariesSeverity: { mesial: 2 } } } }),
      ev({ patientId: "pt-1042", tooth: 37, kind: "diagnosis", status: "pending_validation", summary: "Tartre lingual, contact distal ouvert", createdBy: assistant, createdAt: at(-2, 15, 40), chart: { target: "status", before: { calculus: false, contactDistal: false }, after: { calculus: true, contactDistal: true } } }),
      ev({ patientId: "pt-1042", tooth: 24, kind: "note", status: "validated", summary: "Sensibilité au froid signalée, à surveiller", createdBy: dentist, createdAt: at(-6, 11, 18), validatedBy: dentist, validatedAt: at(-6, 11, 18) }),
    ],
    appointments: [
      { id: "ap-5521", start: at(0, 10, 30), durationMin: 45, chair: "F2", dentist: dentist.name, reasonKey: "care", status: "in_chair" },
      { id: "ap-5590", start: at(14, 9, 0), durationMin: 60, chair: "F1", dentist: dentist.name, reasonKey: "implant", status: "confirmed" },
    ],
    invoices: [
      { id: "inv-0101", number: "FAC-2025-0101", total: 3200, paid: 3200, status: "paid" },
      { id: "inv-0187", number: "FAC-2026-0187", total: 2200, paid: 1450, status: "partially_paid" },
    ],
  };

  const youssef: OdontogramRecord = {
    patient: {
      id: "pt-0877",
      fileNumber: "DA-2023-0877",
      firstName: "Youssef",
      lastName: "El Amrani",
      birthDate: "1961-11-02",
      phone: "+212 662 90 11 47",
      insurance: "CNSS",
      alerts: [
        { code: "anticoagulant", severity: "high" },
        { code: "hypertension", severity: "medium" },
      ],
      balance: 0,
    },
    chart: {
      status: {
        "14": { restorationType: "bridge", restorationMaterial: "metal-ceramic", bridgePillar: true },
        "15": { toothSelection: "none", restorationType: "bridge", restorationMaterial: "metal-ceramic" },
        "16": { restorationType: "bridge", restorationMaterial: "metal-ceramic", bridgePillar: true },
        "18": { toothSelection: "none" },
        "28": { toothSelection: "none" },
        "38": { toothSelection: "none" },
        "47": { toothSelection: "none" },
        "31": { mobility: "m2", calculus: true },
        "41": { mobility: "m2", calculus: true },
        "45": { endo: "endo-filling", restorationType: "crown", restorationMaterial: "zircon" },
      },
      plan: null,
      version: 3,
      updatedAt: at(-21, 16, 5),
      updatedBy: dentist,
    },
    events: [
      ev({ patientId: "pt-0877", tooth: 45, kind: "completed", status: "paid", actCode: "CZR", price: 4800, summary: "Couronne zircone sur dent dévitalisée", createdBy: dentist, createdAt: at(-210, 10), validatedBy: dentist, validatedAt: at(-210, 10), completedAt: at(-190, 11), invoiceId: "inv-0144" }),
      ev({ patientId: "pt-0877", tooth: 31, kind: "diagnosis", status: "validated", diagnosisCode: "MOB", summary: "Mobilité de classe 2, parodontite", createdBy: dentist, createdAt: at(-21, 16), validatedBy: dentist, validatedAt: at(-21, 16) }),
      ev({ patientId: "pt-0877", tooth: 41, kind: "diagnosis", status: "validated", diagnosisCode: "MOB", summary: "Mobilité de classe 2, parodontite", createdBy: dentist, createdAt: at(-21, 16, 2), validatedBy: dentist, validatedAt: at(-21, 16, 2) }),
      ev({ patientId: "pt-0877", tooth: 31, kind: "note", status: "validated", summary: "Sous anticoagulant : avis du cardiologue avant tout acte sanglant", createdBy: dentist, createdAt: at(-21, 16, 4), validatedBy: dentist, validatedAt: at(-21, 16, 4) }),
    ],
    appointments: [{ id: "ap-5602", start: at(3, 15, 0), durationMin: 30, chair: "F1", dentist: dentist.name, reasonKey: "perio", status: "confirmed" }],
    invoices: [{ id: "inv-0144", number: "FAC-2026-0144", total: 4800, paid: 4800, status: "paid" }],
  };

  const nadia: OdontogramRecord = {
    patient: {
      id: "pt-1203",
      fileNumber: "DA-2025-1203",
      firstName: "Nadia",
      lastName: "Tazi",
      birthDate: "1995-07-21",
      phone: "+212 670 33 82 05",
      insurance: "AMO",
      alerts: [{ code: "pregnancy", severity: "medium" }],
      balance: 0,
    },
    chart: { status: { "17": { fissureSealing: true }, "27": { fissureSealing: true } }, plan: null, version: 1, updatedAt: at(-120, 9), updatedBy: owner },
    events: [
      ev({ patientId: "pt-1203", tooth: 17, kind: "completed", status: "paid", actCode: "SCEL", price: 250, summary: "Scellement de sillons", createdBy: owner, createdAt: at(-120, 9), validatedBy: owner, validatedAt: at(-120, 9), completedAt: at(-120, 9, 30), invoiceId: "inv-0122" }),
      ev({ patientId: "pt-1203", tooth: 47, kind: "diagnosis", status: "pending_validation", diagnosisCode: "CAR", surfaces: ["occlusal"], summary: "Tache brune occlusale, sondage accroche", createdBy: assistant, createdAt: at(-1, 17, 5), chart: { target: "status", before: { caries: [], cariesSeverity: {} }, after: { caries: ["caries-occlusal"], cariesSeverity: { occlusal: 2 } } } }),
    ],
    appointments: [{ id: "ap-5610", start: at(1, 11, 0), durationMin: 30, chair: "F3", dentist: owner.name, reasonKey: "checkup", status: "confirmed" }],
    invoices: [{ id: "inv-0122", number: "FAC-2026-0122", total: 250, paid: 250, status: "paid" }],
  };

  return { [salma.patient.id]: salma, [youssef.patient.id]: youssef, [nadia.patient.id]: nadia };
}

export const DEFAULT_PATIENT_ID = "pt-1042";
