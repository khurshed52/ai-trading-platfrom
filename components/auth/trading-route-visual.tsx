"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Activity,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Globe2,
  Radar,
  ShieldCheck,
  Zap,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

const orbitTools = [
  {
    title: "Market Analysis",
    icon: BarChart3,
    className: "left-[5%] top-[16%]",
    colorClassName: "bg-blue-600",
  },
  {
    title: "Fast Execution",
    icon: Zap,
    className: "right-[5%] top-[16%]",
    colorClassName: "bg-amber-500",
  },
  {
    title: "Portfolio",
    icon: BriefcaseBusiness,
    className: "bottom-[13%] left-[7%]",
    colorClassName: "bg-violet-600",
  },
  {
    title: "Risk Control",
    icon: ShieldCheck,
    className: "bottom-[13%] right-[7%]",
    colorClassName: "bg-emerald-500",
  },
];

export default function TradingRouteVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const intro = gsap.timeline({
            defaults: {
              ease: "power3.out",
            },
          });

          intro
            .from(".radar-panel", {
              opacity: 0,
              scale: 0.97,
              y: 18,
              duration: 0.8,
            })
            .from(
              ".globe-container",
              {
                opacity: 0,
                scale: 0.65,
                duration: 0.75,
              },
              "-=0.35",
            )
            .from(
              ".orbit-tool",
              {
                opacity: 0,
                scale: 0.75,
                stagger: 0.12,
                duration: 0.5,
              },
              "-=0.35",
            )
            .from(
              ".bottom-status",
              {
                opacity: 0,
                y: 12,
                duration: 0.45,
              },
              "-=0.2",
            );

          gsap.to(".globe-sphere", {
            rotation: 360,
            duration: 24,
            repeat: -1,
            ease: "none",
            transformOrigin: "center",
          });

          gsap.to(".globe-lines-reverse", {
            rotation: -360,
            duration: 30,
            repeat: -1,
            ease: "none",
            transformOrigin: "center",
          });

          gsap.to(".outer-ring", {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "none",
            transformOrigin: "center",
          });

          gsap.to(".middle-ring", {
            rotation: -360,
            duration: 15,
            repeat: -1,
            ease: "none",
            transformOrigin: "center",
          });

          gsap.to(".radar-beam", {
            rotation: 360,
            duration: 5,
            repeat: -1,
            ease: "none",
            transformOrigin: "center",
          });

          gsap.to(".radar-pulse", {
            scale: 1.65,
            opacity: 0,
            duration: 2.2,
            repeat: -1,
            ease: "power1.out",
          });

          gsap.to(".globe-core", {
            scale: 1.04,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });

          gsap.to(".globe-glow", {
            scale: 1.18,
            opacity: 0.5,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });

          gsap.to(".orbit-tool", {
            y: -5,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            stagger: {
              each: 0.28,
              from: "random",
            },
            ease: "sine.inOut",
          });

          gsap.to(".connection-path", {
            strokeDashoffset: -34,
            duration: 3,
            repeat: -1,
            ease: "none",
          });

          gsap.to(".orbit-node-one", {
            rotation: 360,
            duration: 8,
            repeat: -1,
            ease: "none",
            svgOrigin: "300 170",
          });

          gsap.to(".orbit-node-two", {
            rotation: -360,
            duration: 11,
            repeat: -1,
            ease: "none",
            svgOrigin: "300 170",
          });

          gsap.to(".orbit-node-three", {
            rotation: 360,
            duration: 14,
            repeat: -1,
            ease: "none",
            svgOrigin: "300 170",
          });

          gsap.to(".live-pulse", {
            scale: 2.2,
            opacity: 0,
            duration: 1.4,
            repeat: -1,
            ease: "power1.out",
          });
        },
      );

      return () => media.revert();
    },
    {
      scope: containerRef,
    },
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[390px] w-full"
    >
      <div className="globe-glow pointer-events-none absolute left-1/2 top-[48%] size-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/30 blur-3xl" />

      <section className="radar-panel relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-[28px] backdrop-blur">
        <BackgroundGrid />

        <div className="relative min-h-0 flex-1">
          <TradingConnections />

          {orbitTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article
                key={tool.title}
                className={`orbit-tool absolute z-30 flex items-center gap-3 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_14px_35px_rgba(37,99,235,0.12)] ${tool.className}`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${tool.colorClassName}`}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <p className="whitespace-nowrap text-[11px] font-bold text-slate-900">
                    {tool.title}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />

                    <span className="text-[8px] font-medium text-slate-400">
                      Connected
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="globe-container absolute left-1/2 top-1/2 z-20 flex size-[245px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="radar-pulse absolute inset-6 rounded-full border-2 border-blue-400/50" />

            <div className="outer-ring absolute inset-0 rounded-full border border-dashed border-blue-300">
              <span className="absolute left-1/2 top-[-4px] size-2 -translate-x-1/2 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]" />

              <span className="absolute bottom-4 right-3 size-2 rounded-full bg-violet-500 shadow-[0_0_12px_#8b5cf6]" />
            </div>

            <div className="middle-ring absolute inset-5 rounded-full border border-dotted border-cyan-300">
              <span className="absolute left-3 top-5 size-2 rounded-full bg-cyan-500 shadow-[0_0_12px_#06b6d4]" />
            </div>

            <div className="globe-core relative flex size-[170px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 shadow-[0_25px_60px_rgba(37,99,235,0.45)]">
              <GlobeWireframe />

              <div className="radar-beam absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left bg-gradient-to-tr from-transparent to-white/25 [clip-path:polygon(0_100%,100%_0,100%_100%)]" />

              <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/20 via-transparent to-white/25" />

              <div className="relative z-10 flex flex-col items-center text-white">
                <Globe2 size={30} />

                <p className="mt-2 text-xs font-bold tracking-wide">
                  TRADEPRO
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-300" />

                  <span className="text-[8px] font-medium text-blue-100">
                    GLOBAL HUB
                  </span>
                </div>
              </div>
            </div>
          </div>

          <svg
            viewBox="0 0 600 340"
            className="pointer-events-none absolute inset-0 z-10 size-full"
            aria-hidden="true"
          >
            <circle
              className="orbit-node-one"
              cx="300"
              cy="42"
              r="5"
              fill="#2563eb"
            />

            <circle
              className="orbit-node-two"
              cx="432"
              cy="170"
              r="5"
              fill="#8b5cf6"
            />

            <circle
              className="orbit-node-three"
              cx="300"
              cy="300"
              r="5"
              fill="#10b981"
            />
          </svg>
        </div>
      </section>
    </div>
  );
}

function TradingConnections() {
  return (
    <svg
      viewBox="0 0 600 340"
      className="pointer-events-none absolute inset-0 z-10 size-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="globalTradingConnection"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <path
        className="connection-path"
        d="M145 85 C215 85 220 125 255 145"
        fill="none"
        stroke="url(#globalTradingConnection)"
        strokeWidth="2.5"
        strokeDasharray="7 10"
      />

      <path
        className="connection-path"
        d="M455 85 C385 85 380 125 345 145"
        fill="none"
        stroke="url(#globalTradingConnection)"
        strokeWidth="2.5"
        strokeDasharray="7 10"
      />

      <path
        className="connection-path"
        d="M145 260 C215 260 220 215 255 195"
        fill="none"
        stroke="url(#globalTradingConnection)"
        strokeWidth="2.5"
        strokeDasharray="7 10"
      />

      <path
        className="connection-path"
        d="M455 260 C385 260 380 215 345 195"
        fill="none"
        stroke="url(#globalTradingConnection)"
        strokeWidth="2.5"
        strokeDasharray="7 10"
      />
    </svg>
  );
}

function GlobeWireframe() {
  return (
    <svg
      viewBox="0 0 180 180"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <g className="globe-sphere">
        <circle
          cx="90"
          cy="90"
          r="67"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.4"
        />

        <ellipse
          cx="90"
          cy="90"
          rx="35"
          ry="67"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.4"
        />

        <ellipse
          cx="90"
          cy="90"
          rx="58"
          ry="67"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      </g>

      <g className="globe-lines-reverse">
        <ellipse
          cx="90"
          cy="90"
          rx="67"
          ry="29"
          fill="none"
          stroke="rgba(255,255,255,0.48)"
          strokeWidth="1.4"
        />

        <ellipse
          cx="90"
          cy="90"
          rx="67"
          ry="50"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />

        <path
          d="M31 64 C59 78 121 78 149 64"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
        />

        <path
          d="M31 116 C59 102 121 102 149 116"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

function StatusItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold text-slate-800">
          {title}
        </p>

        <p className="truncate text-[8px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full opacity-40"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="globalRadarGrid"
          width="38"
          height="38"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M38 0H0V38"
            fill="none"
            stroke="#dbeafe"
            strokeWidth="1"
            strokeDasharray="2 7"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#globalRadarGrid)" />
    </svg>
  );
}