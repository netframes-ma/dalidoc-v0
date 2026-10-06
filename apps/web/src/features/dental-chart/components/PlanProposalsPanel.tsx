"use client";

import { ClipboardList, Layers } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/providers/AppProviders";
import { useCan } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import * as engine from "../engine/engine";
import type { ChartWorkflow } from "../hooks/useChartWorkflow";
import { ACTS, type ActProposal } from "../lib/acts";
import { surfaceCode } from "./ToothEventSections";

function keyOf(p: ActProposal): string {
  return `${p.tooth}-${p.actCode ?? p.reason}`;
}

/**
 * From drawing to treatment plan: what the engine's Plan chart changes compared
 * with the Status chart, priced from the act catalogue, ready to become planned
 * tooth events.
 */
export function PlanProposalsPanel({ workflow, onSelectTooth }: { workflow: ChartWorkflow; onSelectTooth: (tooth: number) => void }) {
  const { t, fmt, locale } = useI18n();
  const can = useCan();
  const { proposals, busy, actions } = workflow;
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(new Set());

  const changesByTooth = useMemo(() => {
    void workflow.live;
    const map = new Map<number, string[]>();
    for (const change of engine.planChanges()) {
      const list = map.get(change.toothNo) ?? [];
      list.push(`${change.from} → ${change.to}`);
      map.set(change.toothNo, list);
    }
    return map;
  }, [workflow.live]);

  const billable = proposals.filter((p) => p.actCode !== null);
  const selected = billable.filter((p) => !excluded.has(keyOf(p)));
  const total = selected.reduce((sum, p) => sum + (p.actCode ? ACTS[p.actCode].price : 0), 0);
  const canPlan = can("plans:create");

  return (
    <Card>
      <CardHeader>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary-dark dark:text-primary">
          <Layers className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>{t("plan.title")}</CardTitle>
          <CardDescription>{t("plan.description")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {proposals.length === 0 ? (
          <EmptyState icon={<ClipboardList />} title={t("plan.emptyTitle")} description={t("plan.emptyDescription")} className="py-6" />
        ) : (
          <>
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {proposals.map((p) => {
                const act = p.actCode ? ACTS[p.actCode] : null;
                const key = keyOf(p);
                const checked = act !== null && !excluded.has(key);
                return (
                  <li key={key} className="flex items-start gap-3 px-3.5 py-3">
                    <input
                      type="checkbox"
                      className="mt-2 size-4 accent-[var(--primary)]"
                      checked={checked}
                      disabled={!act || !canPlan}
                      aria-label={t("plan.include", { tooth: p.tooth })}
                      onChange={() =>
                        setExcluded((prev) => {
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => onSelectTooth(p.tooth)}
                      className="grid h-9 min-w-11 shrink-0 place-items-center rounded-xl bg-ink px-2 font-mono text-[14px] font-semibold text-ink-fg hover:ring-2 hover:ring-ring"
                      aria-label={t("tooth.label", { tooth: p.tooth })}
                    >
                      {p.tooth}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[13px] font-medium", !act && "text-muted-fg")}>
                        {act ? act.label[locale] : t("plan.manual")}
                        {p.surfaces?.length ? <span className="ms-1.5 font-mono text-[11.5px] text-muted-fg">{surfaceCode(p.surfaces)}</span> : null}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-muted-fg">
                        {(changesByTooth.get(p.tooth) ?? []).join(" · ") || t(`plan.reason.${p.reason}`)}
                      </p>
                    </div>
                    {act && <span className="pt-1 font-mono text-[12.5px] tnum">{fmt.money(act.price)}</span>}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <p className="text-[12.5px] text-muted-fg">
                {t("plan.selected", { n: selected.length })} ·{" "}
                <b className="font-semibold text-fg tnum">{fmt.money(total)}</b>
              </p>
              {canPlan && (
                <Button className="ms-auto" onClick={() => void actions.planFromProposals(selected)} disabled={busy || selected.length === 0}>
                  <ClipboardList />
                  {t("plan.add", { n: selected.length })}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
