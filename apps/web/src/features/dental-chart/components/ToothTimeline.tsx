"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { cn } from "@/lib/utils";
import { DIAGNOSES, getAct } from "../lib/acts";
import type { ToothEvent } from "../types";

type EntryType = "created" | "signed" | "validated" | "rejected" | "completed";

interface Entry {
  at: string;
  type: EntryType;
  event: ToothEvent;
}

const DOT: Record<EntryType, string> = {
  created: "bg-[color-mix(in_srgb,var(--warning)_80%,transparent)]",
  signed: "bg-primary",
  validated: "bg-primary",
  rejected: "bg-danger",
  completed: "bg-success",
};

/** Builds the audit trail of a tooth: who entered, validated, rejected or completed what, and when. */
export function timelineEntries(events: readonly ToothEvent[]): Entry[] {
  const entries: Entry[] = [];
  for (const event of events) {
    const selfSigned = event.validatedAt === event.createdAt && event.status !== "rejected";
    entries.push({ at: event.createdAt, type: selfSigned ? "signed" : "created", event });
    if (event.validatedAt && !selfSigned) {
      entries.push({ at: event.validatedAt, type: event.status === "rejected" ? "rejected" : "validated", event });
    }
    if (event.completedAt) entries.push({ at: event.completedAt, type: "completed", event });
  }
  return entries.sort((a, b) => b.at.localeCompare(a.at));
}

export function ToothTimeline({ events }: { events: readonly ToothEvent[] }) {
  const { t, fmt, locale } = useI18n();
  const entries = timelineEntries(events);
  if (entries.length === 0) return <p className="py-2 text-[12.5px] text-muted-fg">{t("timeline.empty")}</p>;

  return (
    <ol className="relative flex flex-col gap-3.5 ps-5 before:absolute before:inset-y-1.5 before:start-[5px] before:w-px before:bg-border">
      {entries.map((entry) => {
        const { event } = entry;
        const label =
          getAct(event.actCode)?.label[locale] ??
          (event.diagnosisCode ? DIAGNOSES[event.diagnosisCode as keyof typeof DIAGNOSES]?.label[locale] : undefined) ??
          event.summary;
        const who = entry.type === "created" || entry.type === "signed" ? event.createdBy.name : (event.validatedBy?.name ?? event.createdBy.name);
        return (
          <li key={`${event.id}-${entry.type}`} className="relative">
            <span aria-hidden className={cn("absolute -start-5 top-1.5 size-[11px] rounded-full ring-3 ring-card", DOT[entry.type])} />
            <p className="text-[12.5px] leading-snug">
              <span className="font-medium">{t(`timeline.${entry.type}`, { who })}</span>
              <span className="text-muted-fg"> — {label}</span>
            </p>
            {entry.type === "rejected" && event.rejectedReason && (
              <p className="mt-0.5 text-[12px] text-danger">{t("timeline.reason", { reason: event.rejectedReason })}</p>
            )}
            <time dateTime={entry.at} className="mt-0.5 block font-mono text-[11px] text-muted-fg tnum">
              {fmt.dateTime(entry.at)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
