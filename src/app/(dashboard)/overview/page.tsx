"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "@/components/dashboard-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const LUXE_PIE_COLORS = ["#E1DCC9", "#715A5A", "#D3DAD9", "#412D15", "#44444E", "#8c6239", "#37353E"];

export default function OverviewPage() {
  const {
    period,
    setPeriod,
    customStartDate,
    customEndDate,
    refreshKey,
    triggerRefresh,
    setIsAddModalOpen,
    setEditingTransaction,
  } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && customStartDate && customEndDate) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const [summaryRes, txRes] = await Promise.all([
        fetch(`/api/summary?${params.toString()}`),
        fetch(`/api/transactions?limit=6&sortBy=date&sortOrder=desc`),
      ]);

      if (summaryRes.ok) {
        const json = await summaryRes.json();
        setData(json.data);
      }
      if (txRes.ok) {
        const txJson = await txRes.json();
        setRecentTxs(txJson.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const summary = data?.summary || {
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
    totalBalance: 0,
  };

  const report = data?.report || {
    timeline: [],
    categoryBreakdown: [],
  };

  const budgets = data?.budgets?.budgets || [];
  const totalBudgeted = data?.budgets?.totalBudgeted || 0;
  const totalSpent = data?.budgets?.totalSpent || 0;

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1F150C] border border-[#412D15] p-3 rounded-xl shadow-2xl text-xs space-y-1 text-[#E1DCC9]">
          <p className="font-bold text-[#E1DCC9]/60">{label}</p>
          <p className="flex justify-between gap-4 font-semibold text-[#E1DCC9]">
            <span>Income:</span>
            <span>{formatCurrency(payload[0]?.value || 0)}</span>
          </p>
          <p className="flex justify-between gap-4 font-semibold text-[#8c6239]">
            <span>Expense:</span>
            <span>{formatCurrency(payload[1]?.value || 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Plink-Style Hero Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1F150C] border border-[#412D15] p-6 sm:p-10 shadow-2xl transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E1DCC9]/60">
                  Total Tracked Net Worth
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/20">
                  Live Sync
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#E1DCC9]">
                {loading ? "..." : formatCurrency(summary.totalBalance)}
              </div>
              <p className="text-xs text-[#E1DCC9]/70 max-w-md leading-relaxed">
                Aggregated liquid balances across all linked bank accounts, digital vaults, and physical cash.
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-2xl text-xs font-bold shadow-lg transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Record Transaction
              </button>

              <Link
                href="/ai-coach"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#412D15]/80 hover:bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/30 rounded-2xl text-xs font-semibold shadow-md transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Advisory
              </Link>
            </div>
          </div>

          {/* Period Financial Stat Highlights inside Hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#412D15]/80">
            <div className="p-3.5 rounded-2xl bg-[#1F150C]/90 border border-[#412D15] shadow-sm">
              <span className="text-[11px] font-semibold text-[#E1DCC9]/70">Period Inflow</span>
              <p className="text-xl font-bold text-[#E1DCC9] mt-0.5">
                {formatCurrency(summary.income)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#37353E]/80 border border-[#44444E] shadow-sm">
              <span className="text-[11px] font-semibold text-[#D3DAD9]/70">Period Outflow</span>
              <p className="text-xl font-bold text-[#D3DAD9] mt-0.5">
                {formatCurrency(summary.expenses)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#715A5A]/25 border border-[#715A5A]/50 shadow-sm">
              <span className="text-[11px] font-semibold text-[#D3DAD9]/80">Net Savings ({summary.savingsRate}%)</span>
              <p className={`text-xl font-bold mt-0.5 ${summary.netSavings >= 0 ? "text-[#E1DCC9]" : "text-[#D3DAD9]"}`}>
                {formatCurrency(summary.netSavings)}
              </p>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bento Item 1: Cash Flow Distribution Chart (Span 2) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#1F150C] border border-[#412D15] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E1DCC9]">Cash Flow Distribution</h3>
                <p className="text-xs text-[#E1DCC9]/60">Inflows vs Outflows timeline</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#E1DCC9]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E1DCC9]" />
                  Inflow
                </span>
                <span className="flex items-center gap-1.5 text-[#D3DAD9]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#715A5A]" />
                  Outflow
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {report.timeline.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#E1DCC9]/50">
                  No transaction data for this time period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#412D15" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#8c6239"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    />
                    <YAxis
                      stroke="#8c6239"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar name="Inflows" dataKey="income" fill="#E1DCC9" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar name="Outflows" dataKey="expense" fill="#715A5A" stroke="#D3DAD9" strokeWidth={0.5} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bento Item 2: Expense Allocation Donut (Span 1) */}
          <div className="rounded-3xl bg-[#1F150C] border border-[#412D15] p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#E1DCC9]">Outflow Allocation</h3>
              <p className="text-xs text-[#E1DCC9]/60">By category share</p>
            </div>

            <div className="h-44 w-full">
              {report.categoryBreakdown.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#E1DCC9]/50">
                  No categorized expenses recorded
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="total"
                    >
                      {report.categoryBreakdown.map((_: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={LUXE_PIE_COLORS[idx % LUXE_PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-[#1F150C] border border-[#412D15] p-2 rounded-xl text-xs text-[#E1DCC9]">
                              <p className="font-bold">{item.category}</p>
                              <p>{formatCurrency(item.total)} ({item.percentage}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top 3 categories */}
            <div className="space-y-1.5 pt-2 border-t border-[#412D15]/60">
              {report.categoryBreakdown.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: LUXE_PIE_COLORS[idx % LUXE_PIE_COLORS.length] }}
                    />
                    <span className="text-[#E1DCC9]/80 truncate">{item.category}</span>
                  </div>
                  <span className="font-bold text-[#E1DCC9]">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bento Row 2: Budget Tracking & Recent Transactions Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bento Item 3: Budget Utilization Widget (Span 1) with Slate Styling */}
          <div className="rounded-3xl bg-[#37353E]/45 border border-[#44444E] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#D3DAD9]">Budget Utilization</h3>
                <p className="text-xs text-[#D3DAD9]/70">
                  {formatCurrency(totalSpent)} of {formatCurrency(totalBudgeted)}
                </p>
              </div>
              <Link href="/budgets" className="text-xs font-semibold text-[#D3DAD9] hover:text-white hover:underline">
                View All
              </Link>
            </div>

            {budgets.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#D3DAD9]/50">
                No active monthly budgets set.
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 3).map((b: any) => {
                  const isHigh = b.utilization >= 80;
                  return (
                    <div key={b._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#D3DAD9]">{b.categoryName}</span>
                        <span className={isHigh ? "text-[#715A5A] font-bold" : "text-[#D3DAD9]/80"}>{b.utilization}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#000000] border border-[#44444E] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isHigh ? "bg-[#715A5A]" : "bg-[#D3DAD9]"}`}
                          style={{ width: `${Math.min(100, b.utilization)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bento Item 4: Recent Transactions Stream (Span 2) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#1F150C] border border-[#412D15] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#E1DCC9]">Recent Ledger Entries</h3>
                <p className="text-xs text-[#E1DCC9]/60">Latest financial activities</p>
              </div>
              <Link href="/transactions" className="text-xs font-semibold text-[#E1DCC9] hover:underline">
                Open Ledger
              </Link>
            </div>

            {recentTxs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#E1DCC9]/50">
                No transactions recorded yet. Click "Record Transaction" above.
              </div>
            ) : (
              <div className="divide-y divide-[#412D15]/60">
                {recentTxs.slice(0, 5).map((tx) => {
                  const isIncome = tx.type === "income";
                  const isTransfer = tx.type === "transfer";
                  const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowLeftRight : ArrowDownRight;

                  const badgeClass = isIncome
                    ? "bg-[#E1DCC9]/15 text-[#E1DCC9] border border-[#E1DCC9]/30"
                    : isTransfer
                    ? "bg-[#44444E]/60 text-[#D3DAD9] border border-[#44444E]"
                    : "bg-[#715A5A]/30 text-[#D3DAD9] border border-[#715A5A]/50";

                  const amountColor = isIncome
                    ? "text-[#E1DCC9]"
                    : isTransfer
                    ? "text-[#D3DAD9]"
                    : "text-[#D3DAD9]/90";

                  return (
                    <div
                      key={tx._id}
                      onClick={() => {
                        setEditingTransaction(tx);
                        setIsAddModalOpen(true);
                      }}
                      className="py-3 px-2 flex items-center justify-between hover:bg-[#37353E]/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${badgeClass} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#E1DCC9] truncate">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#E1DCC9]/60 truncate">
                              {formatDate(tx.date)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium badge-twilight">
                              {tx.categoryName || "General"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${amountColor}`}>
                          {isIncome ? "+" : isTransfer ? "⇄ " : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="block text-[10px] text-[#D3DAD9]/40 uppercase">
                          {tx.accountName || "Account"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

