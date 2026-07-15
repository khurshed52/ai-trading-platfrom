// app/(dashboard)/dashboard/page.tsx

"use client";

import Link from "next/link";
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BellOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Typography,
} from "antd";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  RefreshCw,
  UserRound,
  WalletCards,
} from "lucide-react";

const { Title, Text } = Typography;

type SummaryItem = {
  title: string;
  value: string;
  suffix?: string;
  percentage: number;
  chart: number[];
  icon: React.ReactNode;
  iconClassName: string;
  chartColor: string;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  icon: React.ReactNode;
  iconClassName: string;
};

type MarketItem = {
  symbol: string;
  pair: string;
  name: string;
  price: string;
  change: number;
  chart: number[];
  icon: string;
  iconClassName: string;
};

const summaryItems: SummaryItem[] = [
  {
    title: "Trading Balance",
    value: "5,680.48",
    suffix: "USD",
    percentage: 4.35,
    chart: [18, 20, 19, 23, 25, 21, 20, 24, 26, 30, 28, 33],
    icon: <WalletCards size={22} />,
    iconClassName:
      "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    chartColor: "#2563eb",
  },
  {
    title: "Total Lots",
    value: "102.75",
    percentage: 2.15,
    chart: [18, 19, 18, 22, 20, 17, 18, 24, 20, 25, 30, 27],
    icon: <BarChart3 size={22} />,
    iconClassName:
      "bg-gradient-to-br from-violet-400 to-purple-600 text-white",
    chartColor: "#a855f7",
  },
  {
    title: "Open Positions",
    value: "4,989",
    percentage: -1.35,
    chart: [18, 20, 17, 22, 19, 17, 20, 26, 18, 16, 22, 20],
    icon: <BriefcaseBusiness size={22} />,
    iconClassName:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white",
    chartColor: "#10b981",
  },
  {
    title: "Profit",
    value: "-26,994.09",
    suffix: "USD",
    percentage: -3.25,
    chart: [16, 21, 18, 23, 17, 22, 29, 20, 14, 17, 22, 24],
    icon: <CircleDollarSign size={22} />,
    iconClassName:
      "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
    chartColor: "#f97316",
  },
  {
    title: "Swaps",
    value: "-5,046.7",
    percentage: 0.75,
    chart: [15, 17, 14, 18, 16, 22, 15, 18, 17, 21, 16, 25],
    icon: <RefreshCw size={22} />,
    iconClassName:
      "bg-gradient-to-br from-cyan-400 to-teal-500 text-white",
    chartColor: "#14b8a6",
  },
];

const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "Your withdrawal request is being processed.",
    description: "We will notify you once it is complete.",
    date: "13/07/2026",
    time: "10:30 AM",
    icon: <ClockCircleOutlined />,
    iconClassName: "bg-emerald-50 text-emerald-500",
  },
  {
    id: "2",
    title: "Your withdrawal request is being processed.",
    description: "We will notify you once it is complete.",
    date: "21/06/2026",
    time: "09:15 AM",
    icon: <WalletCards size={19} />,
    iconClassName: "bg-violet-50 text-violet-500",
  },
  {
    id: "3",
    title: "Your withdrawal request is being processed.",
    description: "We will notify you once it is complete.",
    date: "15/06/2026",
    time: "11:45 AM",
    icon: <BarChart3 size={19} />,
    iconClassName: "bg-amber-50 text-amber-500",
  },
];

