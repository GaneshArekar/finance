"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PeriodFilter } from "@/lib/finance-calculations";

interface DashboardContextType {
  period: PeriodFilter;
  setPeriod: (period: PeriodFilter) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: any | null;
  setEditingTransaction: (tx: any | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  accounts: any[];
  categories: any[];
  loadReferenceData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
  period: "this_month",
  setPeriod: () => {},
  customStartDate: "",
  setCustomStartDate: () => {},
  customEndDate: "",
  setCustomEndDate: () => {},
  isAddModalOpen: false,
  setIsAddModalOpen: () => {},
  editingTransaction: null,
  setEditingTransaction: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  accounts: [],
  categories: [],
  loadReferenceData: async () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<PeriodFilter>("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const loadReferenceData = useCallback(async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        fetch("/api/accounts"),
        fetch("/api/categories"),
      ]);

      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData.accounts || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error("Failed to load reference accounts/categories:", err);
    }
  }, []);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData, refreshKey]);

  return (
    <DashboardContext.Provider
      value={{
        period,
        setPeriod,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        refreshKey,
        triggerRefresh,
        accounts,
        categories,
        loadReferenceData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
