import Groq from "groq-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import { AiInsight, Budget } from "@/models";
import { getDetailedReport } from "./reports";
import { listBudgetsWithUtilization } from "./budgets";
import { formatCurrency } from "@/lib/utils";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function getGroqClient(): Groq | null {
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === "") {
    return null;
  }
  return new Groq({ apiKey: GROQ_API_KEY });
}

export interface FinancialContext {
  month: string;
  currency: string;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
  topCategories: { category: string; total: number; percentage: number }[];
  budgetAlerts: { category: string; budget: number; spent: number; status: string }[];
  previousPeriod?: {
    income: number;
    expenses: number;
    netSavings: number;
  };
}

/**
 * Compiles verified, trusted pre-aggregated financial facts for Groq context
 */
export async function getVerifiedFinancialContext(ownerId: string, month: string): Promise<FinancialContext> {
  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const startDate = new Date(year, monthNum - 1, 1).toISOString();
  const endDate = new Date(year, monthNum, 0, 23, 59, 59).toISOString();

  const report = await getDetailedReport(ownerId, "custom", startDate, endDate);
  const budgetData = await listBudgetsWithUtilization(ownerId, month);

  const budgetAlerts = budgetData.budgets
    .filter((b) => b.status === "warning" || b.status === "exceeded")
    .map((b) => ({
      category: b.categoryName,
      budget: b.amount,
      spent: b.spent,
      status: b.status,
    }));

  return {
    month,
    currency: "INR",
    income: report.summary.income,
    expenses: report.summary.expenses,
    netSavings: report.summary.netSavings,
    savingsRate: report.summary.savingsRate,
    topCategories: report.categoryBreakdown.slice(0, 5).map((c) => ({
      category: c.category,
      total: c.total,
      percentage: c.percentage,
    })),
    budgetAlerts,
    previousPeriod: {
      income: report.comparison.prevIncome,
      expenses: report.comparison.prevExpenses,
      netSavings: report.comparison.prevNetSavings,
    },
  };
}

/**
 * Generates an automated monthly financial analysis and actionable recommendations
 */
