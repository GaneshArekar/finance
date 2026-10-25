"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, ArrowRight, Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDashboard } from "@/components/dashboard-context";

interface RecentTxProps {
  transactions: any[];
  loading?: boolean;
}

export function RecentTransactionsWidget({ transactions, loading }: RecentTxProps) {
  const { setIsAddModalOpen, setEditingTransaction } = useDashboard();

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-3 animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
          <Plus className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Transactions Recorded Yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
          All dashboard figures are generated from actual records. Create your first transaction to populate your live analytics.
        </p>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add First Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest financial events in your account
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {transactions.slice(0, 5).map((tx) => {
          const isIncome = tx.type === "income";
          const isTransfer = tx.type === "transfer";

          const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowLeftRight : ArrowDownRight;
          const iconBg = isIncome
            ? "bg-emerald-500/10 text-emerald-500"
            : isTransfer
            ? "bg-blue-500/10 text-blue-500"
            : "bg-rose-500/10 text-rose-500";

          const amountColor = isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : isTransfer
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-900 dark:text-slate-100";

          const sign = isIncome ? "+" : isTransfer ? "⇄ " : "-";

          return (
            <div
              key={tx._id}
              onClick={() => {
                setEditingTransaction(tx);
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl ${iconBg} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                    <span>{formatDate(tx.date)}</span>
                    <span>•</span>
                    <span>{tx.categoryName || "General"}</span>
                    <span>•</span>
                    <span className="truncate">{tx.accountName || "Account"}</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-xs font-bold ${amountColor}`}>
                  {sign}
                  {formatCurrency(tx.amount)}
                </p>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {tx.paymentMethod || "UPI"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
