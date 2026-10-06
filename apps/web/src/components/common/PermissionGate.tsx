"use client";

import { usePreferences } from "@/components/providers/AppProviders";
import { can, type Permission } from "@/lib/permissions";

/** Renders `children` only for roles holding `permission`. The API enforces the same rule. */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { prefs } = usePreferences();
  return <>{can(prefs.role, permission) ? children : fallback}</>;
}

export function useCan(): (permission: Permission) => boolean {
  const { prefs } = usePreferences();
  return (permission) => can(prefs.role, permission);
}
