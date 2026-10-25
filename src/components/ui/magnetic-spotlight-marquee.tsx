"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MagneticSpotlightMarqueeProps {
  className?: string;
  images?: string[];
  title?: string[];
  subtitle?: string[];
  paragraphs?: string[][];
  navEmail?: string;
  navLinks?: string;
  footerText?: string;
  ctaText?: string;
  ctaHref?: string;
}

const config = {
  marqueeScrollSpeed: 160,
  stripFollowEase: 0.06,
  stripEdgeInset: 175,
  contentRiseRate: 0.85,
  risenTopGap: 90,
  liftHeadStart: 120,
  wakeStrength: 2.2,
  wakeReach: 130,
  lineSettleEase: 0.08,
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop", // Stock charts & wealth
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop", // Private architecture
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop", // Digital finance tech
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop", // Money & capital
  "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=800&auto=format&fit=crop", // Dark digital luxury
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop", // Executive board
];

const DEFAULT_TITLE = ["FINANCEFLOW", "PRIVATE WEALTH"];
const DEFAULT_SUBTITLE = ["INTELLIGENT CAPITAL", "DISCIPLINED GROWTH"];
const DEFAULT_PARAGRAPHS = [
  [
    "Next-generation personal finance architecture",
    "engineered for discerning wealth management,",
    "deep cash flow analytics, and proactive budgets.",
  ],
  [
    "Context-aware financial advisor provides real-time",
    "pattern auditing, RFC 4180 reporting, and automated",
    "milestone execution with zero friction.",
  ],
];

