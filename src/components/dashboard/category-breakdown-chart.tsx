"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#64748b", // slate
];

interface CategoryChartProps {
  data: { category: string; total: number; percentage: number }[];
  loading?: boolean;
}

export function CategoryBreakdownChart({ data, loading }: CategoryChartProps) {
  if (loading) {
    return (
      <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between animate-pulse">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-44 rounded-full border-8 border-slate-200 dark:border-slate-800 self-center w-40" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No Expense Categories</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Categorize your expenses to view your category spending distribution.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-0.5">
          <p className="font-semibold text-slate-200">{item.category}</p>
          <p className="text-emerald-400 font-bold">{formatCurrency(item.total)}</p>
          <p className="text-slate-400 text-[11px]">{item.percentage}% of total expenses</p>
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
            Expense Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Top spending categories
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="total"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
          {data.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-700 dark:text-slate-300 truncate">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.percentage}%
                </span>
                <span className="text-slate-400 text-[11px]">
                  ({formatCurrency(item.total)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
