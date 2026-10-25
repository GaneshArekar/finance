# FinanceFlow — Personal Finance & Budget Management System

A production-minded, full-stack personal finance and budget management web application built with **Next.js 16 (App Router)**, **TypeScript**, **MongoDB Atlas**, **Mongoose**, **Better Auth**, and **Groq LPU AI**.

---

## 🚀 Key Highlights & Capabilities

- **Financial Analytics & Wealth Dashboard:** Real-time net tracked balance, income, expenses, net savings, and savings rate across periods (*This Month, Last Month, Last 30 Days, Custom Range*).
- **Transaction Ledger:** Complete CRUD supporting **Income**, **Expense**, and **Transfer** operations. Transfers atomically adjust account balances without corrupting income or expense calculations.
- **Budget Planning & Warning Alerts:** Overall monthly budgets and category budgets with real-time utilization progress bars and configurable warning thresholds (default 80%).
- **Multi-Account Tracking:** Manages Bank Accounts, Digital Wallets, Cash, and Savings balances.
- **Milestone Savings Goals:** Goal setting with target deadlines, progress visualizers, and contribution logs.
- **Automated Recurring Schedules:** Recurring rules (daily, weekly, monthly, yearly) for salary, rent, and subscriptions with idempotent processing to eliminate duplicate charges.
- **Groq AI Financial Coach:** Server-side pre-aggregated financial facts sent to Groq LPU models (`openai/gpt-oss-120b`) for monthly spending pattern reviews, budget overrun explanations, and interactive conversational guidance.
- **RFC 4180 Compliant CSV Export:** Export full transaction history and reports with proper quote escaping.
- **Fintech UI/UX:** Clean, data-dense interface with deep navy surfaces, emerald accents, dark/light modes, keyboard-accessible modals, and toast notifications.

---

## 🛠 Technology Stack

- **Framework:** Next.js 16.4 (App Router) + TypeScript
- **Database:** MongoDB Atlas
- **ODM:** Mongoose 9.x
- **Authentication:** Better Auth with MongoDB Adapter
- **AI Engine:** Groq SDK (`openai/gpt-oss-120b` or custom model)
- **Styling:** Tailwind CSS v4 + Lucide React Icons
- **Charts:** Recharts
- **Forms & Validation:** React Hook Form + Zod
- **Animations:** Motion for React
- **Test Runner:** Vitest

---

## ⚙️ Environment Variables

The project includes pre-configured `.env` and `.env.example` templates:

```env
# MongoDB Atlas
# Format: mongodb+srv://<username>:<password>@cluster.mongodb.net/personal_finance?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
MONGODB_DB=personal_finance

# Better Auth Configuration
BETTER_AUTH_SECRET=personal_finance_secret_change_me_to_at_least_32_characters_long_12345
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Groq AI
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Test Suite
```bash
npm test
```
All 23 unit and integration tests across financial calculations, Zod input rejection, transfer handling, and recurring schedules will execute.

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🏛 Architecture & Data Model

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── overview/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── budgets/page.tsx
│   │   ├── accounts/page.tsx
│   │   ├── savings/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── ai-coach/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── summary/route.ts
│   │   ├── transactions/route.ts
│   │   ├── accounts/route.ts
│   │   ├── categories/route.ts
│   │   ├── budgets/route.ts
│   │   ├── savings/route.ts
│   │   ├── recurring/route.ts
│   │   ├── reports/route.ts
│   │   ├── ai/insight/route.ts
│   │   ├── ai/chat/route.ts
│   │   └── user/settings/route.ts
├── components/
│   ├── dashboard/
│   ├── layout/
│   ├── transactions/
│   ├── ui/
│   ├── dashboard-context.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── __tests__/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── finance-calculations.ts
│   ├── mongodb.ts
│   ├── utils.ts
│   └── validation.ts
├── models/
│   ├── Account.ts
│   ├── AiInsight.ts
│   ├── Budget.ts
│   ├── Category.ts
│   ├── GoalContribution.ts
│   ├── RecurringRule.ts
│   ├── SavingsGoal.ts
│   └── Transaction.ts
├── proxy.ts (Next.js 16 route protection)
└── server/
    └── data-access/
```

---

## 🔒 Security & Data Integrity

- **Server-Side Session Validation:** Every financial mutation checks `ownerId` authorization via Better Auth sessions.
- **Strict Monetary Precision:** Avoids floating-point arithmetic pitfalls through dedicated `round2` monetary routines.
- **Privacy in AI Invocations:** Groq is never provided raw personal credentials or unhashed account details. Only pre-aggregated numeric facts are sent to formulate educational guidance.
- **Data Erasure Compliance:** Dedicated data wipe workflow in Settings allows users to permanently delete all financial records and reset balances cleanly.
