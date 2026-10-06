"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { FieldError, Label, NativeSelect, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { NewToothEvent } from "../api/dental-chart.api";
import { ACTS, DIAGNOSES, type ActCode, type DiagnosisCode } from "../lib/acts";
import type { ToothEvent, ToothSurface } from "../types";

const SURFACES: readonly ToothSurface[] = ["mesial", "occlusal", "distal", "buccal", "lingual"];

export type FormKind = Exclude<ToothEvent["kind"], "completed">;

const schema = z
  .object({
    kind: z.enum(["diagnosis", "planned", "note"]),
    diagnosisCode: z.string().optional(),
    actCode: z.string().optional(),
    surfaces: z.array(z.enum(["mesial", "occlusal", "distal", "buccal", "lingual"])),
    summary: z.string().trim().max(280),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "diagnosis" && !value.diagnosisCode) ctx.addIssue({ code: "custom", path: ["diagnosisCode"], message: "required" });
    if (value.kind === "planned" && !value.actCode) ctx.addIssue({ code: "custom", path: ["actCode"], message: "required" });
    if (value.kind === "note" && value.summary.length < 3) ctx.addIssue({ code: "custom", path: ["summary"], message: "required" });
  });

type FormValues = z.infer<typeof schema>;

/** Quick entry for a tooth: a diagnosis, a planned act or a note. */
export function ToothEventForm({
  tooth,
  kind,
  busy,
  onSubmit,
  onCancel,
}: {
  tooth: number;
  kind: FormKind;
  busy: boolean;
  onSubmit: (event: NewToothEvent) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t, locale, fmt } = useI18n();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind, surfaces: [], summary: "", diagnosisCode: "", actCode: "" },
  });
  const { register, handleSubmit, formState, control, setValue } = form;
  const surfaces = useWatch({ control, name: "surfaces" });
  const actCode = useWatch({ control, name: "actCode" });
  const act = actCode ? ACTS[actCode as ActCode] : undefined;

  const submit = handleSubmit(async (values) => {
    const chosenAct = values.actCode ? ACTS[values.actCode as ActCode] : undefined;
    const diagnosis = values.diagnosisCode ? DIAGNOSES[values.diagnosisCode as DiagnosisCode] : undefined;
    const done = await onSubmit({
      tooth,
      kind: values.kind,
      diagnosisCode: values.diagnosisCode || undefined,
      actCode: values.actCode || undefined,
      price: chosenAct?.price,
      surfaces: values.surfaces.length ? values.surfaces : undefined,
      summary: values.summary || chosenAct?.label[locale] || diagnosis?.label[locale] || "",
    });
    if (done) onCancel();
  });

  const toggleSurface = (surface: ToothSurface) =>
    setValue("surfaces", surfaces.includes(surface) ? surfaces.filter((s) => s !== surface) : [...surfaces, surface]);

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-border bg-soft p-3.5" noValidate>
      <p className="text-[13px] font-semibold">{t(`form.title.${kind}`, { tooth })}</p>

      {kind === "diagnosis" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-diagnosis">{t("form.diagnosis")}</Label>
          <NativeSelect id="ev-diagnosis" {...register("diagnosisCode")} aria-invalid={!!formState.errors.diagnosisCode}>
            <option value="">{t("form.choose")}</option>
            {(Object.keys(DIAGNOSES) as DiagnosisCode[]).map((code) => (
              <option key={code} value={code}>
                {DIAGNOSES[code].label[locale]}
              </option>
            ))}
          </NativeSelect>
          <FieldError>{formState.errors.diagnosisCode ? t("form.required") : null}</FieldError>
        </div>
      )}

      {kind === "planned" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-act">{t("form.act")}</Label>
          <NativeSelect id="ev-act" {...register("actCode")} aria-invalid={!!formState.errors.actCode}>
            <option value="">{t("form.choose")}</option>
            {(Object.keys(ACTS) as ActCode[]).map((code) => (
              <option key={code} value={code}>
                {ACTS[code].label[locale]} — {fmt.money(ACTS[code].price)}
              </option>
            ))}
          </NativeSelect>
          <FieldError>{formState.errors.actCode ? t("form.required") : null}</FieldError>
        </div>
      )}

      {kind !== "note" && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[12.5px] font-medium">
            {t("form.surfaces")}
            {act && "surfaces" in act && <span className="font-normal text-muted-fg"> · {t("form.surfacesHint")}</span>}
          </legend>
          <div className="flex flex-wrap gap-1.5" dir="ltr">
            {SURFACES.map((surface) => (
              <button
                key={surface}
                type="button"
                aria-pressed={surfaces.includes(surface)}
                onClick={() => toggleSurface(surface)}
                className={cn(
                  "h-8 rounded-full border px-3 text-[12px] font-medium transition-colors",
                  surfaces.includes(surface) ? "border-primary bg-primary text-primary-fg" : "border-border bg-card hover:bg-soft",
                )}
              >
                {t(`surface.${surface}`)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ev-summary">{kind === "note" ? t("form.note") : t("form.comment")}</Label>
        <Textarea id="ev-summary" rows={2} {...register("summary")} aria-invalid={!!formState.errors.summary} />
        <FieldError>{formState.errors.summary ? t("form.noteRequired") : null}</FieldError>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={busy || formState.isSubmitting}>
          {t("form.add")}
        </Button>
      </div>
    </form>
  );
}
