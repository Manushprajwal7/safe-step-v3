import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function SectionCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={cn("rounded-2xl border bg-card shadow-md", padded ? "p-4 md:p-6" : "", className)}>{children}</div>
  )
}
