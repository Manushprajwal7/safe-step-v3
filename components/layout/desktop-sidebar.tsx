"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  FileText,
  ClipboardList,
  User,
  Settings,
  Heart,
  HelpCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    icon: Home,
  },
  {
    name: "Session",
    href: "/session",
    icon: Activity,
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
];

const additionalItems = [
  {
    name: "Profile Settings",
    href: "/settings/profile",
    icon: Settings,
  },
  {
    name: "Preferences",
    href: "/settings/preferences",
    icon: Heart,
  },
  {
    name: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-serif font-bold text-gray-800">
              Safe Step
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 mt-8">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </div>
            <nav className="space-y-1">
              {additionalItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
