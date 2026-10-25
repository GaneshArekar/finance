"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

export default function BudgetsPage() {
  const { categories, refreshKey, triggerRefresh } = useDashboard();
  const { success, error } = useToast();

  const [currentMonth, setCurrentMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [budgetsData, setBudgetsData] = useState<any>(null);

  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date().toISOString().slice(0, 7));
    }
  }, [currentMonth]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBudgets = useCallback(async () => {
    if (!currentMonth) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${currentMonth}`);
      if (res.ok) {
        const json = await res.json();
        setBudgetsData(json.data);
      }
    } catch {
      error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [currentMonth, error]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets, refreshKey]);

  const handleOpenModal = (budget: any = null) => {
    if (budget) {
      setEditingBudget(budget);
      setSelectedCategory(budget.categoryId || "");
      setAmount(budget.amount.toString());
      setWarningThreshold(budget.warningThreshold || 80);
    } else {
      setEditingBudget(null);
      setSelectedCategory("");
      setAmount("");
      setWarningThreshold(80);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      error("Please enter a valid positive budget amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const catObj = categories.find((c) => c._id === selectedCategory);
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          categoryId: selectedCategory || null,
          categoryName: catObj ? catObj.name : "Overall Monthly",
          amount: parsedAmt,
          warningThreshold,
        }),
      });

      if (!res.ok) throw new Error("Failed to save budget");

      success(editingBudget ? "Budget updated successfully" : "Budget created successfully");
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      const res = await fetch(`/api/budgets/${budgetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
      success("Budget removed");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const budgets = budgetsData?.budgets || [];
  const totalBudgeted = budgetsData?.totalBudgeted || 0;
  const totalSpent = budgetsData?.totalSpent || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E1DCC9]">Budget Management</h2>
            <p className="text-xs text-[#E1DCC9]/60">
              Set spending limits, monitor category utilization and prevent overruns
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-[#1F150C] border border-[#412D15] rounded-xl text-[#E1DCC9] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
            />
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Set Budget</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-lg">
            <span className="text-xs font-medium text-[#E1DCC9]/70">Total Budgeted</span>
            <p className="text-2xl font-bold text-[#E1DCC9] mt-1">
              {formatCurrency(totalBudgeted)}
            </p>
            <p className="text-[11px] text-[#E1DCC9]/40 mt-1">Configured for {currentMonth}</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#37353E]/80 border border-[#44444E] shadow-lg">
            <span className="text-xs font-medium text-[#D3DAD9]/70">Total Spent</span>
            <p className="text-2xl font-bold text-[#D3DAD9] mt-1">
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-[11px] text-[#D3DAD9]/40 mt-1">Eligible period expenses</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#715A5A]/25 border border-[#715A5A]/50 shadow-lg">
            <span className="text-xs font-medium text-[#D3DAD9]/80">Net Balance</span>
            <p
              className={`text-2xl font-bold mt-1 ${
                totalBudgeted - totalSpent >= 0 ? "text-[#E1DCC9]" : "text-[#D3DAD9]"
              }`}
            >
              {formatCurrency(totalBudgeted - totalSpent)}
            </p>
            <p className="text-[11px] text-[#D3DAD9]/50 mt-1">
              {totalBudgeted > 0
                ? `${Math.round((totalSpent / totalBudgeted) * 100)}% overall utilization`
                : "No overall cap"}
            </p>
          </div>
        </div>

        {/* Budgets List Grid */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-[#1F150C] border border-[#412D15] flex flex-col items-center justify-center text-center">
            <KineticTextLoader text="Loading" size="sm" />
            <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Calculating budget allocations...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#1F150C] border border-[#412D15] text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#37353E] border border-[#44444E] text-[#D3DAD9] flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#E1DCC9]">No Budgets for {currentMonth}</h3>
            <p className="text-xs text-[#E1DCC9]/60 mt-1 max-w-sm mb-4">
              Set spending targets for your overall monthly expenses or specific categories like Groceries, Rent, or Dining.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl text-xs font-bold shadow-md transition-all"
            >
              Add First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b: any) => {
              const isExceeded = b.status === "exceeded";
              const isWarning = b.status === "warning";

              const cardBg = isExceeded
                ? "bg-[#715A5A]/25 border-[#715A5A]"
                : isWarning
                ? "bg-[#37353E]/70 border-[#715A5A]/70"
                : "bg-[#1F150C] border-[#412D15]";

              const barColor = isExceeded
                ? "bg-[#715A5A]"
                : isWarning
                ? "bg-[#715A5A]"
                : "bg-[#E1DCC9]";

              return (
                <div
                  key={b._id}
                  className={`p-5 rounded-3xl border ${cardBg} shadow-md space-y-4 transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#E1DCC9]">
                        {b.categoryName}
                      </h4>
                      <p className="text-[11px] text-[#D3DAD9]/60">
                        Threshold alert at {b.warningThreshold}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(b)}
                        className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-[#E1DCC9] hover:bg-[#37353E] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-[#E1DCC9]">
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-xs text-[#D3DAD9]/70">
                      of {formatCurrency(b.amount)} limit
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2 bg-[#000000] border border-[#44444E] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, b.utilization)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-[#D3DAD9]">
                        {b.utilization}% used
                      </span>
                      <span
                        className={
                          b.remaining >= 0
                            ? "text-[#E1DCC9] font-medium"
                            : "text-[#D3DAD9] font-medium"
                        }
                      >
                        {b.remaining >= 0
                          ? `${formatCurrency(b.remaining)} remaining`
                          : `${formatCurrency(Math.abs(b.remaining))} exceeded`}
                      </span>
                    </div>
                  </div>

                  {/* Alert banner if near or over */}
                  {isExceeded && (
                    <div className="p-2.5 rounded-2xl bg-[#715A5A]/35 border border-[#715A5A] text-[#D3DAD9] text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#D3DAD9]" />
                      <span>Budget exceeded by {formatCurrency(Math.abs(b.remaining))}!</span>
                    </div>
                  )}
                  {isWarning && (
                    <div className="p-2.5 rounded-2xl bg-[#37353E] border border-[#44444E] text-[#D3DAD9] text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#715A5A]" />
                      <span>Warning: {b.utilization}% of limit reached</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Budget Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-[#E1DCC9]">
                {editingBudget ? "Edit Budget Target" : "Set New Budget Target"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Category (Leave empty for Overall Monthly Budget)
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  >
                    <option value="" className="bg-[#1F150C]">Overall Monthly Budget (All categories)</option>
                    {categories
                      .filter((c) => c.type === "expense")
                      .map((c) => (
                        <option key={c._id} value={c._id} className="bg-[#1F150C]">
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Budget Limit Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="e.g., 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-base font-semibold bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    <span>Warning Alert Threshold</span>
                    <span className="font-bold text-[#E1DCC9]">{warningThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10))}
                    className="w-full accent-[#715A5A]"
                  />
                  <p className="text-[11px] text-[#D3DAD9]/50 mt-1">
                    You will receive visual warning alerts when expenses exceed this threshold.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
