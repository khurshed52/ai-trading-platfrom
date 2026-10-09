"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type TradingVerificationAnimationProps = {
  active: boolean;
};

const candlesticks = [
  { x: 42, open: 66, close: 79, high: 58, low: 87, color: "#2563eb" },
  { x: 66, open: 62, close: 74, high: 53, low: 81, color: "#10b981" },
  { x: 90, open: 52, close: 68, high: 43, low: 76, color: "#2563eb" },
  { x: 114, open: 60, close: 73, high: 51, low: 80, color: "#2563eb" },
  { x: 138, open: 45, close: 63, high: 36, low: 71, color: "#10b981" },
  { x: 162, open: 34, close: 54, high: 25, low: 62, color: "#2563eb" },
  { x: 186, open: 38, close: 56, high: 29, low: 63, color: "#2563eb" },
  { x: 210, open: 21, close: 46, high: 12, low: 54, color: "#10b981" },
] as const;

export function TradingVerificationAnimation({
  active,
}: TradingVerificationAnimationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const ambientTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotionRef = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) {
        return;
      }

      reducedMotionRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotionRef.current) {
        return;
      }

      const panel = root.querySelector("[data-chart-panel]");
      const candles = root.querySelectorAll("[data-candle]");
      const highlightedCandles = root.querySelectorAll(
        "[data-candle-highlight]",
      );
      const trendLine = root.querySelector("[data-trend-line]");
      const lineGlow = root.querySelector("[data-line-glow]");
      const leftCard = root.querySelector("[data-market-left]");
      const rightCard = root.querySelector("[data-market-right]");
      const tradeProIcon = root.querySelector("[data-tradepro-icon]");
      const orbit = root.querySelector("[data-orbit]");

      gsap.set(panel, { autoAlpha: 0, y: 12, scale: 0.94 });
      gsap.set(candles, {
        autoAlpha: 0,
        scaleY: 0.2,
        transformOrigin: "50% 100%",
      });
      gsap.set(trendLine, { strokeDashoffset: 1 });
      gsap.set(leftCard, { autoAlpha: 0, x: -10 });
      gsap.set(rightCard, { autoAlpha: 0, x: 10 });
      gsap.set(tradeProIcon, { autoAlpha: 0, scale: 0.8 });

      const ambientTimeline = gsap.timeline({
        paused: true,
        repeat: -1,
      });

      ambientTimeline
        .to(panel, { y: -5, duration: 2.5, ease: "sine.inOut" }, 0)
        .to(leftCard, { y: -3, duration: 2.2, ease: "sine.inOut" }, 0)
        .to(rightCard, { y: 3, duration: 2.5, ease: "sine.inOut" }, 0)
        .to(orbit, { rotation: 180, duration: 2.5, ease: "none" }, 0)
        .to(
          highlightedCandles,
          {
            opacity: 0.58,
            duration: 0.9,
            stagger: 0.15,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
          },
          0.35,
        )
        .to(lineGlow, { strokeDashoffset: -1, duration: 5, ease: "none" }, 0)
        .to(panel, { y: 0, duration: 2.5, ease: "sine.inOut" }, 2.5)
        .to(leftCard, { y: 0, duration: 2.8, ease: "sine.inOut" }, 2.2)
        .to(rightCard, { y: 0, duration: 2.5, ease: "sine.inOut" }, 2.5)
        .to(orbit, { rotation: 360, duration: 2.5, ease: "none" }, 2.5);

      const introTimeline = gsap.timeline({
        paused: true,
        onComplete: () => ambientTimeline.play(0),
      });

      introTimeline
        .to(panel, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        })
        .to(
          candles,
          {
            autoAlpha: 1,
            scaleY: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          },
          0.35,
        )
        .to(
          trendLine,
          { strokeDashoffset: 0, duration: 1.05, ease: "power2.out" },
          0.68,
        )
        .to(
          leftCard,
          { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" },
          1.05,
        )
        .to(
          rightCard,
          { autoAlpha: 1, x: 0, duration: 0.55, ease: "power2.out" },
          1.18,
        )
        .to(
          tradeProIcon,
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" },
          1.35,
        );

      introTimelineRef.current = introTimeline;
      ambientTimelineRef.current = ambientTimeline;

      if (active) {
        introTimeline.play();
      }

      return () => {
        introTimelineRef.current = null;
        ambientTimelineRef.current = null;
      };
    },
    { scope: rootRef },
  );

  useEffect(() => {
    if (reducedMotionRef.current) {
      return;
    }

    const introTimeline = introTimelineRef.current;
    const ambientTimeline = ambientTimelineRef.current;

    if (active) {
      if (introTimeline && introTimeline.progress() < 1) {
        introTimeline.resume();
      } else {
        ambientTimeline?.resume();
      }
    } else {
      introTimeline?.pause();
      ambientTimeline?.pause();
    }
  }, [active]);

  return (
    <div
      ref={rootRef}
      className="relative mb-4 h-[150px] w-full max-w-[340px] sm:h-[165px]"
      role="img"
      aria-label="Animated trading chart with EUR/USD and XAU/USD market indicators"
    >
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 340 165"
        aria-hidden
      >
        <g
          data-orbit
          style={{ transformOrigin: "170px 87px" }}
        >
          <ellipse
            cx="170"
            cy="87"
            rx="142"
            ry="56"
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="2"
            strokeDasharray="16 9"
            opacity="0.62"
          />
          <circle cx="30" cy="79" r="4" fill="#93c5fd" />
          <circle cx="307" cy="101" r="3" fill="#60a5fa" />
        </g>
        <defs>
          <linearGradient id="orbitGradient" x1="28" y1="30" x2="310" y2="135">
            <stop stopColor="#dbeafe" />
            <stop offset="0.5" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
      </svg>

      <div
        data-chart-panel
        className="absolute left-[14%] top-[14%] h-[72%] w-[72%] -rotate-3 overflow-hidden rounded-[20px] border border-blue-100/90 bg-white/90 shadow-[0_18px_45px_rgba(37,99,235,0.18)] backdrop-blur-sm"
      >
        <svg
          className="size-full"
          viewBox="0 0 240 110"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="panelFade" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#eff6ff" />
            </linearGradient>
          </defs>
          <rect width="240" height="110" fill="url(#panelFade)" />
          {[24, 48, 72, 96].map((y) => (
            <line
              key={y}
              x1="18"
              x2="224"
              y1={y}
              y2={y}
              stroke="#dbeafe"
              strokeWidth="1"
            />
          ))}
          {candlesticks.map((candle, index) => {
            const bodyY = Math.min(candle.open, candle.close);
            const bodyHeight = Math.abs(candle.close - candle.open);

            return (
              <g
                key={candle.x}
                data-candle
                data-candle-highlight={index === 4 || index === 7 ? "" : undefined}
              >
                <line
                  x1={candle.x}
                  x2={candle.x}
                  y1={candle.high}
                  y2={candle.low}
                  stroke={candle.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x={candle.x - 5}
                  y={bodyY}
                  width="10"
                  height={bodyHeight}
                  rx="2"
                  fill={candle.color}
                />
              </g>
            );
          })}
          <path
            data-trend-line
            d="M28 88 C62 82 71 68 96 70 C124 72 138 54 158 58 C179 62 196 37 218 24"
            pathLength="1"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="1"
          />
          <path
            data-line-glow
            d="M28 88 C62 82 71 68 96 70 C124 72 138 54 158 58 C179 62 196 37 218 24"
            pathLength="1"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="0.08 0.92"
            opacity="0.7"
          />
        </svg>

        <span
          data-tradepro-icon
          className="absolute bottom-2.5 right-3 flex size-10 items-end justify-center gap-[3px] rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-2.5 shadow-[0_8px_20px_rgba(37,99,235,0.32)]"
        >
          <span className="h-2 w-1.5 rounded-sm bg-white" />
          <span className="h-4 w-1.5 rounded-sm bg-white" />
          <span className="h-6 w-1.5 rounded-sm bg-white" />
        </span>
      </div>

      <MarketIndicator
        side="left"
        label="EUR/USD"
        dataAttribute="data-market-left"
      />
      <MarketIndicator
        side="right"
        label="XAU/USD"
        dataAttribute="data-market-right"
      />
    </div>
  );
}

type MarketIndicatorProps = {
  side: "left" | "right";
  label: string;
  dataAttribute: "data-market-left" | "data-market-right";
};

function MarketIndicator({
  side,
  label,
  dataAttribute,
}: MarketIndicatorProps) {
  return (
    <div
      {...{ [dataAttribute]: "" }}
      className={`absolute z-10 flex items-center gap-2 rounded-xl border border-emerald-100 bg-white/95 px-2.5 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.1)] backdrop-blur ${
        side === "left"
          ? "left-0 top-[46%]"
          : "right-0 top-[15%]"
      }`}
      aria-hidden
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M3 12.5 7.1 8.4l2.8 2.8L15 6.1M10.8 6.1H15v4.2"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="whitespace-nowrap text-[10px] font-bold tracking-tight text-slate-800 sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}
