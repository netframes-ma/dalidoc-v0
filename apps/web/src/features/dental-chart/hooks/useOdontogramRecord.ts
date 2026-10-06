"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiError, DentalChartApi } from "../api/dental-chart.api";
import type { OdontogramRecord } from "../types";

export type RecordState =
  | { status: "loading"; record: null; error: null }
  | { status: "error"; record: null; error: ApiError }
  | { status: "ready"; record: OdontogramRecord; error: null };

const LOADING: RecordState = { status: "loading", record: null, error: null };

/** Loads one patient's odontogram record and lets mutations patch it in place. */
export function useOdontogramRecord(api: DentalChartApi, patientId: string) {
  const [attempt, setAttempt] = useState(0);
  const key = `${patientId}#${attempt}`;
  const [result, setResult] = useState<{ key: string; state: RecordState } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getOdontogram(patientId).then((response) => {
      if (cancelled) return;
      setResult({
        key,
        state: response.error
          ? { status: "error", record: null, error: response.error }
          : { status: "ready", record: response.data, error: null },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [api, patientId, key]);

  const update = useCallback((recipe: (record: OdontogramRecord) => OdontogramRecord) => {
    setResult((r) => (r && r.state.status === "ready" ? { ...r, state: { ...r.state, record: recipe(r.state.record) } } : r));
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { state: result?.key === key ? result.state : LOADING, update, retry };
}
