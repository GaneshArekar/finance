import React from "react";
import { MagneticSpotlightMarquee } from "@/components/ui/magnetic-spotlight-marquee";

export const metadata = {
  title: "FinanceFlow | Private Wealth & Capital Architecture",
  description: "Next-generation personal finance and wealth management system with intelligent analytics, proactive budget controls, and private ledger architecture.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#000000]">
      <MagneticSpotlightMarquee
        title={["FINANCEFLOW", "PRIVATE WEALTH"]}
        subtitle={["ENGINEERED CAPITAL", "DISCIPLINED GROWTH"]}
        ctaText="Enter Wealth Dashboard"
        ctaHref="/overview"
        navEmail="private@financeflow.wealth"
        navLinks="Ledger • Budgets • Intelligence • Vaults"
        footerText="© FINANCEFLOW WEALTH ARCHITECTURE • ENCRYPTED LEDGERS • STRICT PRIVATE DATA COMPLIANCE"
      />
    </main>
  );
}
