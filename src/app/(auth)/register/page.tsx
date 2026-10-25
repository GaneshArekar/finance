"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { ThemeProvider } from "@/components/theme-provider";
import { markSessionActive } from "@/components/auth/session-guard";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Registration failed. Try a different email.");
        setLoading(false);
        return;
      }

      // Automatically trigger user default categories and accounts onboarding
      await fetch("/api/onboarding", { method: "POST" });

      markSessionActive();
      router.push("/overview");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during signup");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center bg-[#000000] text-[#E1DCC9] px-4 py-12 relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#412D15]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#715A5A]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#1F150C]/90 backdrop-blur-xl border border-[#412D15] rounded-3xl p-8 shadow-2xl">
          {/* Brand Logo */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#412D15] to-[#E1DCC9] p-0.5 shadow-lg mb-3">
              <div className="w-full h-full bg-[#1F150C] rounded-[14px] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#E1DCC9]" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[#E1DCC9] tracking-tight">Create your account</h1>
            <p className="text-xs text-[#D3DAD9]/70 mt-1">
              Start managing your wealth, budgets, and savings with AI insights
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#715A5A]/25 border border-[#715A5A]/50 text-[#D3DAD9] text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#D3DAD9] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#D3DAD9]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#000000] border border-[#412D15] rounded-xl text-sm text-[#E1DCC9] placeholder-[#D3DAD9]/40 focus:outline-none focus:border-[#E1DCC9] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3DAD9] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D3DAD9]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#000000] border border-[#412D15] rounded-xl text-sm text-[#E1DCC9] placeholder-[#D3DAD9]/40 focus:outline-none focus:border-[#E1DCC9] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D3DAD9] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D3DAD9]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#000000] border border-[#412D15] rounded-xl text-sm text-[#E1DCC9] placeholder-[#D3DAD9]/40 focus:outline-none focus:border-[#E1DCC9] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E1DCC9] hover:bg-white text-[#1F150C] font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1F150C]" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#412D15] text-center text-xs text-[#D3DAD9]/60">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E1DCC9] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
