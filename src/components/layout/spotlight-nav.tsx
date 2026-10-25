"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Plus,
  Calendar,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-context";
import { signOut, useSession } from "@/lib/auth-client";
import { PeriodFilter } from "@/lib/finance-calculations";
import { clearSessionActive } from "@/components/auth/session-guard";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Wealth Overview", subtitle: "Real-time assets, cash flow and net worth" },
  "/overview": { title: "Wealth Overview", subtitle: "Real-time assets, cash flow and net worth" },
  "/transactions": { title: "Transaction Ledger", subtitle: "All financial inflows, outflows and transfers" },
  "/budgets": { title: "Budget Planning", subtitle: "Monthly limits and utilization thresholds" },
  "/accounts": { title: "Accounts & Liquidity", subtitle: "Tracked repositories, bank vaults and cash" },
  "/savings": { title: "Capital Targets", subtitle: "Milestone savings goals and automated schedules" },
  "/reports": { title: "Financial Intelligence", subtitle: "Comparative audits and RFC 4180 CSV export" },
  "/ai-coach": { title: "AI Financial Advisor", subtitle: "Context-aware intelligence and advisory" },
  "/settings": { title: "Preferences & Privacy", subtitle: "System settings, currency and data management" },
};

export function SpotlightNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    period,
    setPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    setIsAddModalOpen,
  } = useDashboard();

  const currentInfo = pageMeta[pathname] || {
    title: "Personal Finance",
    subtitle: "Wealth and Budget Management",
  };

  const handleLogout = async () => {
    clearSessionActive();
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3 bg-[#000000]/85 backdrop-blur-xl border-b border-[#412D15]/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link href="/overview" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#412D15] to-[#E1DCC9] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#1F150C] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#E1DCC9]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#E1DCC9] uppercase">
                FinanceFlow
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#E1DCC9]/50 font-semibold">
                Private Wealth
              </span>
            </div>
          </Link>

          <div className="hidden md:block h-5 w-px bg-[#412D15]" />

          <div className="hidden md:block">
            <h1 className="text-xs font-bold text-[#E1DCC9] tracking-wide">
              {currentInfo.title}
            </h1>
            <p className="text-[10px] text-[#E1DCC9]/60 font-medium">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Period Filter & Quick Add & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Period Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1F150C] border border-[#412D15] hover:border-[#44444E] rounded-xl text-xs transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#D3DAD9]/70 shrink-0" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent text-[11px] font-semibold text-[#E1DCC9] focus:outline-none cursor-pointer"
            >
              <option value="this_month" className="bg-[#1F150C] text-[#E1DCC9]">This Month</option>
              <option value="last_month" className="bg-[#1F150C] text-[#E1DCC9]">Last Month</option>
              <option value="last_30_days" className="bg-[#1F150C] text-[#E1DCC9]">Last 30 Days</option>
              <option value="custom" className="bg-[#1F150C] text-[#E1DCC9]">Custom Window</option>
            </select>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-[#412D15]/80">
            <div className="w-7 h-7 rounded-full bg-[#37353E] border border-[#715A5A]/50 flex items-center justify-center text-[#D3DAD9] font-bold text-[11px]">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-[#E1DCC9] hover:bg-[#715A5A]/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
