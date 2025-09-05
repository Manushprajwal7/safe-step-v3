import type React from "react"
import PatientLayout from "@/components/layout/patient-layout"

export default function PatientGroupLayout({ children }: { children: React.ReactNode }) {
  return <PatientLayout>{children}</PatientLayout>
}
