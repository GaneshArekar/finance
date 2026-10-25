"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building,
  CreditCard,
  Coins,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Tag,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

export default function AccountsPage() {
  const { accounts, categories, triggerRefresh } = useDashboard();
  const { success, error } = useToast();

  // Tab: Accounts or Categories
  const [tab, setTab] = useState<"accounts" | "categories">("accounts");

  // Account modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<any>("bank");
  const [accBalance, setAccBalance] = useState("0");
  const [accIsDefault, setAccIsDefault] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"income" | "expense">("expense");
  const [catColor, setCatColor] = useState("#10b981");
  const [isSavingCat, setIsSavingCat] = useState(false);

  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  const handleOpenAccountModal = (acc: any = null) => {
    if (acc) {
      setEditingAccount(acc);
      setAccName(acc.name);
      setAccType(acc.type);
      setAccBalance(acc.balance.toString());
      setAccIsDefault(acc.isDefault);
    } else {
      setEditingAccount(null);
      setAccName("");
      setAccType("bank");
      setAccBalance("0");
      setAccIsDefault(false);
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount._id}` : "/api/accounts";
      const method = editingAccount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accName,
          type: accType,
          balance: parseFloat(accBalance) || 0,
          isDefault: accIsDefault,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save account");

      success(editingAccount ? "Account updated" : "Account created successfully");
      setIsAccountModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete account");

      success("Account deleted");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          type: catType,
          color: catColor,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create category");

      success("Category created successfully");
      setIsCatModalOpen(false);
      setCatName("");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete category");

      success("Category removed");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "bank":
        return Building;
      case "credit":
        return CreditCard;
      case "cash":
        return Coins;
      default:
        return Wallet;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#E1DCC9]">Accounts & Categories</h2>
            <p className="text-xs text-[#E1DCC9]/60">
              Manage physical & digital money repositories and categorization tags
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-[#1F150C] border border-[#412D15] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTab("accounts")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tab === "accounts"
                    ? "bg-[#E1DCC9] text-[#1F150C] font-bold shadow-sm"
                    : "text-[#D3DAD9]/70 hover:text-[#E1DCC9]"
                }`}
              >
                Accounts ({accounts.length})
              </button>
              <button
                onClick={() => setTab("categories")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  tab === "categories"
                    ? "bg-[#E1DCC9] text-[#1F150C] font-bold shadow-sm"
                    : "text-[#D3DAD9]/70 hover:text-[#E1DCC9]"
                }`}
              >
                Categories ({categories.length})
              </button>
            </div>

            {tab === "accounts" ? (
              <button
                onClick={() => handleOpenAccountModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add Account
              </button>
            ) : (
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> New Category
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Accounts */}
        {tab === "accounts" && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1F150C] via-[#15100B] to-[#37353E] border border-[#412D15] text-[#E1DCC9] shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#E1DCC9]/70 font-medium">Combined Net Liquid Balance</span>
                <p className="text-3xl font-extrabold text-[#E1DCC9] mt-1">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="text-right text-xs text-[#D3DAD9]/70">
                <p>{accounts.length} Accounts Monitored</p>
                <p className="text-[11px] text-[#D3DAD9]/40">Includes Bank, Cash & Savings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc, idx) => {
                const Icon = getAccountIcon(acc.type);
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={acc._id}
                    className={`p-5 rounded-3xl border shadow-lg space-y-3 transition-all hover:scale-[1.01] ${
                      isEven
                        ? "bg-[#1F150C] border-[#412D15] text-[#E1DCC9]"
                        : "bg-[#37353E]/75 border-[#44444E] text-[#D3DAD9]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-2xl border shrink-0 ${
                          isEven
                            ? "bg-[#412D15]/60 border-[#412D15] text-[#E1DCC9]"
                            : "bg-[#44444E]/60 border-[#44444E] text-[#D3DAD9]"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold truncate">
                              {acc.name}
                            </h4>
                            {acc.isDefault && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded badge-mauve">
                                Default
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] uppercase tracking-wider opacity-60">
                            {acc.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenAccountModal(acc)}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-[#000000]/30 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(acc._id)}
                          className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-white hover:bg-[#715A5A]/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-current/10 flex items-baseline justify-between">
                      <span className="text-xs opacity-60">Current Balance:</span>
                      <span className="text-xl font-bold">
                        {formatCurrency(acc.balance)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Categories */}
        {tab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#E1DCC9] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#715A5A]" />
                  Expense Categories
                </h3>
                <span className="text-xs text-[#D3DAD9]/60">
                  {categories.filter((c) => c.type === "expense").length} categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories
                  .filter((c) => c.type === "expense")
                  .map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#37353E]/60 border border-[#44444E]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Tag className="w-3.5 h-3.5 text-[#715A5A] shrink-0" />
                        <span className="text-xs font-medium text-[#D3DAD9] truncate">
                          {c.name}
                        </span>
                      </div>
                      {!c.isDefault && (
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1 rounded text-[#D3DAD9]/50 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Income Categories */}
            <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#E1DCC9] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E1DCC9]" />
                  Income Categories
                </h3>
                <span className="text-xs text-[#D3DAD9]/60">
                  {categories.filter((c) => c.type === "income").length} categories
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories
                  .filter((c) => c.type === "income")
                  .map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#37353E]/60 border border-[#44444E]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Tag className="w-3.5 h-3.5 text-[#E1DCC9] shrink-0" />
                        <span className="text-xs font-medium text-[#D3DAD9] truncate">
                          {c.name}
                        </span>
                      </div>
                      {!c.isDefault && (
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1 rounded text-[#D3DAD9]/50 hover:text-white hover:bg-[#715A5A]/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Modal */}
        {isAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <h3 className="text-base font-bold text-[#E1DCC9]">
                {editingAccount ? "Edit Account" : "Add New Account"}
              </h3>
              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., HDFC Salary, Cash, ICICI Savings"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Account Type
                    </label>
                    <select
                      value={accType}
                      onChange={(e) => setAccType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    >
                      <option value="bank" className="bg-[#1F150C]">Bank Account</option>
                      <option value="savings" className="bg-[#1F150C]">Savings Account</option>
                      <option value="cash" className="bg-[#1F150C]">Cash</option>
                      <option value="wallet" className="bg-[#1F150C]">Digital Wallet</option>
                      <option value="investment" className="bg-[#1F150C]">Investment</option>
                      <option value="credit" className="bg-[#1F150C]">Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                      Opening Balance (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={accBalance}
                      onChange={(e) => setAccBalance(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefaultAcc"
                    checked={accIsDefault}
                    onChange={(e) => setAccIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#715A5A]"
                  />
                  <label htmlFor="isDefaultAcc" className="text-xs text-[#E1DCC9]/80 cursor-pointer">
                    Set as default account for transactions
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAccount}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSavingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-sm bg-[#1F150C] border border-[#412D15] rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <h3 className="text-base font-bold text-[#E1DCC9]">Create Custom Category</h3>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Gym, Software, Freelance"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                    Type *
                  </label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                  >
                    <option value="expense" className="bg-[#1F150C]">Expense</option>
                    <option value="income" className="bg-[#1F150C]">Income</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingCat}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md disabled:opacity-50"
                  >
                    {isSavingCat && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Category
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