export function MagneticSpotlightMarquee({
  className,
  images = DEFAULT_IMAGES,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  paragraphs = DEFAULT_PARAGRAPHS,
  navEmail = "private@financeflow.wealth",
  navLinks = "Ledger • Budgets • Intelligence • Vaults",
  footerText = "© FINANCEFLOW LUXURY ARCHITECTURE • ALL CAPITAL DATA IS ENCRYPTED AND STRICTLY CONFIDENTIAL",
  ctaText = "Enter Wealth Dashboard",
  ctaHref = "/overview",
}: MagneticSpotlightMarqueeProps) {
  const containerRef = useRef<HTMLElement>(null);
  const marqueeStripRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Duplicate image track for continuous infinite scroll
  const [clonedImages, setClonedImages] = useState<string[]>([]);

  useEffect(() => {
    setClonedImages([...images, ...images, ...images, ...images]);
  }, [images]);

  // Infinite horizontal marquee scroll
  useEffect(() => {
    if (!marqueeTrackRef.current || clonedImages.length === 0) return;

    const marqueeTrack = marqueeTrackRef.current;
    let ctx = gsap.context(() => {
      const firstChild = marqueeTrack.firstElementChild as HTMLElement;
      if (!firstChild) return;

      const cardWidth = firstChild.getBoundingClientRect().width;
      const gap = 16;
      const oneSetWidth = (cardWidth + gap) * images.length;

      gsap.to(marqueeTrack, {
        x: `-=${oneSetWidth}`,
        duration: oneSetWidth / config.marqueeScrollSpeed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${gsap.utils.wrap(-oneSetWidth, 0, parseFloat(x))}px`,
        },
      });
    }, marqueeTrack);

    return () => ctx.revert();
  }, [clonedImages, images]);

  // Magnetic spotlight vertical follow and wake reaction effect
  useEffect(() => {
    if (!containerRef.current || !marqueeStripRef.current || !contentWrapperRef.current) return;

    const spotlightSection = containerRef.current;
    const marqueeStrip = marqueeStripRef.current;

    let stripBaseTop = 0;
    let stripHeight = 0;
    let sectionHeight = 0;
    let stripRestCenterY = 0;
    let contentTopAtRest = 0;

    let stripTargetY = 0;
    let stripCurrentY = 0;
    let stripPrevY = 0;
    let hasPointerMoved = false;

    let targets: { el: HTMLElement; restCenterY: number; currentY: number }[] = [];
    let rafId: number;

    const measureGeometry = () => {
      sectionHeight = spotlightSection.getBoundingClientRect().height;
      stripBaseTop = marqueeStrip.offsetTop;
      stripHeight = marqueeStrip.offsetHeight;

      stripRestCenterY = config.stripEdgeInset;

      const elements = Array.from(spotlightSection.querySelectorAll(".wake-target")) as HTMLElement[];

      let blockTop = Infinity;
      targets = elements.map((el) => {
        let y = 0;
        let node: HTMLElement | null = el;
        while (node && node !== spotlightSection) {
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement;
        }
        const restCenterY = y + el.offsetHeight / 2;
        blockTop = Math.min(blockTop, restCenterY - el.offsetHeight / 2);

        return {
          el,
          restCenterY,
          currentY: 0,
        };
      });

      contentTopAtRest = isFinite(blockTop) ? blockTop : sectionHeight * 0.35;

      if (!hasPointerMoved) {
        const restY = config.stripEdgeInset - stripHeight / 2;
        stripTargetY = restY;
        stripCurrentY = restY;
        stripPrevY = restY;
        gsap.set(marqueeStrip, { y: stripCurrentY });
      }
    };

    const timer = setTimeout(measureGeometry, 120);
    window.addEventListener("resize", measureGeometry);

    const handlePointerMove = (e: MouseEvent) => {
      hasPointerMoved = true;
      const rect = spotlightSection.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      stripTargetY = pointerY - stripHeight / 2;
    };

    const handlePointerLeave = () => {
      hasPointerMoved = false;
      stripTargetY = config.stripEdgeInset - stripHeight / 2;
    };

    spotlightSection.addEventListener("mousemove", handlePointerMove);
    spotlightSection.addEventListener("mouseleave", handlePointerLeave);

    const render = () => {
      stripCurrentY += (stripTargetY - stripCurrentY) * config.stripFollowEase;
      gsap.set(marqueeStrip, { y: stripCurrentY });

      const stripCenterY = stripBaseTop + stripCurrentY + stripHeight / 2;
      const stripVelocityY = stripCurrentY - stripPrevY;
      stripPrevY = stripCurrentY;

      const descentBelowRest = Math.max(0, stripCenterY - stripRestCenterY);
      const maxRise = Math.max(0, contentTopAtRest - config.risenTopGap);
      const contentRise = -Math.min(descentBelowRest * config.contentRiseRate, maxRise);

      targets.forEach((line) => {
        const gapToStrip = line.restCenterY - stripCenterY;
        const reachedLine = stripCenterY + config.liftHeadStart >= line.restCenterY;

        const wakeInfluence = Math.exp(-(gapToStrip * gapToStrip) / (2 * config.wakeReach * config.wakeReach));
        const wakeOffset = stripVelocityY * wakeInfluence * config.wakeStrength;

        const lineTarget = (reachedLine ? contentRise : 0) + wakeOffset;

        line.currentY += (lineTarget - line.currentY) * config.lineSettleEase;
        gsap.set(line.el, { y: line.currentY });
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureGeometry);
      spotlightSection.removeEventListener("mousemove", handlePointerMove);
      spotlightSection.removeEventListener("mouseleave", handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={cn(
        "spotlight relative w-full min-h-screen h-[100vh] overflow-hidden bg-[#000000] text-[#E1DCC9] select-none",
        className
      )}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient background glows with luxury palette tokens */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#412D15]/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#715A5A]/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Header Navigation Strip */}
      <div className="absolute top-0 left-0 w-full p-6 sm:p-8 flex items-center justify-between z-50 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#412D15] to-[#E1DCC9] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#1F150C] rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#E1DCC9]" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#E1DCC9] uppercase block">
              FinanceFlow
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#D3DAD9]/60 font-semibold block">
              Private Wealth
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center text-[10px] uppercase tracking-widest text-[#D3DAD9]/70 font-semibold">
          <div>{navEmail}</div>
          <div className="text-[9px] text-[#715A5A] tracking-wider mt-0.5">{navLinks}</div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#D3DAD9] hover:text-white bg-[#37353E]/50 border border-[#44444E] transition-all hover:bg-[#37353E]"
          >
            Sign In
          </Link>
          <Link
            href="/overview"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E1DCC9] hover:bg-white text-[#1F150C] shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch App
          </Link>
        </div>
      </div>

      {/* Magnetic Follow Marquee Strip */}
      <div
        ref={marqueeStripRef}
        className="spotlight-marquee absolute left-0 w-full z-20 h-[170px] md:h-[220px] pointer-events-none"
        style={{ top: 0 }}
      >
        <div
          ref={marqueeTrackRef}
          className="spotlight-marquee-track flex gap-4 h-full items-center absolute top-0 left-0"
        >
          {clonedImages.map((img, idx) => (
            <div
              key={idx}
              className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] shrink-0 rounded-[24px] overflow-hidden shadow-2xl border border-[#412D15]/80 bg-[#1F150C] relative group"
            >
              <img
                src={img}
                alt="Financial asset visualization"
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F150C]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#000000]/70 border border-[#44444E] text-[9px] font-mono text-[#D3DAD9]">
                <ShieldCheck className="w-2.5 h-2.5 text-[#E1DCC9]" />
                <span>Verified Asset</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Typography & Wake Interaction Layer */}
      <div
        ref={contentWrapperRef}
        className="spotlight-content-wrapper relative w-full h-full flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 z-30 pointer-events-none"
      >
        {/* Hero Title */}
        <h1 className="text-[12vw] sm:text-[10vw] md:text-[8.5rem] font-black leading-[0.88] tracking-tighter mb-8 sm:mb-12 text-center flex flex-col items-center text-[#E1DCC9]">
          {title.map((line, idx) => (
            <div
              key={idx}
              className="wake-target inline-block relative drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              {line}
              {idx === 0 && (
                <span className="hidden sm:inline-block absolute -right-6 top-3 w-4 h-4 rounded-full bg-gradient-to-tr from-[#715A5A] to-[#E1DCC9] shadow-[0_0_15px_rgba(225,220,201,0.5)]" />
              )}
            </div>
          ))}
        </h1>

        {/* Subtitle & Paragraphs Row */}
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start mt-4 px-4 md:px-8 gap-8 md:gap-12">
          {/* Subtitle / Header (Left side) */}
          <div className="flex-1 md:max-w-[320px] text-left">
            <h3 className="text-lg sm:text-2xl uppercase tracking-wider font-extrabold leading-[1.15] text-[#D3DAD9]">
              {subtitle.map((line, idx) => (
                <div key={idx} className="wake-target text-[#D3DAD9] mb-1">
                  {line}
                </div>
              ))}
            </h3>
            <div className="mt-4 pointer-events-auto">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E1DCC9] hover:bg-white text-[#1F150C] rounded-2xl text-xs sm:text-sm font-bold shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>

          {/* Paragraphs (Right side) */}
          <div className="flex-1 flex flex-col sm:flex-row gap-6 md:gap-10 text-xs sm:text-sm text-[#D3DAD9]/80 leading-[1.7]">
            {paragraphs.map((para, pIdx) => (
              <div key={pIdx} className="flex-1 flex flex-col">
                {para.map((line, lIdx) => (
                  <div key={lIdx} className="wake-target whitespace-normal sm:whitespace-nowrap font-medium">
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Legal & Security */}
      <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-40 flex justify-center pointer-events-none">
        <p className="text-[9px] sm:text-[10px] text-[#D3DAD9]/45 max-w-2xl text-center leading-[1.6] tracking-widest uppercase font-semibold">
          {footerText}
        </p>
      </div>
    </section>
  );
}

export default MagneticSpotlightMarquee;
