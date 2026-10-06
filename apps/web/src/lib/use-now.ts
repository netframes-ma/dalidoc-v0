"use client";

import { useSyncExternalStore } from "react";

/**
 * The current time, refreshed every 30 s — a shared external store, so
 * components can read "now" during render without breaking purity.
 */
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      for (const l of listeners) l();
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now,
    () => now,
  );
}

/** Today's appointment if there is one, else the next upcoming one. */
export function pickLinkedAppointment<T extends { start: string }>(appointments: readonly T[], nowMs: number): T | undefined {
  const today = new Date(nowMs).toDateString();
  return (
    appointments.find((a) => new Date(a.start).toDateString() === today) ??
    appointments.filter((a) => new Date(a.start).getTime() > nowMs).sort((a, b) => a.start.localeCompare(b.start))[0]
  );
}
