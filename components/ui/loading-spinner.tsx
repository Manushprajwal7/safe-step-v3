"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn("bg-primary rounded-lg flex items-center justify-center", sizeClasses[size])}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Heart
          className={cn("text-primary-foreground", size === "sm" ? "w-2 h-2" : size === "md" ? "w-4 h-4" : "w-6 h-6")}
        />
      </motion.div>
    </div>
  )
}
