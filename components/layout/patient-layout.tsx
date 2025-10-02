"use client";

import type React from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import MobileTabNavigation from "./mobile-tab-navigation";
import PatientHeader from "./patient-header";
import PageTransition from "@/components/ui/page-transition";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { Activity } from "lucide-react";
import DesktopSidebar from "./desktop-sidebar";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showFAB = pathname === "/home";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      <DesktopSidebar />
      <div className="md:pl-64">
        <PatientHeader />
        <main className="pb-20 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileTabNavigation />

      <AnimatePresence>
        {showFAB && (
          <FloatingActionButton
            icon={<Activity className="w-6 h-6" />}
            onClick={() => {
              router.push("/session");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
