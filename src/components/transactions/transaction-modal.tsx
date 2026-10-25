"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDashboard } from "@/components/dashboard-context";
import { useToast } from "@/components/ui/toast";
import { transactionSchema } from "@/lib/validation";
import { z } from "zod";

type FormData = z.infer<typeof transactionSchema>;

export function TransactionModal() {
  const { isAddModalOpen, setIsAddModalOpen, editingTransaction, setEditingTransaction, accounts, categories, triggerRefresh } = useDashboard();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "" as any,
      type: "expense",
      date: "",
      description: "",
      accountId: "",
      toAccountId: "",
      categoryId: "",
      paymentMethod: "upi",
      notes: "",
    },
  });

  const selectedType = watch("type");
  const selectedAccountId = watch("accountId");

  // When editingTransaction changes or modal opens
  useEffect(() => {
    if (editingTransaction) {
      setValue("amount", editingTransaction.amount);
      setValue("type", editingTransaction.type);
      setValue("date", new Date(editingTransaction.date).toISOString().slice(0, 10));
      setValue("description", editingTransaction.description);
      setValue("accountId", editingTransaction.accountId?._id || editingTransaction.accountId);
      setValue("toAccountId", editingTransaction.toAccountId?._id || editingTransaction.toAccountId || "");
      setValue("categoryId", editingTransaction.categoryId?._id || editingTransaction.categoryId || "");
      setValue("paymentMethod", editingTransaction.paymentMethod || "upi");
      setValue("notes", editingTransaction.notes || "");
    } else {
      reset({
        amount: "" as any,
        type: "expense",
        date: new Date().toISOString().slice(0, 10),
        description: "",
        accountId: accounts[0]?._id || "",
        toAccountId: "",
        categoryId: "",
        paymentMethod: "upi",
        notes: "",
      });
    }
  }, [editingTransaction, isAddModalOpen, reset, setValue, accounts]);

  const filteredCategories = categories.filter((c) =>
    selectedType === "transfer" ? true : c.type === selectedType
  );

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = editingTransaction
        ? `/api/transactions/${editingTransaction._id}`
        : "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save transaction");
      }

      success(editingTransaction ? "Transaction updated successfully" : "Transaction added successfully");
      triggerRefresh();
      closeModal();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  if (!isAddModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#1F150C] rounded-3xl shadow-2xl border border-[#412D15] overflow-hidden z-10 text-[#E1DCC9]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#412D15]">
            <div>
              <h2 className="text-lg font-bold text-[#E1DCC9]">
                {editingTransaction ? "Edit Transaction" : "New Transaction"}
              </h2>
              <p className="text-xs text-[#E1DCC9]/60">
                Record income, expense or account transfer
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-1 rounded-lg text-[#E1DCC9]/60 hover:text-[#E1DCC9] hover:bg-[#412D15] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#000000] border border-[#412D15] rounded-2xl">
              <button
                type="button"
                onClick={() => setValue("type", "expense")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  selectedType === "expense"
                    ? "bg-[#715A5A] text-white font-bold shadow-md"
                    : "text-[#D3DAD9]/60 hover:text-[#E1DCC9]"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "income")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  selectedType === "income"
                    ? "bg-[#E1DCC9] text-[#1F150C] font-bold shadow-md"
                    : "text-[#D3DAD9]/60 hover:text-[#E1DCC9]"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Income
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "transfer")}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  selectedType === "transfer"
                    ? "bg-[#37353E] border border-[#44444E] text-[#D3DAD9] font-bold shadow-md"
                    : "text-[#D3DAD9]/60 hover:text-[#E1DCC9]"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Transfer
              </button>
            </div>

            {/* Amount & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                  className="w-full px-3 py-2 text-base font-bold bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-rose-400">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-rose-400">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                Description / Merchant *
              </label>
              <input
                type="text"
                placeholder="e.g., Swiggy, Monthly Rent, Client Retainer"
                {...register("description")}
                className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>
              )}
            </div>

            {/* Account & Destination Account (if transfer) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                  {selectedType === "transfer" ? "From Account *" : "Account *"}
                </label>
                <select
                  {...register("accountId")}
                  className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                >
                  <option value="" className="bg-[#1F150C]">Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id} className="bg-[#1F150C]">
                      {acc.name} (₹{acc.balance.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="mt-1 text-xs text-rose-400">{errors.accountId.message}</p>
                )}
              </div>

              {selectedType === "transfer" ? (
                <div>
                  <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                    To Account *
                  </label>
                  <select
                    {...register("toAccountId")}
                    className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                  >
                    <option value="" className="bg-[#1F150C]">Select Destination</option>
                    {accounts
                      .filter((acc) => acc._id !== selectedAccountId)
                      .map((acc) => (
                        <option key={acc._id} value={acc._id} className="bg-[#1F150C]">
                          {acc.name} (₹{acc.balance.toLocaleString("en-IN")})
                        </option>
                      ))}
                  </select>
                  {errors.toAccountId && (
                    <p className="mt-1 text-xs text-rose-400">{errors.toAccountId.message}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                    Category
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                  >
                    <option value="" className="bg-[#1F150C]">General / Uncategorized</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="bg-[#1F150C]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Payment Method & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                  Payment Method
                </label>
                <select
                  {...register("paymentMethod")}
                  className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                >
                  <option value="upi" className="bg-[#1F150C]">UPI / Instant</option>
                  <option value="card" className="bg-[#1F150C]">Card</option>
                  <option value="bank_transfer" className="bg-[#1F150C]">Wire / Transfer</option>
                  <option value="cash" className="bg-[#1F150C]">Cash</option>
                  <option value="other" className="bg-[#1F150C]">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E1DCC9] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional notes or memos"
                  {...register("notes")}
                  className="w-full px-3 py-2 text-sm bg-[#000000] border border-[#412D15] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E1DCC9] text-[#E1DCC9]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#412D15]">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-semibold text-[#E1DCC9]/70 hover:text-[#E1DCC9] hover:bg-[#412D15]/40 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingTransaction ? "Save Changes" : "Create Transaction"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
