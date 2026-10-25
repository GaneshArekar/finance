"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetWidgetProps {
  budgets: {
    _id: string;
    categoryName: string;
    amount: number;
    spent: number;
    remaining: number;
    utilization: number;
    status: "normal" | "warning" | "exceeded";
    warningThreshold: number;
  }[];
  totalBudgeted: number;
  totalSpent: number;
  loading?: boolean;
}

export function BudgetProgressWidget({
  budgets,
  totalBudgeted,
  totalSpent,
  loading,
}: BudgetWidgetProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded" />
        </div>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Monthly Budgets Configured</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mb-3">
          Set spending limits for your overall budget or categories to prevent overspending.
        </p>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Create Budget Target <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Budget Utilization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudgeted)} budgeted
          </p>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-4">
        {budgets.slice(0, 4).map((b) => {
          const isExceeded = b.status === "exceeded";
          const isWarning = b.status === "warning";

          const barColor = isExceeded
            ? "bg-rose-500"
            : isWarning
            ? "bg-amber-500"
            : "bg-emerald-500";

          return (
            <div key={b._id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {b.categoryName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </span>
                  {isExceeded && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      Exceeded
                    </span>
                  )}
                  {isWarning && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Near Limit
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(100, b.utilization)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{b.utilization}% used</span>
                <span>
                  {b.remaining >= 0
                    ? `${formatCurrency(b.remaining)} remaining`
                    : `${formatCurrency(Math.abs(b.remaining))} over limit`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
