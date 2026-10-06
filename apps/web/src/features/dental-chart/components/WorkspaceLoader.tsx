"use client";

import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

/**
 * React Advanced Odontogram reads the DOM on mount, so the workspace renders
 * on the client only (Next.js `ssr: false` must live in a client component).
 */
const OdontogramWorkspace = dynamic(() => import("./OdontogramWorkspace").then((m) => m.OdontogramWorkspace), {
  ssr: false,
  loading: () => <WorkspaceSkeleton />,
});

export function WorkspaceLoader({ patientId }: { patientId: string }) {
  return <OdontogramWorkspace patientId={patientId} />;
}
