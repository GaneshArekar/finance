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
  LogOut,
  TrendingUp,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { clearSessionActive } from "@/components/auth/session-guard";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/savings", label: "Savings Goals", icon: Target },
  { href: "/reports", label: "Reports & CSV", icon: BarChart3 },
  { href: "/ai-coach", label: "AI Financial Advisor", icon: Sparkles, badge: "AI" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

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
    <aside
      className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 ${
        mobile ? "w-72" : "w-64 hidden md:flex shrink-0"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md">
          <TrendingUp className="w-5 h-5 font-bold" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white">FinanceFlow</span>
          <span className="block text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
            Wealth & Budget
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/overview" && pathname === "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs shrink-0">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-semibold text-white truncate">
                {session?.user?.name || "Member"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {session?.user?.email || "user@finance.app"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
