"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, Sun, Moon, Calendar, Menu, X } from "lucide-react";
import { useDashboard } from "@/components/dashboard-context";
import { useTheme } from "@/components/theme-provider";
import { Sidebar } from "./sidebar";
import { PeriodFilter } from "@/lib/finance-calculations";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Financial Overview", subtitle: "Real-time snapshot of your income, expenses & net wealth" },
  "/overview": { title: "Financial Overview", subtitle: "Real-time snapshot of your income, expenses & net wealth" },
  "/transactions": { title: "Transactions", subtitle: "Detailed ledger of all financial inflows, outflows & transfers" },
  "/budgets": { title: "Budget Planning", subtitle: "Monthly spending limits, progress bars & threshold alerts" },
  "/accounts": { title: "Accounts & Balances", subtitle: "Manage your bank accounts, cash wallets & savings balances" },
  "/savings": { title: "Savings Goals", subtitle: "Track milestones, target deadlines and contribution progress" },
  "/reports": { title: "Reports & Analytics", subtitle: "Periodic breakdown, spending trends & RFC 4180 CSV export" },
  "/ai-coach": { title: "AI Financial Advisor", subtitle: "Context-aware intelligence and spending analysis" },
  "/settings": { title: "Settings & Preferences", subtitle: "User profile, currency configuration & data management" },
};

export function TopNav() {
  const pathname = usePathname();
  const { period, setPeriod, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate, setIsAddModalOpen } = useDashboard();
  const { isDark, setTheme, theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageInfo = pageTitles[pathname] || {
    title: "Personal Finance",
    subtitle: "Manage your budget and money",
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {pageInfo.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Period Filter, Theme Toggle, Add Transaction */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Period Selector (shown on overview, transactions, reports) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Pickers (if custom selected) */}
          {period === "custom" && (
            <div className="hidden lg:flex items-center gap-1 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Quick Add Transaction Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
