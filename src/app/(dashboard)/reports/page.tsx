"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function ReportsPage() {
  const { period, customStartDate, customEndDate } = useDashboard();
  const { error } = useToast();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && customStartDate && customEndDate) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setReport(json.report);
      }
    } catch {
      error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate, error]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCsv = () => {
    const params = new URLSearchParams({ period });
    if (period === "custom" && customStartDate && customEndDate) {
      params.set("startDate", customStartDate);
      params.set("endDate", customEndDate);
    }
    window.location.href = `/api/reports/export?${params.toString()}`;
  };

  const summary = report?.summary || {
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
    transactionCount: 0,
  };

  const comparison = report?.comparison || {
    prevIncome: 0,
    prevExpenses: 0,
    prevNetSavings: 0,
    incomeChange: 0,
    expenseChange: 0,
  };

  const categoryBreakdown = report?.categoryBreakdown || [];
  const timeline = report?.timeline || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E1DCC9]">Reports & Financial Analytics</h2>
            <p className="text-xs text-[#E1DCC9]/60">
              Aggregated income, expense trajectories and previous-period comparative growth
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Transactions (CSV)</span>
          </button>
        </div>

        {/* Previous Period Comparative Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Income Comparison */}
          <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-lg space-y-2">
            <span className="text-xs font-medium text-[#E1DCC9]/70">
              Period Income
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#E1DCC9]">
                {formatCurrency(summary.income)}
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
                  comparison.incomeChange >= 0 ? "badge-mint" : "badge-mauve"
                }`}
              >
                {comparison.incomeChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(comparison.incomeChange)}% vs prior
              </span>
            </div>
            <p className="text-[11px] text-[#E1DCC9]/50">
              Previous period: {formatCurrency(comparison.prevIncome)}
            </p>
          </div>

          {/* Expense Comparison */}
          <div className="p-6 rounded-3xl bg-[#37353E]/80 border border-[#44444E] shadow-lg space-y-2">
            <span className="text-xs font-medium text-[#D3DAD9]/70">
              Period Expenses
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#D3DAD9]">
                {formatCurrency(summary.expenses)}
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
                  comparison.expenseChange <= 0 ? "badge-mint" : "badge-mauve"
                }`}
              >
                {comparison.expenseChange <= 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                {Math.abs(comparison.expenseChange)}% vs prior
              </span>
            </div>
            <p className="text-[11px] text-[#D3DAD9]/50">
              Previous period: {formatCurrency(comparison.prevExpenses)}
            </p>
          </div>

          {/* Savings Rate */}
          <div className="p-6 rounded-3xl bg-[#715A5A]/25 border border-[#715A5A]/50 shadow-lg space-y-2">
            <span className="text-xs font-medium text-[#D3DAD9]/80">
              Net Savings & Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#E1DCC9]">
                {formatCurrency(summary.netSavings)}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg badge-mint">
                {summary.savingsRate}% Rate
              </span>
            </div>
            <p className="text-[11px] text-[#D3DAD9]/50">
              {summary.transactionCount} transactions analyzed
            </p>
          </div>
        </div>

        {/* Cash Flow Timeline Chart */}
        <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#E1DCC9]">
                Financial Progression & Net Savings
              </h3>
              <p className="text-xs text-[#E1DCC9]/60">
                Daily net balance trajectory across the reporting window
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#E1DCC9]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E1DCC9]" />
                Income
              </span>
              <span className="flex items-center gap-1.5 text-[#D3DAD9]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#715A5A]" />
                Expense
              </span>
              <span className="flex items-center gap-1.5 text-[#D3DAD9]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D3DAD9]" />
                Net
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <KineticTextLoader text="Loading" size="sm" />
              <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Generating financial timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-[#E1DCC9]/50">
              No daily transactions in this period to graph
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#412D15" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#8c6239"
                    fontSize={11}
                    tickFormatter={(d) => new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#8c6239"
                    fontSize={11}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F150C",
                      borderColor: "#412D15",
                      borderRadius: "16px",
                      color: "#E1DCC9",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                    }}
                    formatter={(v: any) => [formatCurrency(Number(v)), ""]}
                  />
                  <Line
                    type="monotone"
                    name="Income"
                    dataKey="income"
                    stroke="#E1DCC9"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#E1DCC9" }}
                  />
                  <Line
                    type="monotone"
                    name="Expense"
                    dataKey="expense"
                    stroke="#715A5A"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#715A5A" }}
                  />
                  <Line
                    type="monotone"
                    name="Net Savings"
                    dataKey="net"
                    stroke="#D3DAD9"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Expense Table */}
        <div className="rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl overflow-hidden">
          <div className="p-5 border-b border-[#412D15] flex items-center justify-between bg-[#37353E]/50">
            <div>
              <h3 className="text-sm font-bold text-[#E1DCC9]">
                Category Expense Audit
              </h3>
              <p className="text-xs text-[#E1DCC9]/60">
                Sorted by highest spend volume
              </p>
            </div>
            <span className="text-xs text-[#D3DAD9]/60">{categoryBreakdown.length} active categories</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#37353E]/90 border-b border-[#44444E] text-[#D3DAD9] uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Transactions</th>
                  <th className="py-3 px-4 text-right">Share of Outflows</th>
                  <th className="py-3 px-4 text-right">Total Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#412D15]/60">
                {categoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#E1DCC9]/50">
                      No categorized expense records found in this reporting window
                    </td>
                  </tr>
                ) : (
                  categoryBreakdown.map((c: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#37353E]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#E1DCC9]">
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium badge-twilight inline-block">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#D3DAD9]/70">
                        {c.count} transactions
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#D3DAD9]">
                        {c.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#E1DCC9]">
                        {formatCurrency(c.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
