"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, MessageCircle, FileText, ClipboardList, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Report",
    href: "/report",
    icon: FileText,
  },
  {
    name: "Assessment",
    href: "/assessment",
    icon: ClipboardList,
  },
  {
    name: "Account",
    href: "/account",
    icon: User,
  },
] as const

export default function MobileTabNavigation() {
  const pathname = usePathname()

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab, index) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon

          return (
            <Link key={tab.name} href={tab.href} className="relative flex-1" aria-label={tab.name}>
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                whileTap={{ scale: 0.95 }}
                initial={false}
                animate={{
                  y: isActive ? -2 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    layoutId="activeTab"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    rotate: { duration: 0.6 },
                  }}
                >
                  <Icon className="h-5 w-5 mb-1" />
                </motion.div>
                <motion.span
                  className="text-xs font-medium relative z-10"
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 500,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.name}
                </motion.span>

                {(tab.name === "Chat" || tab.name === "Report") && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
