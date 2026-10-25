"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Target,
  Plus,
  Repeat,
  CheckCircle2,
  Calendar,
  Trash2,
  ArrowRight,
  Loader2,
  Play,
  Pause,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

export default function SavingsPage() {
  const { accounts, categories, refreshKey, triggerRefresh } = useDashboard();
  const { success, error } = useToast();

  const [tab, setTab] = useState<"goals" | "recurring">("goals");
  const [goals, setGoals] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Goal Creation Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("0");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalCategory, setGoalCategory] = useState("Emergency Fund");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Goal Contribution Modal
  const [contributeGoal, setContributeGoal] = useState<any | null>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [contribNote, setContribNote] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  // Recurring Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleType, setRuleType] = useState<"income" | "expense">("expense");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleAmount, setRuleAmount] = useState("");
  const [ruleAccount, setRuleAccount] = useState("");
  const [ruleCategory, setRuleCategory] = useState("");
  const [ruleFreq, setRuleFreq] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [ruleStart, setRuleStart] = useState("");
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [isProcessingRules, setIsProcessingRules] = useState(false);

  useEffect(() => {
    if (!ruleStart) {
      setRuleStart(new Date().toISOString().slice(0, 10));
    }
  }, [ruleStart]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, rulesRes] = await Promise.all([
        fetch("/api/savings"),
        fetch("/api/recurring"),
      ]);

      if (goalsRes.ok) {
        const json = await goalsRes.json();
        setGoals(json.goals || []);
      }
      if (rulesRes.ok) {
        const json = await rulesRes.json();
        setRules(json.rules || []);
      }
    } catch {
      error("Failed to load goals or recurring schedules");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Goal Handlers
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) {
      error("Target amount must be a positive number");
      return;
    }

    setIsSavingGoal(true);
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName,
          targetAmount: target,
          currentAmount: parseFloat(goalCurrent) || 0,
          deadline: goalDeadline || null,
          category: goalCategory,
        }),
      });

      if (!res.ok) throw new Error("Failed to create goal");

      success("Savings goal created");
      setIsGoalModalOpen(false);
      setGoalName("");
      setGoalTarget("");
      setGoalCurrent("0");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contribAmount);
    if (isNaN(amt) || amt <= 0) {
      error("Contribution must be positive");
      return;
    }

    setIsContributing(true);
    try {
      const res = await fetch(`/api/savings/${contributeGoal._id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          note: contribNote,
        }),
      });

      if (!res.ok) throw new Error("Failed to record contribution");

      success(`Contributed ${formatCurrency(amt)} towards ${contributeGoal.name}`);
      setContributeGoal(null);
      setContribAmount("");
      setContribNote("");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsContributing(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      const res = await fetch(`/api/savings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete goal");
      success("Savings goal deleted");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  // Recurring Handlers
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(ruleAmount);
    if (isNaN(amt) || amt <= 0) {
      error("Amount must be positive");
      return;
    }

    setIsSavingRule(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: ruleType,
          description: ruleDesc,
          amount: amt,
          accountId: ruleAccount || accounts[0]?._id,
          categoryId: ruleCategory || undefined,
          frequency: ruleFreq,
          startDate: ruleStart,
        }),
      });

      if (!res.ok) throw new Error("Failed to create recurring rule");

      success("Recurring schedule created");
      setIsRuleModalOpen(false);
      setRuleDesc("");
      setRuleAmount("");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSavingRule(false);
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle rule");
      success("Rule updated");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete rule");
      success("Rule deleted");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleProcessDueRules = async () => {
    setIsProcessingRules(true);
    try {
      const res = await fetch("/api/recurring/process", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process recurring transactions");

      success(json.message);
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsProcessingRules(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E1DCC9]">Savings & Recurring</h2>
            <p className="text-xs text-[#E1DCC9]/60">
              Track milestones, capital accumulation and automated recurring schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-[#1F150C] border border-[#412D15] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTab("goals")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tab === "goals"
                    ? "bg-[#E1DCC9] text-[#1F150C] font-bold shadow-sm"
                    : "text-[#D3DAD9]/70 hover:text-[#E1DCC9]"
                }`}
              >
                Savings Goals ({goals.length})
              </button>
              <button
                onClick={() => setTab("recurring")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tab === "recurring"
                    ? "bg-[#E1DCC9] text-[#1F150C] font-bold shadow-sm"
                    : "text-[#D3DAD9]/70 hover:text-[#E1DCC9]"
                }`}
              >
                Recurring Rules ({rules.length})
              </button>
            </div>

            {tab === "goals" ? (
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> New Goal
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleProcessDueRules}
                  disabled={isProcessingRules}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D3DAD9] bg-[#37353E] border border-[#44444E] hover:bg-[#44444E] rounded-xl transition-all disabled:opacity-50"
                  title="Run idempotent occurrence check"
                >
                  {isProcessingRules ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-[#E1DCC9]" />
                  )}
                  Process Due
                </button>
                <button
                  onClick={() => setIsRuleModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Add Rule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Savings Goals */}
        {tab === "goals" && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-16 rounded-3xl bg-[#1F150C] border border-[#412D15] flex flex-col items-center justify-center text-center">
                <KineticTextLoader text="Loading" size="sm" />
                <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Loading savings milestones...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#1F150C] border border-[#412D15] text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#37353E] border border-[#44444E] text-[#D3DAD9] flex items-center justify-center mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#E1DCC9]">No Savings Goals Set</h3>
                <p className="text-xs text-[#E1DCC9]/60 mt-1 max-w-sm mb-4">
                  Define targeted milestones like Emergency Reserve, Vacation, or New Vehicle, and track contributions.
                </p>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className="px-4 py-2 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  Set First Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((g) => {
                  const isCompleted = g.status === "completed" || g.progress >= 100;
                  return (
                    <div
                      key={g._id}
                      className="p-5 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-lg space-y-4 transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded badge-twilight">
                            {g.category || "General"}
                          </span>
                          <h4 className="text-base font-bold text-[#E1DCC9] mt-1.5">
                            {g.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(g._id)}
                          className="p-1.5 rounded-lg text-[#D3DAD9]/50 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Amounts */}
                      <div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-[#E1DCC9]">
                            {formatCurrency(g.currentAmount)}
                          </span>
                          <span className="text-xs text-[#D3DAD9]/70">
                            of {formatCurrency(g.targetAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2 bg-[#000000] border border-[#44444E] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isCompleted ? "bg-[#E1DCC9]" : "bg-[#715A5A]"
                            } transition-all duration-500 rounded-full`}
                            style={{ width: `${Math.min(100, g.progress)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-[#D3DAD9]/70">
                          <span>{g.progress}% achieved</span>
                          <span>{formatCurrency(g.remaining)} remaining</span>
                        </div>
                      </div>

                      {/* Footer & Action */}
                      <div className="pt-2 border-t border-[#412D15]/80 flex items-center justify-between">
                        <span className="text-[11px] text-[#D3DAD9]/50">
                          {g.deadline ? `Target: ${formatDate(g.deadline)}` : "No deadline"}
                        </span>
                        <button
                          onClick={() => setContributeGoal(g)}
                          className="px-3 py-1 bg-[#37353E] border border-[#44444E] hover:bg-[#44444E] text-[#D3DAD9] font-bold text-xs rounded-xl transition-colors"
                        >
                          + Contribute
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recurring Rules */}
        {tab === "recurring" && (
          <div className="space-y-4">
            {loading ? (
              <div className="p-16 rounded-3xl bg-[#1F150C] border border-[#412D15] flex flex-col items-center justify-center text-center">
                <KineticTextLoader text="Loading" size="sm" />
                <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Loading recurring schedules...</p>
              </div>
            ) : rules.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#1F150C] border border-[#412D15] text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#37353E] border border-[#44444E] text-[#D3DAD9] flex items-center justify-center mb-3">
                  <Repeat className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#E1DCC9]">No Recurring Schedules</h3>
                <p className="text-xs text-[#E1DCC9]/60 mt-1 max-w-sm mb-4">
                  Automate regular payments like monthly rent, salary, Netflix or SIP investments.
                </p>
                <button
                  onClick={() => setIsRuleModalOpen(true)}
                  className="px-4 py-2 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  Create Recurring Rule
                </button>
              </div>
            ) : (
              <div className="rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#37353E]/90 border-b border-[#44444E] text-[#D3DAD9] uppercase tracking-wider font-semibold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4">Account</th>
                        <th className="py-3 px-4">Next Due</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#412D15]/60">
                      {rules.map((rule) => {
                        const isIncome = rule.type === "income";
                        return (
                          <tr key={rule._id} className="hover:bg-[#37353E]/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-[#E1DCC9]">
                              {rule.description}
                            </td>
                            <td className="py-3.5 px-4 capitalize">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isIncome
                                    ? "bg-[#E1DCC9]/20 text-[#E1DCC9] border border-[#E1DCC9]/30"
                                    : "bg-[#715A5A]/30 text-[#D3DAD9] border border-[#715A5A]/50"
                                }`}
                              >
                                {rule.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 capitalize text-[#D3DAD9]/80">
                              {rule.frequency}
                            </td>
                            <td className="py-3.5 px-4 text-[#D3DAD9]/80">
                              {rule.accountName}
                            </td>
                            <td className="py-3.5 px-4 text-[#D3DAD9]/60">
                              {formatDate(rule.nextOccurrence)}
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-bold ${
                                isIncome ? "text-[#E1DCC9]" : "text-[#D3DAD9]"
                              }`}
                            >
                              {formatCurrency(rule.amount)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rule.isActive
                                    ? "badge-mint"
                                    : "badge-twilight"
                                }`}
                              >
                                {rule.isActive ? "Active" : "Paused"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleToggleRule(rule._id)}
                                  className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-[#E1DCC9] hover:bg-[#37353E] transition-colors"
                                  title={rule.isActive ? "Pause Schedule" : "Activate Schedule"}
                                >
                                  {rule.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule._id)}
                                  className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                                  title="Delete Schedule"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goal Creation Modal */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <h3 className="text-base font-bold text-[#E1DCC9]">New Savings Goal</h3>
              <form onSubmit={handleSaveGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Emergency Reserve 2026, Home Downpayment"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Target Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="100"
                      required
                      placeholder="e.g., 200000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Initial Deposit (₹)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={goalCurrent}
                      onChange={(e) => setGoalCurrent(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Emergency, Travel"
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Target Deadline
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setIsGoalModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingGoal}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSavingGoal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Goal Contribution Modal */}
        {contributeGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <div>
                <h3 className="text-base font-bold text-[#E1DCC9]">
                  Contribute to {contributeGoal.name}
                </h3>
                <p className="text-xs text-[#D3DAD9]/70 mt-0.5">
                  Remaining to target: {formatCurrency(contributeGoal.remaining)}
                </p>
              </div>

              <form onSubmit={handleAddContribution} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Contribution Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    placeholder="e.g., 5000"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="w-full px-3 py-2 text-base font-semibold bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Monthly bonus deposit"
                    value={contribNote}
                    onChange={(e) => setContribNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setContributeGoal(null)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isContributing}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isContributing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recurring Rule Modal */}
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <h3 className="text-base font-bold text-[#E1DCC9]">Create Recurring Rule</h3>
              <form onSubmit={handleSaveRule} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRuleType("expense")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      ruleType === "expense"
                        ? "badge-mauve font-bold shadow-sm"
                        : "border-[#44444E] bg-[#37353E]/50 text-[#D3DAD9]/60"
                    }`}
                  >
                    Recurring Outflow
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleType("income")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      ruleType === "income"
                        ? "badge-bronze font-bold shadow-sm"
                        : "border-[#44444E] bg-[#37353E]/50 text-[#D3DAD9]/60"
                    }`}
                  >
                    Recurring Inflow
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Monthly Rent, Netflix, Salary"
                    value={ruleDesc}
                    onChange={(e) => setRuleDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g., 20000"
                      value={ruleAmount}
                      onChange={(e) => setRuleAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Frequency
                    </label>
                    <select
                      value={ruleFreq}
                      onChange={(e) => setRuleFreq(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    >
                      <option value="daily" className="bg-[#1F150C]">Daily</option>
                      <option value="weekly" className="bg-[#1F150C]">Weekly</option>
                      <option value="monthly" className="bg-[#1F150C]">Monthly</option>
                      <option value="yearly" className="bg-[#1F150C]">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Account
                    </label>
                    <select
                      value={ruleAccount}
                      onChange={(e) => setRuleAccount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    >
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id} className="bg-[#1F150C]">
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={ruleStart}
                      onChange={(e) => setRuleStart(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setIsRuleModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRule}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSavingRule && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Rule
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

