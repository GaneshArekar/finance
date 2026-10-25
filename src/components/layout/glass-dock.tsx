"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Target,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";

const dockItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Ledger", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/savings", label: "Goals", icon: Target },
  { href: "/reports", label: "Analytics", icon: BarChart3 },
  { href: "/ai-coach", label: "AI Advisor", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function GlassDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-2xl glass-dock flex items-center gap-1 sm:gap-2 max-w-[95vw] overflow-x-auto shadow-2xl">
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === "/overview" && pathname === "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all group shrink-0 ${
              isActive
                ? "text-[#E1DCC9] bg-[#412D15]/90 border border-[#E1DCC9]/20 shadow-[0_0_15px_rgba(113,90,90,0.3)]"
                : "text-[#D3DAD9]/70 hover:text-[#E1DCC9] hover:bg-[#37353E]/60"
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                isActive ? "text-[#E1DCC9]" : "text-[#D3DAD9]/70"
              }`}
            />
            <span className="text-[11px] font-semibold">{item.label}</span>

            {isActive && (
              <motion.div
                layoutId="activeDockIndicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#E1DCC9] shadow-[0_0_8px_#E1DCC9]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