export async function generateMonthlyInsight(ownerId: string, month: string, forceFresh = false) {
  await connectToDatabase();

  if (!forceFresh) {
    const existing = await AiInsight.findOne({ ownerId, month }).sort({ createdAt: -1 }).lean();
    if (existing) {
      return existing;
    }
  }

  const context = await getVerifiedFinancialContext(ownerId, month);
  const groq = getGroqClient();

  // If no Groq API key or empty financial state, return trusted deterministic summary
  if (!groq || (context.income === 0 && context.expenses === 0)) {
    const summary = context.income === 0 && context.expenses === 0
      ? `No transactions recorded yet for ${month}. Add your income and expenses to unlock personalized insights.`
      : `For ${month}, your total income was ${formatCurrency(context.income)} and total expenses were ${formatCurrency(context.expenses)}, resulting in net savings of ${formatCurrency(context.netSavings)} (${context.savingsRate}% savings rate).`;

    const highlights = [
      `Net Savings: ${formatCurrency(context.netSavings)} (${context.savingsRate}% savings rate)`,
      context.topCategories.length > 0
        ? `Largest expense: ${context.topCategories[0].category} (${formatCurrency(context.topCategories[0].total)})`
        : "No categorized expenses yet",
      context.budgetAlerts.length > 0
        ? `${context.budgetAlerts.length} budget limit(s) near or exceeded`
        : "All configured budgets are within safe thresholds",
    ];

    const recommendations = [
      context.savingsRate < 20
        ? "Aim to allocate at least 20% of monthly income towards emergency savings or debt paydown."
        : "Great job exceeding the 20% savings milestone! Consider allocating surplus to high-yield savings or diversified investments.",
      "Review recurring subscriptions periodically to identify recurring outflows that can be trimmed.",
    ];

    const fallbackDoc = await AiInsight.create({
      ownerId,
      month,
      summary,
      highlights,
      recommendations,
      metricsSnapshot: {
        income: context.income,
        expenses: context.expenses,
        netSavings: context.netSavings,
        savingsRate: context.savingsRate,
        topCategories: context.topCategories.map((c) => ({
          category: c.category,
          amount: c.total,
          percentage: c.percentage,
        })),
      },
    });

    return fallbackDoc.toObject();
  }

  try {
    const prompt = `You are a certified, empathetic, and prudent Personal Finance Coach.
Analyze the following VERIFIED financial facts for ${context.month}.
Do not invent any numbers. Rely strictly on the supplied facts:
- Total Income: ₹${context.income}
- Total Expenses: ₹${context.expenses}
- Net Savings: ₹${context.netSavings}
- Savings Rate: ${context.savingsRate}%
- Top Spending Categories: ${JSON.stringify(context.topCategories)}
- Budget Alerts: ${JSON.stringify(context.budgetAlerts)}
- Previous Period: Income ₹${context.previousPeriod?.income}, Expenses ₹${context.previousPeriod?.expenses}

Output your response as valid JSON with three keys:
1. "summary": A concise 2-3 sentence overview analyzing health, cash flow, and discipline.
2. "highlights": An array of 3 bullet points with key observations.
3. "recommendations": An array of 3 actionable, specific, educational steps the user can take.

Respond ONLY with valid JSON. No conversational fluff or markdown code fence.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    const insight = await AiInsight.create({
      ownerId,
      month,
      summary: parsed.summary || "Financial overview compiled.",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      metricsSnapshot: {
        income: context.income,
        expenses: context.expenses,
        netSavings: context.netSavings,
        savingsRate: context.savingsRate,
        topCategories: context.topCategories.map((c) => ({
          category: c.category,
          amount: c.total,
          percentage: c.percentage,
        })),
      },
    });

    return insight.toObject();
  } catch (err: any) {
    console.error("Groq AI insight error, falling back to heuristic:", err.message);
    return generateMonthlyInsight(ownerId, month, true);
  }
}

/**
 * Interactive Q&A chat with AI Financial Coach
 */
export async function askFinancialCoach(
  ownerId: string,
  userQuestion: string,
  month: string,
  chatHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const context = await getVerifiedFinancialContext(ownerId, month);
  const groq = getGroqClient();

  if (!groq) {
    return `AI Financial Advisor is currently in offline mode. 
Here are your verified numbers for ${month}:
• Total Income: ${formatCurrency(context.income)}
• Total Expenses: ${formatCurrency(context.expenses)}
• Net Savings: ${formatCurrency(context.netSavings)} (${context.savingsRate}% savings rate)
${context.topCategories.length > 0 ? `• Top Expense: ${context.topCategories[0].category} (${formatCurrency(context.topCategories[0].total)})` : ""}
Configure your API credentials in .env to enable live conversational advisory.`;
  }

  const systemPrompt = `You are a professional, data-driven Personal Finance Coach.
The user is asking questions about their personal budget and transactions for the period ${context.month}.
Here are the VERIFIED financial facts calculated from the database:
- Total Income: ₹${context.income}
- Total Expenses: ₹${context.expenses}
- Net Savings: ₹${context.netSavings}
- Savings Rate: ${context.savingsRate}%
- Top Spending Categories: ${JSON.stringify(context.topCategories)}
- Budget Alerts: ${JSON.stringify(context.budgetAlerts)}
- Previous Period Income: ₹${context.previousPeriod?.income || 0}
- Previous Period Expenses: ₹${context.previousPeriod?.expenses || 0}

Rules:
1. Always reference the actual numbers from the verified facts above. Never invent transactions, amounts, or merchant names not present.
2. Present advice as educational guidance, not formal fiduciary or tax advice.
3. Keep answers clear, supportive, and concise (under 150 words when possible).
4. If the user asks about an unknown category or transaction not present in the facts, politely state that it does not appear in their current records for this period.`;

  try {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userQuestion },
    ];

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || "I couldn't process that question right now. Please try again.";
  } catch (err: any) {
    console.error("Groq chat error:", err.message);
    return `I encountered an issue connecting to the AI provider: ${err.message}. Your recorded net savings for ${month} is ${formatCurrency(context.netSavings)}.`;
  }
}
