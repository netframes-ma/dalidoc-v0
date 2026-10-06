import { redirect } from "next/navigation";
import { DEFAULT_PATIENT_ID } from "@/features/dental-chart/api/mock-data";

export default function Home() {
  redirect(`/patients/${DEFAULT_PATIENT_ID}/odontogram`);
}