const marketItems: MarketItem[] = [
  {
    symbol: "BTC",
    pair: "BTC / USDT",
    name: "Bitcoin",
    price: "65,245.30",
    change: 2.45,
    chart: [16, 18, 20, 19, 23, 25, 22, 21, 26, 30, 27, 31],
    icon: "₿",
    iconClassName: "bg-orange-500",
  },
  {
    symbol: "ETH",
    pair: "ETH / USDT",
    name: "Ethereum",
    price: "3,142.18",
    change: 3.21,
    chart: [14, 15, 16, 19, 18, 22, 20, 25, 28, 24, 27, 31],
    icon: "◆",
    iconClassName: "bg-indigo-500",
  },
  {
    symbol: "BNB",
    pair: "BNB / USDT",
    name: "BNB",
    price: "598.62",
    change: -1.12,
    chart: [29, 27, 25, 22, 23, 20, 19, 22, 20, 17, 18, 16],
    icon: "◇",
    iconClassName: "bg-amber-500",
  },
  {
    symbol: "SOL",
    pair: "SOL / USDT",
    name: "Solana",
    price: "142.35",
    change: 4.75,
    chart: [12, 14, 16, 15, 19, 18, 23, 21, 26, 28, 27, 32],
    icon: "S",
    iconClassName: "bg-violet-600",
  },
  {
    symbol: "XRP",
    pair: "XRP / USDT",
    name: "XRP",
    price: "0.5284",
    change: 1.08,
    chart: [14, 16, 15, 18, 17, 19, 21, 20, 23, 22, 25, 27],
    icon: "X",
    iconClassName: "bg-slate-950",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <ProfileHero />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryItems.map((item) => (
          <TradingSummaryCard
            key={item.title}
            item={item}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)]">
        <NotificationsCard />
        <MarketSnapshotCard />
      </section>
    </div>
  );
}

function ProfileHero() {
  return (
    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 p-2 shadow-[0_24px_60px_rgba(37,99,235,0.22)] sm:p-7">
      <HeroDecoration />

      <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(520px,1.15fr)] xl:items-center">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div className="flex size-28 items-center justify-center rounded-full border-[5px] border-white/90 bg-white/15 shadow-xl backdrop-blur sm:size-32">
              <Avatar
                size={104}
                icon={<UserOutlined />}
                className="!bg-gradient-to-b !from-slate-900 !to-blue-700 !text-5xl"
              />
            </div>

            <span className="absolute bottom-2 right-2 size-5 rounded-full border-4 border-white bg-emerald-400" />
          </div>

          <div className="min-w-0 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <Title
                level={2}
                className="!mb-0 !text-2xl !font-bold !text-white sm:!text-3xl"
              >
                Khurshed Khan
              </Title>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <CheckCircleFilled />
                Verified
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-blue-100">
              <span>SID: 12125543</span>
              <span className="hidden h-4 w-px bg-white/30 sm:block" />
              <span>Joined on 12 Jan 2024</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-4">
          <QuickAction
            href="/deposit"
            label="Deposit"
            description="Add Funds"
            icon={<ArrowDownToLine size={23} />}
          />

          <QuickAction
            href="/withdraw"
            label="Withdraw"
            description="Withdraw Funds"
            icon={<ArrowUpFromLine size={23} />}
          />

          <QuickAction
            href="/profile"
            label="Profile"
            description="View Profile"
            icon={<UserRound size={23} />}
          />

          <QuickAction
            href="/open-account"
            label="Open Account"
            description="Create New"
            icon={<PlusOutlined />}
          />
        </div>
      </div>
    </section>
  );
}

type QuickActionProps = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

function QuickAction({
  href,
  label,
  description,
  icon,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[130px] flex-col items-center justify-center border-white/15 p-4 text-center text-white transition hover:bg-white/10 [&:not(:nth-child(2n))]:border-r sm:[&:not(:last-child)]:border-r"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg transition group-hover:-translate-y-1">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-white">
        {label}
      </p>

      <p className="mt-1 text-xs text-blue-100">
        {description}
      </p>
    </Link>
  );
}

function HeroDecoration() {
  return (
    <>
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />

      <div className="pointer-events-none absolute bottom-[-120px] left-[30%] size-72 rounded-full bg-cyan-300/10 blur-3xl" />

      <svg
        viewBox="0 0 500 180"
        className="pointer-events-none absolute bottom-0 left-[22%] hidden h-[150px] w-[500px] opacity-20 lg:block"
        aria-hidden="true"
      >
        <path
          d="M0 125 C55 130 62 78 115 92 C170 108 192 55 242 76 C295 99 317 33 370 52 C420 68 447 18 500 40"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />

        {[0, 115, 242, 370, 500].map(
          (x, index) => (
            <circle
              key={x}
              cx={x}
              cy={[125, 92, 76, 52, 40][index]}
              r="4"
              fill="white"
            />
          ),
        )}
      </svg>
    </>
  );
}

