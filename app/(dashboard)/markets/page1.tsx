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
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

const { Title, Text } = Typography;

type MarketTab =
  | "top-hot"
  | "top-profit"
  | "top-turnover";

type MarketRow = {
  symbol: string;
  displaySymbol: string;
  name: string;

  price: number;
  buyPrice: number;
  sellPrice: number;

  spread: number;
  spreadValue: number;
  spreadType: "estimated";

  previousPrice: number;
  change: number;
  percentageChange: number;
  priceDecimals: number;

  chart: number[];

  chartPoints?: Array<{
    datetime: string;
    value: number;
  }>;
};

type MarketApiError = {
  symbol: string;
  message: string;
};

type MarketResponse = {
  data: MarketRow[];
  errors?: MarketApiError[];
  spreadType?: "estimated";
  updatedAt: string;
};

type ApiErrorResponse = {
  message?: string;
};

async function getMarkets(): Promise<MarketResponse> {
  const response = await fetch("/api/markets", {
    method: "GET",
    cache: "no-store",
  });

  const result = (await response.json()) as
    | MarketResponse
    | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(
      "message" in result && result.message
        ? result.message
        : "Unable to load market data.",
    );
  }

  return result as MarketResponse;
}

function formatPrice(
  value: number,
  decimals: number,
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
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

    // Protect Twelve Data free-plan credits.
    staleTime: 60_000,
    refetchInterval: 10 * 60 * 1000,

    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 1,
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
      /*
       * The current API response does not contain volume or turnover.
       * Spread is used here only as a temporary sorting value.
       */
      return rows.sort(
        (first, second) =>
          second.spread - first.spread,
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
      width: 200,
      render: (_, market) => (
        <div className="flex items-center gap-3">
          <MarketIcon symbol={market.symbol} />

          <div className="min-w-0">
            <p className="m-0 truncate font-semibold text-white">
              {market.displaySymbol}
            </p>

            <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
              {market.name}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Buy Price",
      dataIndex: "buyPrice",
      key: "buyPrice",
      width: 155,
      render: (
        buyPrice: number,
        market,
      ) => (
        <span className="font-semibold tabular-nums text-slate-100">
          {formatPrice(
            buyPrice,
            market.priceDecimals,
          )}
        </span>
      ),
    },
    {
      title: "Spread",
      dataIndex: "spread",
      key: "spread",
      width: 110,
      align: "center",
      render: (spread: number) => (
        <span className="font-semibold tabular-nums text-slate-200">
          {spread}
        </span>
      ),
    },
    {
      title: "Sell Price",
      dataIndex: "sellPrice",
      key: "sellPrice",
      width: 155,
      render: (
        sellPrice: number,
        market,
      ) => (
        <span className="font-semibold tabular-nums text-slate-100">
          {formatPrice(
            sellPrice,
            market.priceDecimals,
          )}
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
                ? "font-semibold tabular-nums text-emerald-400"
                : "font-semibold tabular-nums text-rose-400"
            }
          >
            {positive ? (
              <ArrowUpOutlined className="mr-1" />
            ) : (
              <ArrowDownOutlined className="mr-1" />
            )}

            {Math.abs(change).toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Past 24 Hours",
      dataIndex: "chart",
      key: "chart",
      width: 200,
      responsive: ["sm"],
      render: (
        chart: number[],
        market,
      ) => (
        <MarketSparkline
          values={chart}
          positive={
            market.percentageChange >= 0
          }
          symbol={market.symbol}
        />
      ),
    },
    {
      title: "Trade",
      key: "trade",
      width: 145,
      fixed: "right",
      render: (_, market) => (
        <Button
          ghost
          onClick={() => {
            console.log(
              "Open trading screen:",
              market.symbol,
            );
          }}
          className="!h-11 !rounded-full !border-slate-800 !px-7 !font-semibold !text-white hover:!border-blue-500 hover:!text-blue-400"
        >
          Trading
        </Button>
      ),
    },
  ];

  function handleRefresh() {
    void refetch();
  }

  return (
    <div className="space-y-5">
      {/* Page heading */}
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

        <div className="flex flex-wrap items-center gap-3">
          {data?.updatedAt && (
            <Text className="!text-xs !text-slate-400">
              Updated{" "}
              {new Date(
                data.updatedAt,
              ).toLocaleTimeString()}
            </Text>
          )}

          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={handleRefresh}
            className="!h-11 !rounded-xl !px-5 !font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Partial API errors */}
      {data?.errors &&
        data.errors.length > 0 && (
          <Alert
            type="warning"
            showIcon
            closable
            message="Some markets could not be loaded"
            description={data.errors
              .map(
                (item) =>
                  `${item.symbol}: ${item.message}`,
              )
              .join(" · ")}
          />
        )}

      {/* Estimated-spread notice */}
      {data?.spreadType === "estimated" && (
        <Alert
          type="info"
          showIcon
          closable
          message="Estimated trading spread"
          description="Buy and sell prices are display estimates calculated around the Twelve Data market price. They are not executable broker quotes."
        />
      )}

      <Card
        bordered={false}
        className="overflow-hidden !rounded-[24px] !bg-[#080b10] shadow-[0_22px_65px_rgba(15,23,42,0.14)]"
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {/* Tabs */}
        <div className="border-b border-white/10 px-4 py-5 sm:px-6">
          <Segmented
            value={activeTab}
            onChange={(value) => {
              setActiveTab(
                value as MarketTab,
              );
            }}
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

        {/* Background refresh indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 border-b border-white/5 bg-blue-500/5 px-6 py-2 text-xs text-blue-300">
            <span className="size-2 animate-pulse rounded-full bg-blue-400" />
            Updating market prices…
          </div>
        )}

        {/* Error */}
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
                  onClick={handleRefresh}
                >
                  Retry
                </Button>
              }
            />
          </div>
        ) : isLoading ? (
          /* Loading */
          <div className="space-y-6 p-6">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <Skeleton
                key={index}
                active
                title={false}
                paragraph={{
                  rows: 1,
                }}
              />
            ))}
          </div>
        ) : (
          /* Market table */
          <Table<MarketRow>
            rowKey="symbol"
            columns={columns}
            dataSource={marketRows}
            pagination={false}
            scroll={{
              x: 1_150,
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
  symbol,
}: {
  values: number[];
  positive: boolean;
  symbol: string;
}) {
  const chartData = values.map(
    (value, index) => ({
      index,
      value,
    }),
  );

  if (chartData.length < 2) {
    return (
      <span className="text-xs text-slate-500">
        No chart data
      </span>
    );
  }

  const safeSymbol = symbol.replace(
    /[^a-zA-Z0-9]/g,
    "",
  );

  const gradientId = `market-gradient-${safeSymbol}`;

  const chartColor = positive
    ? "#14b8a6"
    : "#fb7185";

  return (
    <div className="h-[58px] w-[160px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
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
                stopColor={chartColor}
                stopOpacity={0.38}
              />

              <stop
                offset="100%"
                stopColor={chartColor}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <YAxis
            domain={["dataMin", "dataMax"]}
            hide
          />

          <Tooltip content={() => null} />

          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColor}
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
    "XAU/USD": {
      label: "Au",
      className: "bg-amber-500",
    },
    "XAG/USD": {
      label: "Ag",
      className: "bg-slate-400",
    },
    "BTC/USD": {
      label: "₿",
      className: "bg-orange-500",
    },
    "ETH/USD": {
      label: "◆",
      className: "bg-indigo-500",
    },
    "EUR/USD": {
      label: "€",
      className: "bg-blue-600",
    },
    "EUR/JPY": {
      label: "¥",
      className: "bg-rose-500",
    },
    "USD/JPY": {
      label: "¥",
      className: "bg-cyan-600",
    },
    "EUR/NZD": {
      label: "NZ",
      className: "bg-sky-600",
    },
    "USD/CAD": {
      label: "CA",
      className: "bg-red-600",
    },
    "USO/USD": {
      label: "OIL",
      className: "bg-slate-800",
    },
  };

  const details =
    iconDetails[symbol] ?? {
      label: symbol
        .replace("/", "")
        .slice(0, 2),
      className: "bg-slate-600",
    };

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg ${details.className}`}
    >
      {details.label}
    </div>
  );
}