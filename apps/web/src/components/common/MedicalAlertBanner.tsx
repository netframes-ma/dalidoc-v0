"use client";

import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import type { MedicalAlert } from "@/features/dental-chart/types";

/** Medical alerts as chips; high-severity ones read first and in danger tone. */
export function MedicalAlertBanner({ alerts }: { alerts: readonly MedicalAlert[] }) {
  const { t } = useI18n();
  if (alerts.length === 0) return <span className="text-[12.5px] text-muted-fg">{t("alerts.none")}</span>;
  const sorted = [...alerts].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={t("alerts.label")}>
      {sorted.map((alert) => (
        <li key={alert.code}>
          <Badge tone={alert.severity === "high" ? "danger" : "warning"}>
            <ShieldAlert />
            {t(`alert.${alert.code}`)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
