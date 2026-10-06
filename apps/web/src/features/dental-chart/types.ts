/**
 * Dental-chart domain types.
 *
 * Two layers live side by side:
 *  - the **chart**: the clinical drawing, owned by React Advanced Odontogram
 *    (`ChartPayload`, its export format — version 2.x);
 *  - the **workflow**: DaliDoc's tooth events (diagnosis, planned and completed
 *    treatment, notes) with their validation status, appointment and invoice.
 *
 * The chart is a projection of validated clinical facts; every change to it is
 * recorded as tooth events so clinical history is never lost.
 */

export type ToothNumber = number;

/** Lifecycle of a tooth event (docs/DATABASE_DESIGN.md). */
export type ToothEventStatus =
  | "draft"
  | "pending_validation"
  | "validated"
  | "rejected"
  | "cancelled"
  | "completed"
  | "invoiced"
  | "paid";

export type ToothEventKind = "diagnosis" | "planned" | "completed" | "note";

export type ToothSurface = "mesial" | "distal" | "buccal" | "lingual" | "occlusal";

export type Role = "owner" | "dentist" | "assistant" | "receptionist" | "accountant";

export interface Actor {
  id: string;
  name: string;
  role: Role;
}

/** One field of one tooth that differs between two chart payloads. */
export interface ChartFieldChange {
  tooth: ToothNumber;
  field: string;
  from: unknown;
  to: unknown;
}

/** Serialized state of one tooth as exported by the engine (only the fields DaliDoc reads are typed). */
export interface ToothChartState {
  toothSelection: string;
  toothSubstrate: string;
  restorationType: string;
  restorationMaterial: string;
  prosthesis: string;
  endo: string;
  pulpDx: string;
  apicalDx: string;
  caries: string[];
  fillingSurfaces: string[];
  fillingSurfaceMaterials: Record<string, string>;
  fissureSealing: boolean;
  calculus: boolean;
  extractionPlan: boolean;
  crownNeeded: boolean;
  crownReplace: boolean;
  mobility: string;
  orthoAppliance: string;
  customStates?: Record<string, unknown>;
  note?: string;
  [field: string]: unknown;
}

export type ChartTeeth = Record<string, ToothChartState>;

/** The engine's status export (`getStatusChart()` / `importStatus()`). */
export interface ChartPayload {
  version: string;
  globals: Record<string, unknown>;
  teeth: ChartTeeth;
  plan?: ChartTeeth;
  case?: Record<string, unknown>;
}

/** Sparse chart as stored by the API: only the fields that differ from a healthy mouth. */
export type SparseTeeth = Record<string, Partial<ToothChartState>>;

export interface StoredChart {
  status: SparseTeeth;
  plan: SparseTeeth | null;
  version: number;
  updatedAt: string;
  updatedBy: Actor | null;
}

export interface ToothEvent {
  id: string;
  patientId: string;
  tooth: ToothNumber;
  kind: ToothEventKind;
  status: ToothEventStatus;
  /** Act catalogue code for planned/completed treatment (see lib/acts.ts). */
  actCode?: string;
  /** Diagnosis code (see lib/acts.ts DIAGNOSES). */
  diagnosisCode?: string;
  surfaces?: ToothSurface[];
  /** Free text: the note itself, or a summary of the charting change. */
  summary: string;
  /** Unit price in MAD for treatment events. */
  price?: number;
  createdBy: Actor;
  createdAt: string;
  validatedBy?: Actor;
  validatedAt?: string;
  rejectedReason?: string;
  completedAt?: string;
  appointmentId?: string;
  invoiceId?: string;
  /** Charting change carried by the event: tooth state before and after. */
  chart?: { before: Partial<ToothChartState>; after: Partial<ToothChartState>; target: "status" | "plan" };
}

export interface LinkedAppointment {
  id: string;
  start: string;
  durationMin: number;
  chair: string;
  dentist: string;
  reasonKey: "care" | "implant" | "perio" | "checkup";
  status: "requested" | "confirmed" | "arrived" | "in_chair" | "completed" | "cancelled" | "no_show";
}

export interface LinkedInvoice {
  id: string;
  number: string;
  total: number;
  paid: number;
  status: "unpaid" | "partially_paid" | "paid" | "refunded" | "overdue";
}

export interface MedicalAlert {
  code: "penicillin_allergy" | "latex_allergy" | "anticoagulant" | "diabetes" | "pregnancy" | "hypertension";
  severity: "high" | "medium";
}

export interface PatientSummary {
  id: string;
  fileNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  insurance: "CNSS" | "CNOPS" | "AMO" | "none";
  alerts: MedicalAlert[];
  balance: number;
}

export interface OdontogramRecord {
  patient: PatientSummary;
  chart: StoredChart;
  events: ToothEvent[];
  appointments: LinkedAppointment[];
  invoices: LinkedInvoice[];
}
