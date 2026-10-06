import type {
  Actor,
  LinkedInvoice,
  OdontogramRecord,
  PatientSummary,
  SparseTeeth,
  StoredChart,
  ToothEvent,
  ToothSurface,
} from "../types";

/**
 * Client for the odontogram endpoints (docs/API_SPECIFICATION.md).
 *
 *   GET  /api/patients/:patientId/odontogram
 *   POST /api/patients/:patientId/tooth-events
 *   POST /api/tooth-events/:id/validate
 *   POST /api/tooth-events/:id/reject
 *   POST /api/tooth-events/:id/complete
 *   PUT  /api/patients/:patientId/odontogram/plan
 *   POST /api/invoices/from-treatment
 *
 * Responses follow `{ data }` / `{ error: { code, message } }`. Permissions are
 * enforced by the backend; the UI only hides what a role cannot do.
 */
export type ApiError = { code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "VALIDATION"; message: string };
export type ApiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: ApiError };

export interface NewToothEvent {
  tooth: number;
  kind: ToothEvent["kind"];
  summary: string;
  actCode?: string;
  diagnosisCode?: string;
  surfaces?: ToothSurface[];
  price?: number;
  appointmentId?: string;
  chart?: ToothEvent["chart"];
}

export interface DentalChartApi {
  listPatients(): Promise<ApiResult<PatientSummary[]>>;
  getOdontogram(patientId: string): Promise<ApiResult<OdontogramRecord>>;
  createToothEvents(patientId: string, events: NewToothEvent[], actor: Actor): Promise<ApiResult<{ events: ToothEvent[]; chart: StoredChart }>>;
  validateToothEvent(eventId: string, actor: Actor): Promise<ApiResult<{ event: ToothEvent; chart: StoredChart }>>;
  rejectToothEvent(eventId: string, reason: string, actor: Actor): Promise<ApiResult<{ event: ToothEvent }>>;
  completeToothEvent(eventId: string, actor: Actor, appointmentId?: string): Promise<ApiResult<{ event: ToothEvent; chart: StoredChart }>>;
  savePlanChart(patientId: string, plan: SparseTeeth | null, actor: Actor): Promise<ApiResult<StoredChart>>;
  invoiceFromTreatment(patientId: string, eventIds: string[], actor: Actor): Promise<ApiResult<{ invoice: LinkedInvoice; events: ToothEvent[] }>>;
}
