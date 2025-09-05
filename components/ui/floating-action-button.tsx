"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export default function FloatingActionButton({
  onClick,
  icon = <Plus className="w-6 h-6" />,
  className,
}: FloatingActionButtonProps) {
  return (
    <motion.div
      className={cn("fixed bottom-24 right-6 z-40 md:bottom-8", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        {icon}
      </Button>
    </motion.div>
  )
}
