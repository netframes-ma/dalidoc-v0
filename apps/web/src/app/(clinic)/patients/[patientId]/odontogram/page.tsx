import type { Metadata } from "next";
import { WorkspaceLoader } from "@/features/dental-chart/components/WorkspaceLoader";

export const metadata: Metadata = { title: "Schéma dentaire" };

export default async function OdontogramPage({ params }: PageProps<"/patients/[patientId]/odontogram">) {
  const { patientId } = await params;
  return <WorkspaceLoader patientId={patientId} />;
}
