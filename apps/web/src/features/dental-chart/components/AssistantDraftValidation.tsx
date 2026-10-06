"use client";

import { Check, Hourglass, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FieldError, Label, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { ChartWorkflow } from "../hooks/useChartWorkflow";
import { DIAGNOSES, getAct } from "../lib/acts";
import type { ToothEvent } from "../types";

interface Props {
  events: readonly ToothEvent[];
  workflow: ChartWorkflow;
  canValidate: boolean;
  onSelectTooth?: (tooth: number) => void;
  compact?: boolean;
}

/**
 * Assistant entries waiting for a dentist. Validating writes the change into
 * the patient's chart; rejecting keeps the entry in the history with its
 * reason and takes the change off the chart.
 */
export function AssistantDraftValidation({ events, workflow, canValidate, onSelectTooth, compact = false }: Props) {
  const { t, fmt, locale } = useI18n();
  const [rejecting, setRejecting] = useState<ToothEvent | null>(null);

  if (events.length === 0) return null;

  return (
    <section aria-label={t("drafts.label")} className="flex flex-col gap-2">
      {!compact && (
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[13px] font-semibold">{t("drafts.title", { n: events.length })}</h3>
          <span className="text-[11.5px] text-muted-fg">{canValidate ? t("drafts.hintDentist") : t("drafts.hintAssistant")}</span>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {events.map((event) => {
          const act = getAct(event.actCode);
          const diagnosis = event.diagnosisCode ? DIAGNOSES[event.diagnosisCode as keyof typeof DIAGNOSES] : undefined;
          return (
            <li
              key={event.id}
              className="rounded-2xl border border-[color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[color-mix(in_srgb,var(--warning)_5%,var(--card))] p-3"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={onSelectTooth ? () => onSelectTooth(event.tooth) : undefined}
                  disabled={!onSelectTooth}
                  className={cn(
                    "grid h-9 min-w-11 shrink-0 place-items-center rounded-xl bg-ink px-2 font-mono text-[14px] font-semibold text-ink-fg",
                    onSelectTooth && "hover:ring-2 hover:ring-ring",
                  )}
                  aria-label={t("tooth.label", { tooth: event.tooth })}
                >
                  {event.tooth}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug font-medium">
                    {diagnosis ? `${diagnosis.label[locale]} — ` : act ? `${act.label[locale]} — ` : ""}
                    {event.summary}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11.5px] text-muted-fg">
                    <Hourglass className="size-3" />
                    {t("drafts.by", { name: event.createdBy.name, date: fmt.dateTime(event.createdAt) })}
                    {event.chart && workflow.isDraftOnChart(event) && <span>· {t("drafts.onChart")}</span>}
                  </p>
                </div>
              </div>
              {canValidate && (
                <div className="mt-2.5 flex justify-end gap-2">
                  <Button variant="danger-ghost" size="sm" onClick={() => setRejecting(event)} disabled={workflow.busy}>
                    <X />
                    {t("drafts.reject")}
                  </Button>
                  <Button size="sm" onClick={() => void workflow.actions.validate(event)} disabled={workflow.busy}>
                    <Check />
                    {t("drafts.validate")}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <RejectDialog
        event={rejecting}
        busy={workflow.busy}
        onClose={() => setRejecting(null)}
        onConfirm={async (reason) => {
          if (!rejecting) return;
          const done = await workflow.actions.reject(rejecting, reason);
          if (done) setRejecting(null);
        }}
      />
    </section>
  );
}

function RejectDialog({
  event,
  busy,
  onClose,
  onConfirm,
}: {
  event: ToothEvent | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = reason.trim().length < 3;

  return (
    <Dialog
      open={event !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setReason("");
          setTouched(false);
        }
      }}
    >
      <DialogContent closeLabel={t("common.close")}>
        <DialogTitle>{t("drafts.rejectTitle", { tooth: event?.tooth ?? "" })}</DialogTitle>
        <DialogDescription>{t("drafts.rejectDescription")}</DialogDescription>
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!invalid) void onConfirm(reason.trim());
          }}
        >
          <Label htmlFor="reject-reason">{t("drafts.reason")}</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={touched && invalid}
            aria-describedby="reject-reason-error"
            autoFocus
          />
          <div id="reject-reason-error">
            <FieldError>{touched && invalid ? t("drafts.reasonRequired") : null}</FieldError>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="danger" disabled={busy}>
              {t("drafts.reject")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
