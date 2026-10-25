"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, Download, Trash2, CheckCircle2, Loader2, AlertTriangle, Moon, Sun } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/components/theme-provider";
import { useDashboard } from "@/components/dashboard-context";

export default function SettingsPage() {
  const { success, error } = useToast();
  const { theme, setTheme } = useTheme();
  const { triggerRefresh } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isSaving, setIsSaving] = useState(false);

  // Data wipe confirmation dialog
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const json = await res.json();
          setName(json.user?.name || "");
          setEmail(json.user?.email || "");
          setCurrency(json.user?.currency || "INR");
        }
      } catch {
        error("Failed to load user settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [error]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      success("Profile preferences saved");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWipeData = async () => {
    if (confirmText !== "DELETE") {
      error("Please type DELETE to confirm");
      return;
    }

    setIsWiping(true);
    try {
      const res = await fetch("/api/user/settings", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to wipe data");

      success("All financial records successfully cleared");
      setIsWipeModalOpen(false);
      setConfirmText("");
      triggerRefresh();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-[#E1DCC9]">Account & System Settings</h2>
          <p className="text-xs text-[#E1DCC9]/60">
            Configure currency presentation, profile preferences, and data privacy
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-5 text-[#E1DCC9]">
          <div className="flex items-center gap-3 border-b border-[#412D15] pb-4">
            <div className="p-2 rounded-2xl bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E1DCC9]">Profile & Preferences</h3>
              <p className="text-xs text-[#D3DAD9]/60">Manage display name and base currency</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3 py-2 text-xs bg-[#37353E]/40 border border-[#44444E] rounded-xl text-[#D3DAD9]/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                  Default Display Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#412D15] rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
                >
                  <option value="INR" className="bg-[#1F150C]">INR (₹) - Indian Rupee</option>
                  <option value="USD" className="bg-[#1F150C]">USD ($) - US Dollar</option>
                  <option value="EUR" className="bg-[#1F150C]">EUR (€) - Euro</option>
                  <option value="GBP" className="bg-[#1F150C]">GBP (£) - British Pound</option>
                  <option value="CAD" className="bg-[#1F150C]">CAD ($) - Canadian Dollar</option>
                  <option value="AED" className="bg-[#1F150C]">AED (د.إ) - UAE Dirham</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                  Application Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      theme === "dark"
                        ? "bg-[#E1DCC9] text-[#1F150C] border-[#E1DCC9]"
                        : "bg-[#37353E] border-[#44444E] text-[#D3DAD9]/70"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      theme === "light"
                        ? "bg-[#E1DCC9] text-[#1F150C] border-[#E1DCC9]"
                        : "bg-[#37353E] border-[#44444E] text-[#D3DAD9]/70"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      theme === "system"
                        ? "bg-[#E1DCC9] text-[#1F150C] border-[#E1DCC9]"
                        : "bg-[#37353E] border-[#44444E] text-[#D3DAD9]/70"
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Data Privacy & Dangerous Zone */}
        <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-xl space-y-4 text-[#E1DCC9]">
          <div className="flex items-center gap-3 border-b border-[#412D15] pb-4">
            <div className="p-2 rounded-2xl bg-[#715A5A]/30 text-[#D3DAD9] border border-[#715A5A]/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E1DCC9]">
                Data Privacy & Erasure
              </h3>
              <p className="text-xs text-[#D3DAD9]/60">
                Manage your financial history export and permanent data wipe
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#37353E]/60 border border-[#44444E]">
            <div>
              <h4 className="text-xs font-bold text-[#E1DCC9]">Export Financial Archive</h4>
              <p className="text-[11px] text-[#D3DAD9]/60 mt-0.5">
                Download all recorded transactions, accounts and notes in RFC 4180 CSV format.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/api/reports/export?period=this_month")}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#D3DAD9] bg-[#37353E] border border-[#44444E] hover:bg-[#44444E] rounded-xl transition-colors shrink-0"
            >
              <Download className="w-4 h-4 text-[#D3DAD9]" />
              Download CSV
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#715A5A]/20 border border-[#715A5A]/40">
            <div>
              <h4 className="text-xs font-bold text-[#D3DAD9]">Reset Financial Data</h4>
              <p className="text-[11px] text-[#D3DAD9]/60 mt-0.5">
                Permanently purge all transactions, budgets, goals and recurring schedules.
              </p>
            </div>
            <button
              onClick={() => setIsWipeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#D3DAD9] bg-[#715A5A]/40 hover:bg-[#715A5A] hover:text-white border border-[#715A5A] rounded-xl transition-all shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Reset All Data
            </button>
          </div>
        </div>

        {/* Data Wipe Confirmation Modal */}
        {isWipeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#1F150C] border border-[#715A5A]/60 rounded-3xl p-6 shadow-2xl space-y-4 text-[#E1DCC9]">
              <div className="flex items-center gap-2.5 text-[#D3DAD9]">
                <AlertTriangle className="w-5 h-5 text-[#715A5A]" />
                <h3 className="text-base font-bold text-[#E1DCC9]">
                  Danger: Clear Financial Data
                </h3>
              </div>

              <p className="text-xs text-[#D3DAD9]/70 leading-relaxed">
                This will irreversibly delete all transactions, budgets, savings goals, and recurring rules. Account balances will be reset to 0.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#E1DCC9]/70 mb-1">
                  Type <span className="font-bold text-[#D3DAD9]">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 text-xs bg-[#000000] border border-[#715A5A]/50 rounded-xl text-[#E1DCC9] focus:outline-none focus:ring-1 focus:ring-[#715A5A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#412D15]">
                <button
                  type="button"
                  onClick={() => setIsWipeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#D3DAD9]/70 hover:bg-[#37353E] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={confirmText !== "DELETE" || isWiping}
                  onClick={handleWipeData}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#715A5A] hover:bg-[#866b6b] rounded-xl shadow-md disabled:opacity-40"
                >
                  {isWiping && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Purge Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

