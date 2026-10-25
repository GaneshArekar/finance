"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Where did most of my money go this month?",
  "Which categories exceeded their budgets?",
  "Compare this month with last month.",
  "What changes could help me stay within my budget?",
  "Summarize my spending in simple language.",
];

export default function AiCoachPage() {
  const { error } = useToast();

  const [currentMonth, setCurrentMonth] = useState("");
  const [insight, setInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(new Date().toISOString().slice(0, 7));
    }
  }, [currentMonth]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadInsight = useCallback(
    async (force = false) => {
      if (!currentMonth) return;
      setLoadingInsight(true);
      try {
        const res = await fetch(`/api/ai/insight?month=${currentMonth}&force=${force}`);
        if (res.ok) {
          const json = await res.json();
          setInsight(json.insight);
        }
      } catch {
        error("Failed to load AI coach insight");
      } finally {
        setLoadingInsight(false);
      }
    },
    [currentMonth, error]
  );

  useEffect(() => {
    loadInsight();
  }, [loadInsight]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: questionText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          month: currentMonth,
          history: messages,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to contact coach");
      }

      const botMsg: ChatMessage = { role: "assistant", content: json.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an issue: ${err.message}. Please check your connection.`,
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-[#E1DCC9]">
                AI Financial Advisor
              </h2>
            </div>
            <p className="text-xs text-[#E1DCC9]/60 mt-1">
              Context-aware intelligence powered by verified database metrics & automated wealth analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#1F150C] border border-[#412D15] rounded-xl text-[#E1DCC9] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
            />
            <button
              onClick={() => loadInsight(true)}
              disabled={loadingInsight}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1F150C] bg-[#E1DCC9] hover:bg-white rounded-xl shadow-sm transition-all disabled:opacity-50"
              title="Regenerate Fresh Analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInsight ? "animate-spin" : ""}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* AI Insight Report Card */}
        <div className="p-6 rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#412D15] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1DCC9]/60">
                Financial Advisory Assessment
              </span>
              <h3 className="text-base font-bold text-[#E1DCC9]">
                Analysis for {currentMonth}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/20 font-semibold">
              Verified Metrics
            </span>
          </div>

          {loadingInsight ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <KineticTextLoader text="Loading" size="sm" />
              <p className="text-xs text-[#D3DAD9]/60 mt-3 font-medium">Synthesizing spending patterns with AI Advisor...</p>
            </div>
          ) : !insight ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No insight available for {currentMonth}.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-[#37353E]/70 border border-[#44444E] text-sm leading-relaxed text-[#D3DAD9] font-medium shadow-sm">
                {insight.summary}
              </div>

              {/* Highlights & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Observations */}
                <div className="p-4 rounded-2xl bg-[#1F150C] border border-[#412D15] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D3DAD9]/70 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-[#715A5A]" />
                    Key Observations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#E1DCC9]/80">
                    {insight.highlights?.map((h: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#715A5A] font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practical Advice */}
                <div className="p-4 rounded-2xl bg-[#1F150C] border border-[#412D15] space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E1DCC9]/70 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-[#E1DCC9]" />
                    Actionable Guidance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#E1DCC9]/80">
                    {insight.recommendations?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#E1DCC9] font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Chat Interface */}
        <div className="rounded-3xl bg-[#1F150C] border border-[#412D15] shadow-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#412D15] flex items-center justify-between bg-[#37353E]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/30 flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#E1DCC9]">
                  Ask Your Financial Coach
                </h3>
                <p className="text-[11px] text-[#D3DAD9]/60">
                  Ask questions about your transactions, budgets or savings rate
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2.5 border-b border-[#412D15] bg-[#37353E]/25 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-[#D3DAD9]/60 shrink-0">Try:</span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(prompt)}
                disabled={isAsking}
                className="px-2.5 py-1 rounded-lg bg-[#37353E] border border-[#44444E] text-[11px] text-[#D3DAD9] hover:border-[#E1DCC9] hover:text-[#E1DCC9] shrink-0 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#D3DAD9]/60">
                <Bot className="w-10 h-10 text-[#412D15] mb-2" />
                <p className="text-xs font-medium text-[#E1DCC9]">
                  Ask anything about your money this month
                </p>
                <p className="text-[11px] text-[#D3DAD9]/50 mt-1 max-w-sm">
                  The AI coach queries verified database facts before formulating advice. Click a prompt above or type your question below.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isUser
                          ? "bg-[#715A5A] text-white"
                          : "bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/20"
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-[#37353E] border border-[#44444E] text-[#D3DAD9] rounded-tr-none font-medium"
                          : "bg-[#1F150C] border border-[#412D15] text-[#E1DCC9] rounded-tl-none whitespace-pre-wrap"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}

            {isAsking && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#412D15] text-[#E1DCC9] border border-[#E1DCC9]/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#1F150C] border border-[#412D15] text-xs text-[#E1DCC9]/70 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E1DCC9]" />
                  <span>Synthesizing financial advisory guidance...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#412D15] bg-[#1F150C]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk(inputQuestion);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about spending patterns, budget limits, or advice..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                disabled={isAsking}
                className="flex-1 px-4 py-2.5 bg-[#000000] border border-[#412D15] rounded-xl text-xs text-[#E1DCC9] placeholder-[#E1DCC9]/40 focus:outline-none focus:ring-1 focus:ring-[#E1DCC9]"
              />
              <button
                type="submit"
                disabled={isAsking || !inputQuestion.trim()}
                className="p-2.5 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-xl shadow-md transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
