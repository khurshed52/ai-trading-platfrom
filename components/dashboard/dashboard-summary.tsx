import { Skeleton } from "antd";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import type { TradingSummary } from "@/services/user.services";

interface DashboardSummaryProps {
  summary?: TradingSummary;
  isLoading: boolean;
}

interface SummaryCardData {
  title: string;
  value: string;
  icon: ReactNode;
  iconClassName: string;
  trend: string;
  trendDirection: "up" | "down";
}

function formatCurrency(value: number | undefined, currency = "USD") {
  if (value === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function DashboardSummary({
  summary,
  isLoading,
}: DashboardSummaryProps) {
  const cards: SummaryCardData[] = [
    {
      title: "Trading Balance",
      value: formatCurrency(summary?.amount, summary?.currency),
      icon: <WalletCards size={24} />,
      iconClassName: "from-blue-500 to-blue-700",
      trend: "12.5%",
      trendDirection: "up",
    },
    {
      title: "Total Lots",
      value: summary?.total_Lot?.toLocaleString() ?? "—",
      icon: <BarChart3 size={24} />,
      iconClassName: "from-violet-500 to-purple-700",
      trend: "8.3%",
      trendDirection: "up",
    },
    {
      title: "Open Positions",
      value: summary?.total_OpenPosition?.toLocaleString() ?? "—",
      icon: <BriefcaseBusiness size={24} />,
      iconClassName: "from-emerald-400 to-emerald-700",
      trend: "25.0%",
      trendDirection: "down",
    },
    {
      title: "Profit",
      value: formatCurrency(summary?.total_Profit, summary?.currency),
      icon: <CircleDollarSign size={24} />,
      iconClassName: "from-orange-400 to-orange-600",
      trend: "18.7%",
      trendDirection: "up",
    },
    {
      title: "Swaps",
      value: formatCurrency(summary?.total_Swap, summary?.currency),
      icon: <RefreshCw size={24} />,
      iconClassName: "from-cyan-400 to-cyan-600",
      trend: "6.2%",
      trendDirection: "down",
    },
  ];

  return (
    <section
      aria-label="Trading summary"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {cards.map((card) => {
        const TrendIcon = card.trendDirection === "up" ? ArrowUp : ArrowDown;
        const trendClassName =
          card.trendDirection === "up" ? "text-emerald-600" : "text-red-500";

        return (
          <article
            key={card.title}
            className="flex min-h-24 min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
          >
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm ${card.iconClassName}`}
            >
              {card.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-500">
                {card.title}
              </p>
              {isLoading ? (
                <Skeleton.Input active size="small" className="!mt-2 !w-24" />
              ) : (
                <div className="mt-1 flex flex-wrap items-end justify-between gap-x-2">
                  <strong className="min-w-0 truncate text-lg font-bold text-slate-950 2xl:text-xl">
                    {card.value}
                  </strong>
                  <div className="text-right text-[10px] text-slate-500">
                    <span
                      className={`flex items-center justify-end gap-0.5 font-bold ${trendClassName}`}
                    >
                      <TrendIcon size={12} strokeWidth={3} />
                      {card.trend}
                    </span>
                    <span>vs last week</span>
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
