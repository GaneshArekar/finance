"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Trash2,
  Edit2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

export default function TransactionsPage() {
  const {
    period,
    customStartDate,
    customEndDate,
    setIsAddModalOpen,
    setEditingTransaction,
    refreshKey,
    triggerRefresh,
    accounts,
    categories,
  } = useDashboard();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion confirmation modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        type: selectedType,
        page: page.toString(),
        limit: "15",
        sortBy,
        sortOrder,
      });

      if (search.trim()) params.set("search", search.trim());
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedAccount) params.set("accountId", selectedAccount);
      if (period === "custom" && customStartDate && customEndDate) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.transactions || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalCount(json.pagination?.totalCount || 0);
      }
    } catch (err: any) {
      error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [
    period,
    customStartDate,
    customEndDate,
    selectedType,
    selectedCategory,
    selectedAccount,
    search,
    sortBy,
    sortOrder,
    page,
    error,
  ]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refreshKey]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete transaction");

      success("Transaction deleted and balance adjusted");
      triggerRefresh();
      setDeletingId(null);
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({ period });
    if (period === "custom" && customStartDate && customEndDate) {
      params.set("startDate", customStartDate);
      params.set("endDate", customEndDate);
    }
    window.location.href = `/api/reports/export?${params.toString()}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E1DCC9]">Transaction Ledger</h2>
            <p className="text-xs text-[#E1DCC9]/60">
              Showing {totalCount} records for selected period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#E1DCC9] bg-[#1F150C] border border-[#412D15] rounded-xl hover:bg-[#412D15] transition-colors"
            >
              <Download className="w-4 h-4 text-[#E1DCC9]/70" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-[#E1DCC9]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description, merchant..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-[#000000] border border-[#412D15] rounded-xl text-xs text-[#E1DCC9] placeholder-[#E1DCC9]/40 focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#000000] border border-[#412D15] rounded-xl text-xs text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
              >
                <option value="all" className="bg-[#1F150C]">All Types</option>
                <option value="expense" className="bg-[#1F150C]">Expenses Only</option>
                <option value="income" className="bg-[#1F150C]">Income Only</option>
                <option value="transfer" className="bg-[#1F150C]">Transfers Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#000000] border border-[#412D15] rounded-xl text-xs text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
              >
                <option value="" className="bg-[#1F150C]">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#1F150C]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Filter */}
            <div>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-[#000000] border border-[#412D15] rounded-xl text-xs text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
              >
                <option value="" className="bg-[#1F150C]">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id} className="bg-[#1F150C]">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-14 flex flex-col items-center justify-center text-center">
              <KineticTextLoader text="Loading" size="sm" />
              <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Fetching transaction records...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#37353E] border border-[#44444E] text-[#D3DAD9] flex items-center justify-center mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#E1DCC9]">
                No matching transactions
              </p>
              <p className="text-xs text-[#E1DCC9]/60 mt-1 max-w-xs">
                Try adjusting your search keywords, category filters, or selected date period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#37353E]/90 border-b border-[#44444E] text-[#D3DAD9] uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#412D15]/60">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === "income";
                    const isTransfer = tx.type === "transfer";

                    const Icon = isIncome ? ArrowUpRight : isTransfer ? ArrowLeftRight : ArrowDownRight;
                    const iconColor = isIncome
                      ? "text-[#E1DCC9] bg-[#E1DCC9]/15 border border-[#E1DCC9]/30"
                      : isTransfer
                      ? "text-[#D3DAD9] bg-[#44444E]/70 border border-[#44444E]"
                      : "text-[#D3DAD9] bg-[#715A5A]/35 border border-[#715A5A]/50";

                    const amountColor = isIncome
                      ? "text-[#E1DCC9] font-bold"
                      : isTransfer
                      ? "text-[#D3DAD9] font-bold"
                      : "text-[#D3DAD9] font-semibold";

                    const sign = isIncome ? "+" : isTransfer ? "⇄ " : "-";

                    return (
                      <tr
                        key={tx._id}
                        className="hover:bg-[#37353E]/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-[#E1DCC9]/70 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#E1DCC9]">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${iconColor} shrink-0`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate max-w-[200px] sm:max-w-xs">{tx.description}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium badge-twilight inline-block">
                            {tx.categoryName || "General"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#D3DAD9]/80">
                          {isTransfer ? (
                            <span>
                              {tx.accountName} → {tx.toAccountName || "Account"}
                            </span>
                          ) : (
                            tx.accountName || "Account"
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#D3DAD9]/60 uppercase tracking-wider text-[11px]">
                          {tx.paymentMethod || "UPI"}
                        </td>
                        <td className={`py-3.5 px-4 text-right ${amountColor} whitespace-nowrap`}>
                          {sign}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTransaction(tx);
                                setIsAddModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-[#E1DCC9] hover:bg-[#37353E] transition-colors"
                              title="Edit Transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(tx._id)}
                              className="p-1.5 rounded-lg text-[#D3DAD9]/60 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                              title="Delete Transaction"
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#412D15] bg-[#1F150C]/90 text-[#D3DAD9]">
              <span className="text-xs text-[#D3DAD9]/70">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#44444E] bg-[#37353E] text-[#D3DAD9] disabled:opacity-30 hover:bg-[#44444E] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#44444E] bg-[#37353E] text-[#D3DAD9] disabled:opacity-30 hover:bg-[#44444E] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Transaction?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This transaction will be permanently removed, and your associated account balance will be automatically adjusted.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
