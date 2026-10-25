import React from "react";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-8 bg-[#000000]">
      <KineticTextLoader text="Loading" size="md" />
      <p className="mt-4 text-xs uppercase tracking-widest text-[#D3DAD9]/50 font-semibold">
        FinanceFlow Private Wealth
      </p>
    </div>
  );
}
