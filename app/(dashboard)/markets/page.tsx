"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Segmented,
  Skeleton,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

type MarketRow = {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  percentageChange: number;
  chart: number[];
};

type MarketResponse = {
  data: MarketRow[];
  updatedAt: string;
};

type MarketTab = "top-hot" | "top-profit" | "top-turnover";

async function getMarkets(): Promise<MarketResponse> {
  const response = await fetch("/api/markets", {
    cache: "no-store",
  });

  const data = (await response.json()) as
    | MarketResponse
    | {
        message?: string;
      };

  if (!response.ok) {
    throw new Error(
      "message" in data && data.message
        ? data.message
        : "Unable to load market data.",
    );
  }

  return data as MarketResponse;
}

function formatPrice(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  });
}

export default function MarketsPage() {
  const [activeTab, setActiveTab] =
    useState<MarketTab>("top-hot");

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<MarketResponse>({
    queryKey: ["markets"],
    queryFn: getMarkets,
    staleTime: 20_000,
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const marketRows = useMemo(() => {
    const rows = [...(data?.data ?? [])];

    if (activeTab === "top-profit") {
      return rows.sort(
        (first, second) =>
          second.percentageChange -
          first.percentageChange,
      );
    }

    if (activeTab === "top-turnover") {
      return rows.sort(
        (first, second) =>
          second.price - first.price,
      );
    }

    return rows.sort(
      (first, second) =>
        Math.abs(second.percentageChange) -
        Math.abs(first.percentageChange),
    );
  }, [activeTab, data?.data]);

  const columns: TableColumnsType<MarketRow> = [
    {
      title: "Symbol",
      dataIndex: "displaySymbol",
      key: "symbol",
      width: 190,
      render: (_, market) => (
        <div className="flex items-center gap-3">
          <MarketIcon symbol={market.symbol} />

          <div>
            <p className="m-0 font-semibold text-white">
              {market.displaySymbol}
            </p>

            <p className="m-0 mt-0.5 text-xs text-slate-500">
              {market.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Current price",
      dataIndex: "price",
      key: "price",
      width: 160,
      render: (price: number) => (
        <span className="font-medium text-slate-100">
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "Previous close",
      dataIndex: "previousPrice",
      key: "previousPrice",
      width: 160,
      responsive: ["md"],
      render: (price: number) => (
        <span className="text-slate-300">
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "Change (%)",
      dataIndex: "percentageChange",
      key: "percentageChange",
      width: 150,
      render: (change: number) => {
        const positive = change >= 0;

        return (
          <span
            className={
              positive
                ? "font-semibold text-emerald-400"
                : "font-semibold text-rose-400"
            }
          >
            {positive ? (
              <ArrowUpOutlined className="mr-1" />
            ) : (
              <ArrowDownOutlined className="mr-1" />
            )}

            {Math.abs(change).toFixed(2)}%
          </span>
        );
      },
    },
    {
      title: "Past 24 hours",
      dataIndex: "chart",
      key: "chart",
      width: 190,
      responsive: ["sm"],
      render: (
        chart: number[],
        market: MarketRow,
      ) => (
        <MarketSparkline
          values={chart}
          positive={market.percentageChange >= 0}
        />
      ),
    },
    {
      title: "Trade",
      key: "trade",
      width: 120,
      fixed: "right",
      render: () => (
        <Button
          ghost
          className="!h-10 !rounded-full !border-slate-700 !px-6 !text-white hover:!border-blue-500 hover:!text-blue-400"
        >
          Trade
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Title
            level={2}
            className="!mb-1 !text-slate-950"
          >
            Markets
          </Title>

          <Text className="!text-slate-500">
            Follow current market movements and recent
            performance.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          {data?.updatedAt && (
            <Text className="!hidden !text-xs !text-slate-400 md:!inline">
              Updated{" "}
              {new Date(
                data.updatedAt,
              ).toLocaleTimeString()}
            </Text>
          )}

          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => void refetch()}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card
        bordered={false}
        className="overflow-hidden !rounded-[22px] !bg-[#080b10] shadow-[0_22px_65px_rgba(15,23,42,0.14)]"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className="border-b border-white/10 px-4 py-5 sm:px-6">
          <Segmented<MarketTab>
            value={activeTab}
            onChange={setActiveTab}
            options={[
              {
                label: "Top Hot",
                value: "top-hot",
              },
              {
                label: "Top Profit",
                value: "top-profit",
              },
              {
                label: "Top Turnover",
                value: "top-turnover",
              },
            ]}
            className="tradepro-market-tabs"
          />
        </div>

        {error ? (
          <div className="p-6">
            <Alert
              type="error"
              showIcon
              message="Unable to load markets"
              description={
                error instanceof Error
                  ? error.message
                  : "Please try again."
              }
              action={
                <Button
                  size="small"
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              }
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <Skeleton
                  key={index}
                  active
                  paragraph={{
                    rows: 1,
                  }}
                  title={false}
                />
              ),
            )}
          </div>
        ) : (
          <Table<MarketRow>
            rowKey="symbol"
            columns={columns}
            dataSource={marketRows}
            pagination={false}
            scroll={{
              x: 900,
            }}
            className="tradepro-market-table"
          />
        )}
      </Card>
    </div>
  );
}

function MarketSparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  const chartData = values.map((value, index) => ({
    index,
    value,
  }));

  if (chartData.length < 2) {
    return (
      <span className="text-xs text-slate-500">
        No chart data
      </span>
    );
  }

  const gradientId = positive
    ? "marketPositiveGradient"
    : "marketNegativeGradient";

  return (
    <div className="h-[54px] w-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 2,
            bottom: 2,
            left: 2,
          }}
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={
                  positive ? "#14b8a6" : "#fb7185"
                }
                stopOpacity={0.38}
              />

              <stop
                offset="100%"
                stopColor={
                  positive ? "#14b8a6" : "#fb7185"
                }
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <YAxis domain={["dataMin", "dataMax"]} hide />

          <Tooltip content={() => null} />

          <Area
            type="monotone"
            dataKey="value"
            stroke={
              positive ? "#14b8a6" : "#fb7185"
            }
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarketIcon({
  symbol,
}: {
  symbol: string;
}) {
  const iconDetails: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    "BTC/USD": {
      label: "₿",
      className: "bg-orange-500",
    },
    "ETH/USD": {
      label: "◆",
      className: "bg-indigo-500",
    },
    "XAU/USD": {
      label: "Au",
      className: "bg-amber-500",
    },
    "XAG/USD": {
      label: "Ag",
      className: "bg-slate-400",
    },
    "EUR/USD": {
      label: "€",
      className: "bg-blue-600",
    },
    "EUR/JPY": {
      label: "¥",
      className: "bg-rose-500",
    },
  };

  const details = iconDetails[symbol] ?? {
    label: symbol.slice(0, 1),
    className: "bg-slate-600",
  };

  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${details.className}`}
    >
      {details.label}
    </div>
  );
}