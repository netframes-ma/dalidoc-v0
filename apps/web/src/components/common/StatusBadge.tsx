"use client";

import { useI18n } from "@/components/providers/AppProviders";
import { Badge } from "@/components/ui/badge";
import { STATUS_TONE } from "@/features/dental-chart/lib/tooth-event-status";
import type { ToothEventStatus } from "@/features/dental-chart/types";

export function StatusBadge({ status, className }: { status: ToothEventStatus; className?: string }) {
  const { t } = useI18n();
  return (
    <Badge tone={STATUS_TONE[status]} dot className={className}>
      {t(`status.${status}`)}
    </Badge>
  );
}
