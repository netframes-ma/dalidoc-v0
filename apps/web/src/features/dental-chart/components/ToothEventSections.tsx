"use client";

import { CalendarCheck2, CheckCheck, ReceiptText } from "lucide-react";
import { useI18n } from "@/components/providers/AppProviders";
import { useCan } from "@/components/common/PermissionGate";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { ChartWorkflow } from "../hooks/useChartWorkflow";
import { DIAGNOSES, getAct } from "../lib/acts";
import { canTransition, isInvoiceable } from "../lib/tooth-event-status";
import type { OdontogramRecord, ToothEvent, ToothSurface } from "../types";

const SURFACE_LETTER: Record<ToothSurface, string> = { mesial: "M", occlusal: "O", distal: "D", buccal: "V", lingual: "L" };

export function surfaceCode(surfaces: readonly ToothSurface[] | undefined): string {
  return (surfaces ?? []).map((s) => SURFACE_LETTER[s]).join("");
}

interface SectionProps {
  title: string;
  empty: string;
  events: readonly ToothEvent[];
  record: OdontogramRecord;
  workflow: ChartWorkflow;
}

function EventRow({ event, record, workflow }: { event: ToothEvent; record: OdontogramRecord; workflow: ChartWorkflow }) {
  const { t, fmt, locale } = useI18n();
  const can = useCan();
  const act = getAct(event.actCode);
  const diagnosis = event.diagnosisCode ? DIAGNOSES[event.diagnosisCode as keyof typeof DIAGNOSES] : undefined;
  const title = act?.label[locale] ?? diagnosis?.label[locale] ?? event.summary;
  const showSummary = title !== event.summary;
  const appointment = record.appointments.find((a) => a.id === event.appointmentId);
  const invoice = record.invoices.find((i) => i.id === event.invoiceId);
  const canComplete = event.kind === "planned" && canTransition(event.status, "completed") && can("clinical:validate");
  const canInvoice = isInvoiceable(event.status) && !!event.price && can("billing:create");

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug font-medium">
            {title}
            {event.surfaces?.length ? <span className="ms-1.5 font-mono text-[11.5px] text-muted-fg">{surfaceCode(event.surfaces)}</span> : null}
          </p>
          {showSummary && <p className="mt-0.5 text-[12.5px] leading-snug text-muted-fg">{event.summary}</p>}
          <p className="mt-1 text-[11.5px] text-muted-fg">
            {event.createdBy.name} · {fmt.date(event.completedAt ?? event.createdAt)}
            {event.price && can("billing:read") ? <span className="tnum"> · {fmt.money(event.price)}</span> : null}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>
      {(appointment || invoice || canComplete || canInvoice) && (
        <div className="flex flex-wrap items-center gap-2">
          {appointment && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-soft px-2.5 text-[11.5px]">
              <CalendarCheck2 className="size-3.5 text-muted-fg" />
              <span className="font-mono tnum">{fmt.time(appointment.start)}</span> {fmt.weekdayDate(appointment.start)}
            </span>
          )}
          {invoice && can("billing:read") && (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-soft px-2.5 text-[11.5px]">
              <ReceiptText className="size-3.5 text-muted-fg" />
              <span className="font-mono">{invoice.number}</span> · {t(`payment.${invoice.status}`)}
            </span>
          )}
          <span className="ms-auto flex gap-1.5">
            {canInvoice && (
              <Button variant="outline" size="sm" onClick={() => void workflow.actions.invoice([event])} disabled={workflow.busy}>
                <ReceiptText />
                {t("event.invoice")}
              </Button>
            )}
            {canComplete && (
              <Button variant="soft" size="sm" onClick={() => void workflow.actions.complete(event)} disabled={workflow.busy}>
                <CheckCheck />
                {t("event.complete")}
              </Button>
            )}
          </span>
        </div>
      )}
    </li>
  );
}

function ToothEventSection({ title, empty, events, record, workflow }: SectionProps) {
  return (
    <section className="flex flex-col">
      <h3 className="eyebrow mb-1">
        {title} <span className="opacity-70">· {events.length}</span>
      </h3>
      {events.length === 0 ? (
        <p className="py-2 text-[12.5px] text-muted-fg">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">
          {events.map((event) => (
            <EventRow key={event.id} event={event} record={record} workflow={workflow} />
          ))}
        </ul>
      )}
    </section>
  );
}

type Props = Omit<SectionProps, "title" | "empty">;

export function DiagnosisSection(props: Props) {
  const { t } = useI18n();
  return <ToothEventSection title={t("section.diagnosis")} empty={t("section.diagnosisEmpty")} {...props} />;
}

export function PlannedTreatmentsSection(props: Props) {
  const { t } = useI18n();
  return <ToothEventSection title={t("section.planned")} empty={t("section.plannedEmpty")} {...props} />;
}

export function CompletedTreatmentsSection(props: Props) {
  const { t } = useI18n();
  return <ToothEventSection title={t("section.completed")} empty={t("section.completedEmpty")} {...props} />;
}

export function NotesSection(props: Props) {
  const { t } = useI18n();
  return <ToothEventSection title={t("section.notes")} empty={t("section.notesEmpty")} {...props} />;
}
