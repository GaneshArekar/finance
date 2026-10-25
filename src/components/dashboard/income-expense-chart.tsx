"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ChartProps {
  data: { date: string; income: number; expense: number; net: number }[];
  loading?: boolean;
}

export function IncomeExpenseChart({ data, loading }: ChartProps) {
  if (loading) {
    return (
      <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Activity in Period</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Record your first income or expense to see visual cash flow comparisons.
        </p>
      </div>
    );
  }

  // Format short date for X-axis labels
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-300">{label}</p>
          <p className="text-emerald-400 flex justify-between gap-4">
            <span>Income:</span>
            <span className="font-bold">{formatCurrency(payload[0]?.value || 0)}</span>
          </p>
          <p className="text-rose-400 flex justify-between gap-4">
            <span>Expense:</span>
            <span className="font-bold">{formatCurrency(payload[1]?.value || 0)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Cash Flow Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Income vs Expense distribution over time
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              name="Income"
              dataKey="income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              name="Expense"
              dataKey="expense"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
