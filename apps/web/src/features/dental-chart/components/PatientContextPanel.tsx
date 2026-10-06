"use client";

import { CalendarClock, Phone } from "lucide-react";
import { useI18n } from "@/components/providers/AppProviders";
import { MedicalAlertBanner } from "@/components/common/MedicalAlertBanner";
import { useCan } from "@/components/common/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { ageFrom } from "@/lib/i18n/format";
import { pickLinkedAppointment, useNow } from "@/lib/use-now";
import { initials } from "@/lib/utils";
import { isActive } from "../lib/tooth-event-status";
import type { OdontogramRecord } from "../types";

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  );
}

/** Who is in the chair: identity, medical alerts, linked appointment, plan and balance. */
export function PatientContextPanel({ record }: { record: OdontogramRecord }) {
  const { t, fmt } = useI18n();
  const can = useCan();
  const { patient, appointments, events } = record;
  const now = useNow();
  const linked = pickLinkedAppointment(appointments, now);
  const planned = events.filter((e) => e.kind === "planned" && e.status === "validated" && isActive(e));
  const plannedTotal = planned.reduce((sum, e) => sum + (e.price ?? 0), 0);
  const pending = events.filter((e) => e.status === "pending_validation").length;

  return (
    <section
      aria-label={t("context.label")}
      className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-card border border-border bg-card px-5 py-4 shadow-soft sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-[15px] font-semibold text-ink-fg">
          {initials(`${patient.firstName} ${patient.lastName}`)}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="mt-1 truncate text-[12px] text-muted-fg">
            <span className="font-mono">{patient.fileNumber}</span> · {t("context.age", { n: ageFrom(patient.birthDate, new Date(now)) })} ·{" "}
            {patient.insurance === "none" ? t("context.noCover") : patient.insurance}
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-muted-fg">
            <Phone className="size-3" />
            <span className="font-mono" dir="ltr">
              {patient.phone}
            </span>
          </p>
        </div>
      </div>

      <Block label={t("alerts.label")}>
        <MedicalAlertBanner alerts={patient.alerts} />
      </Block>

      <Block label={t("context.appointment")}>
        {linked ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
            <CalendarClock className="size-3.5 text-muted-fg" />
            <span className="font-mono font-medium tnum">{fmt.time(linked.start)}</span>
            <span className="text-muted-fg">
              {fmt.weekdayDate(linked.start)} · {t(`reason.${linked.reasonKey}`)} · {linked.chair}
            </span>
            {linked.status === "in_chair" && <Badge tone="brand" dot>{t("appointment.in_chair")}</Badge>}
          </p>
        ) : (
          <span className="text-[12.5px] text-muted-fg">{t("context.noAppointment")}</span>
        )}
      </Block>

      <Block label={t("context.plan")}>
        <p className="text-[12.5px]">
          <b className="font-semibold tnum">{t("context.plannedActs", { n: planned.length })}</b>
          {can("billing:read") && plannedTotal > 0 && <span className="text-muted-fg"> · {fmt.money(plannedTotal)}</span>}
        </p>
        {pending > 0 && (
          <Badge tone="warning" dot className="w-fit">
            {t("context.pending", { n: pending })}
          </Badge>
        )}
      </Block>

      {can("billing:read") && (
        <Block label={t("context.balance")}>
          <b className={patient.balance > 0 ? "text-[15px] text-warning tnum" : "text-[15px] tnum"}>
            {patient.balance > 0 ? fmt.money(patient.balance) : "—"}
          </b>
        </Block>
      )}
    </section>
  );
}