function TradingSummaryCard({
  item,
}: {
  item: SummaryItem;
}) {
  const positive = item.percentage >= 0;
  const chartData = item.chart.map((value, index) => ({
    index,
    value,
  }));

  const gradientId = `summary-${item.title
    .toLowerCase()
    .replaceAll(" ", "-")}`;

  return (
    <Card
      bordered={false}
      className="overflow-hidden !rounded-2xl !border !border-slate-200/70 !bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]"
      styles={{
        body: {
          padding: 18,
        },
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${item.iconClassName}`}
        >
          {item.icon}
        </div>

        <div className="min-w-0">
          <Text className="!text-xs !font-medium !text-slate-500">
            {item.title}
          </Text>

          <div className="mt-1 flex flex-wrap items-end gap-1">
            <span className="text-[21px] font-bold tracking-tight text-slate-950">
              {item.value}
            </span>

            {item.suffix && (
              <span className="pb-0.5 text-xs font-semibold text-slate-500">
                {item.suffix}
              </span>
            )}
          </div>

          <div
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              positive
                ? "text-emerald-500"
                : "text-rose-500"
            }`}
          >
            {positive ? (
              <ArrowUpOutlined />
            ) : (
              <ArrowDownOutlined />
            )}

            <span>{Math.abs(item.percentage)}%</span>
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            from yesterday
          </p>
        </div>
      </div>

     
    </Card>
  );
}

function NotificationsCard() {
  return (
    <Card
      bordered={false}
      className="overflow-hidden !rounded-2xl !border !border-slate-200/70 !bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <BellOutlined className="mt-1 text-xl text-blue-600" />

          <div>
            <Title
              level={4}
              className="!mb-0 !text-base !font-bold !text-slate-950"
            >
              Stay Informed
            </Title>

            <Text className="!mt-1 !block !text-xs !text-slate-500">
              Important updates and notifications
            </Text>
          </div>
        </div>

        <Button
          type="link"
          className="!font-semibold"
        >
          View All
        </Button>
      </div>

      <div className="divide-y divide-slate-100 px-4 sm:px-5">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="grid gap-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center"
          >
            <div
              className={`flex size-12 items-center justify-center rounded-xl text-xl ${notification.iconClassName}`}
            >
              {notification.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-blue-600" />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {notification.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pl-[60px] text-left sm:pl-0 sm:text-right">
              <p className="text-xs font-medium text-slate-500">
                {notification.date}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {notification.time}
              </p>
            </div>

            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              className="!hidden sm:!inline-flex"
            />
          </article>
        ))}
      </div>
    </Card>
  );
}

function MarketSnapshotCard() {
  return (
    <Card
      bordered={false}
      className="overflow-hidden !rounded-2xl !border !border-slate-200/70 !bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <Title
            level={4}
            className="!mb-0 !text-base !font-bold !text-slate-950"
          >
            Market Snapshot
          </Title>

          <Text className="!mt-1 !block !text-xs !text-slate-500">
            Top performing assets
          </Text>
        </div>

        <Link
          href="/markets"
          className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          View Markets
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[minmax(180px,1.3fr)_110px_110px_120px] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-medium text-slate-400">
            <span>Pair</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Chart</span>
          </div>

          <div className="divide-y divide-slate-100">
            {marketItems.map((market) => (
              <div
                key={market.symbol}
                className="grid grid-cols-[minmax(180px,1.3fr)_110px_110px_120px] items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    size={34}
                    className={`!font-bold !text-white ${market.iconClassName}`}
                  >
                    {market.icon}
                  </Avatar>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {market.pair}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {market.name}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-semibold text-slate-800">
                  {market.price}
                </span>

                <span
                  className={`text-xs font-semibold ${
                    market.change >= 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {market.change >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(market.change).toFixed(2)}%
                </span>

                <MiniMarketChart
                  values={market.chart}
                  positive={market.change >= 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniMarketChart({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  const data = values.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="h-10 w-[110px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={
              positive ? "#10b981" : "#f43f5e"
            }
            strokeWidth={2}
            dot={{
              r: 1.7,
              fill:
                positive ? "#10b981" : "#f43f5e",
              strokeWidth: 0,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}