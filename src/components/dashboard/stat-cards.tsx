"use client";

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardsProps {
  totalBalance: number;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  loading?: boolean;
}

export function StatCards({
  totalBalance,
  income,
  expenses,
  netSavings,
  savingsRate,
  loading = false,
}: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tracked Balance",
      amount: formatCurrency(totalBalance),
      subtitle: "Combined across accounts",
      icon: Wallet,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Period Income",
      amount: formatCurrency(income),
      subtitle: "All eligible inflows",
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Period Expenses",
      amount: formatCurrency(expenses),
      subtitle: "All eligible outflows",
      icon: ArrowDownRight,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      title: "Net Savings",
      amount: formatCurrency(netSavings),
      subtitle: `${savingsRate}% savings rate`,
      icon: netSavings >= 0 ? PiggyBank : ArrowDownRight,
      color: netSavings >= 0 ? "text-emerald-400" : "text-rose-400",
      bgColor: netSavings >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      borderColor: netSavings >= 0 ? "border-emerald-500/20" : "border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${card.borderColor} shadow-sm transition-all hover:shadow-md hover:border-opacity-60`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {card.amount}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
