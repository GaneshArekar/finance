"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { DashboardProvider } from "@/components/dashboard-context";
import { SpotlightNav } from "./spotlight-nav";
import { GlassDock } from "./glass-dock";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { SessionGuard } from "@/components/auth/session-guard";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DashboardProvider>
          <SessionGuard>
            <div className="min-h-screen bg-[#000000] text-[#E1DCC9] antialiased flex flex-col transition-colors selection:bg-[#E1DCC9] selection:text-[#1F150C]">
              {/* Top Spotlight Header */}
              <SpotlightNav />

              {/* Main Content (padded at bottom to accommodate floating GlassDock) */}
              <main className="flex-1 w-full px-4 sm:px-8 py-6 pb-28 max-w-7xl mx-auto">
                {children}
              </main>

              {/* Bottom Floating Glass Dock */}
              <GlassDock />

              {/* Global Transaction Modal */}
              <TransactionModal />
            </div>
          </SessionGuard>
        </DashboardProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
