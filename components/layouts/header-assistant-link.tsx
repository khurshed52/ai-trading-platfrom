"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";

const topicGroups = [
  "Balances & Funds",
  "Deposits & Withdrawals",
  "Transfers & History",
  "Trading Accounts",
  "KYC & Verification",
  "Market News",
  "Trading Education",
  "Account Security",
  "Funds Insights",
  "Platform Support",
] as const;

const ROTATION_INTERVAL_MS = 3_200;

function AnimatedTopic({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className="block truncate">{text}</span>;
  }

  return (
    <motion.span
      className="inline-flex items-center whitespace-nowrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {Array.from(text).map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.01,
            delay: index * 0.035,
          }}
        >
          {character}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function HeaderAssistantLink() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const rotationTimer = window.setInterval(() => {
      setActiveGroupIndex(
        (currentIndex) =>
          (currentIndex + 1) % topicGroups.length,
      );
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(rotationTimer);
  }, [reduceMotion]);

  const activeTopics = topicGroups[activeGroupIndex];

  return (
    <Link
      href={ROUTES.PUBLIC.TRADEPRO_AI}
      aria-label="Open TradePro Assistant"
      className="
        group hidden
        h-[54px] w-[282px]
        shrink-0 items-center gap-2.5
        rounded-2xl border border-indigo-100
        bg-gradient-to-r
        from-indigo-50 via-blue-50 to-violet-50
        px-3
        text-left
        transition-all duration-300 ease-out
        hover:-translate-y-px
        hover:border-blue-300
        hover:from-blue-50
        hover:to-indigo-100
        hover:shadow-[0_3px_10px_rgba(37,99,235,0.10)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        focus-visible:ring-offset-2
        xl:flex
      "
    >
      {/* AI icon */}
      <span
        className="
          flex size-9 shrink-0
          items-center justify-center
          rounded-xl
          bg-gradient-to-br
          from-blue-600 to-violet-600
          text-white
          transition-transform duration-300 ease-out
          group-hover:rotate-3
          group-hover:scale-105
        "
      >
        <Sparkles size={19} strokeWidth={2.1} />
      </span>

      {/* Title and animated topics */}
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className="
            block truncate
            text-[13px] font-bold
            leading-5 text-blue-700
          "
        >
          TradePro Assistant
        </span>

        <span
          className="
            flex min-w-0 items-center gap-1
            overflow-hidden
            text-[11px] font-medium
            leading-4 text-slate-800
          "
        >
          <span className="shrink-0">
            Ask AI about
          </span>

          {/* Fixed available space prevents layout shifts */}
          <span
            className="relative block min-w-0 flex-1 overflow-hidden whitespace-nowrap"
          >
            <AnimatePresence mode="wait" initial={false}>
              <AnimatedTopic
                key={reduceMotion ? "static" : activeTopics}
                text={activeTopics}
              />
            </AnimatePresence>
          </span>
        </span>
      </span>

      {/* Navigation arrow */}
      <ArrowRight
        size={16}
        className="
          shrink-0 text-blue-500
          transition-transform duration-300 ease-out
          group-hover:translate-x-1
        "
      />
    </Link>
  );
}