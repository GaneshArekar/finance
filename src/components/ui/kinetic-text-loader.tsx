"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface KineticTextLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export function KineticTextLoader({
  className,
  text = "Loading",
  size = "md",
  ...props
}: KineticTextLoaderProps) {
  const letters = text.split("");

  const scaleClass = {
    sm: "scale-50 sm:scale-60",
    md: "scale-75 md:scale-90",
    lg: "scale-90 md:scale-100",
  }[size];

  return (
    <div
      className={cn("relative flex items-center justify-center font-light select-none", className)}
      style={{ fontFamily: "'Roboto', sans-serif" }}
      {...props}
    >
      <style>{`
        @keyframes ktl-dotMove {
          0%, 100% { transform: rotate(180deg) translate(-80px, -10px) rotate(-180deg); }
          50% { transform: rotate(0deg) translate(-81px, 10px) rotate(0deg); }
        }
        @keyframes ktl-letterStretch {
          0%, 100% { transform: scale(1, 0.35); transform-origin: 100% 75%; }
          8%, 28% { transform: scale(1, 1.4); transform-origin: 100% 67%; }
          37% { transform: scale(1, 0.875); transform-origin: 100% 75%; }
          46% { transform: scale(1, 1.03); transform-origin: 100% 75%; }
          50%, 97% { transform: scale(1); transform-origin: 100% 75%; }
        }
        @keyframes ktl-l-bounce {
          0%, 45%, 70%, 100% { transform: scaleY(1.11); }
          49% { transform: scaleY(0.31); }
          50% { transform: scaleY(0.16); }
          53% { transform: scaleY(0.63); }
          60% { transform: scaleY(1.275); }
          68% { transform: scaleY(1.04); }
        }
      `}</style>

      <div className={cn("relative", scaleClass)}>
        {/* Animated Bouncing Dot */}
        <div
          className="absolute z-10 top-[40px] left-[85px] w-[7px] h-[7px] bg-[#E1DCC9] shadow-[0_0_10px_rgba(225,220,201,0.6)] rounded-full"
          style={{ animation: "ktl-dotMove 1800ms cubic-bezier(0.25,0.25,0.75,0.75) infinite" }}
        />

        {/* Text Letters */}
        <p className="relative m-0 whitespace-nowrap text-[3.75rem] text-[#E1DCC9] tracking-[6px]" aria-label={text}>
          {letters.map((char, index) => {
            if (index === 0 && char.toUpperCase() === "L") {
              return (
                <span
                  key={index}
                  className="inline-block relative transform origin-[100%_70%] text-[#E1DCC9]"
                  style={{ animation: "ktl-l-bounce 1800ms cubic-bezier(0.25,0.25,0.75,0.75) infinite" }}
                >
                  {char}
                </span>
              );
            }

            if (index === 4 && char.toLowerCase() === "i") {
              return (
                <span
                  key={index}
                  className="inline-block relative transform origin-[100%_70%] text-[#D3DAD9]"
                  style={{ animation: "ktl-letterStretch 1800ms cubic-bezier(0.25,0.23,0.73,0.75) infinite" }}
                >
                  {char}
                </span>
              );
            }

            return (
              <span key={index} className="inline-block relative">
                {char}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}

export default KineticTextLoader;
