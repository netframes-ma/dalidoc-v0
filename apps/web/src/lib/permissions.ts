import type { Role } from "@/features/dental-chart/types";

export const ROLES: readonly Role[] = ["owner", "dentist", "assistant", "receptionist", "accountant"];

export type Permission =
  | "chart:read"
  | "chart:edit"
  | "clinical:validate"
  | "events:create"
  | "plans:create"
  | "billing:read"
  | "billing:create";

/**
 * UI-side permission matrix. It only decides what the interface offers: the API
 * enforces the same rules on every request (docs/SECURITY_AND_PRIVACY.md).
 */
const MATRIX: Record<Role, readonly Permission[]> = {
  owner: ["chart:read", "chart:edit", "clinical:validate", "events:create", "plans:create", "billing:read", "billing:create"],
  dentist: ["chart:read", "chart:edit", "clinical:validate", "events:create", "plans:create", "billing:read", "billing:create"],
  assistant: ["chart:read", "chart:edit", "events:create", "plans:create"],
  receptionist: ["chart:read", "billing:read"],
  accountant: ["chart:read", "billing:read", "billing:create"],
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
