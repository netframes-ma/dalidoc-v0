import {
  CalendarDays,
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Pill,
  ReceiptText,
  Settings,
  Smile,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { MessageKey } from "@/lib/i18n/messages";

export interface NavItem {
  key: MessageKey;
  icon: LucideIcon;
  /** Route segment once the module exists; `null` while it is still on the roadmap. */
  href: ((patientId: string) => string) | null;
  match?: RegExp;
}

/** Modules in build order (docs/START_HERE.md); only built ones are links. */
export const NAV: readonly NavItem[] = [
  { key: "nav.dashboard", icon: LayoutDashboard, href: null },
  { key: "nav.agenda", icon: CalendarDays, href: null },
  { key: "nav.patients", icon: Users, href: null },
  { key: "nav.odontogram", icon: Smile, href: (id) => `/patients/${id}/odontogram`, match: /\/odontogram$/ },
  { key: "nav.plans", icon: ClipboardList, href: null },
  { key: "nav.billing", icon: ReceiptText, href: null },
  { key: "nav.prescriptions", icon: Pill, href: null },
  { key: "nav.communication", icon: MessageCircle, href: null },
  { key: "nav.reports", icon: ChartColumn, href: null },
  { key: "nav.settings", icon: Settings, href: null },
];
