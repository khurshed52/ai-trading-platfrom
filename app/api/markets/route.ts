import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const instruments = [
  {
    symbol: "XAU/USD",
    name: "Gold",
    spreadPoints: 22,
    pointSize: 0.01,
    priceDecimals: 2,
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    spreadPoints: 19,
    pointSize: 1,
    priceDecimals: 2,
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
    spreadPoints: 9,
    pointSize: 0.1,
    priceDecimals: 1,
  },
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    spreadPoints: 16,
    pointSize: 0.00001,
    priceDecimals: 5,
  },
  {
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
    spreadPoints: 19,
    pointSize: 0.001,
    priceDecimals: 3,
  },

  // Add these only if your plan supports them.
  // Every symbol consumes additional Twelve Data credits.

  // {
  //   symbol: "XAG/USD",
  //   name: "Silver",
  //   spreadPoints: 32,
  //   pointSize: 0.001,
  //   priceDecimals: 3,
  // },
  // {
  //   symbol: "USD/JPY",
  //   name: "US Dollar / Japanese Yen",
  //   spreadPoints: 19,
  //   pointSize: 0.001,
  //   priceDecimals: 3,
  // },
  // {
  //   symbol: "EUR/NZD",
  //   name: "Euro / New Zealand Dollar",
  //   spreadPoints: 36,
  //   pointSize: 0.00001,
  //   priceDecimals: 5,
  // },
  // {
  //   symbol: "USD/CAD",
  //   name: "US Dollar / Canadian Dollar",
  //   spreadPoints: 20,
  //   pointSize: 0.00001,
  //   priceDecimals: 5,
  // },
] as const;

type TwelveDataTimeSeriesValue = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
};

type TwelveDataTimeSeriesResponse = {
  meta?: {
    symbol?: string;
    interval?: string;
    currency?: string;
    exchange_timezone?: string;
    exchange?: string;
    type?: string;
  };
  values?: TwelveDataTimeSeriesValue[];
  status?: string;
  code?: number;
  message?: string;
};

type MarketResult = {
  symbol: string;
  displaySymbol: string;
  name: string;

  // Mid/latest market price from Twelve Data.
  price: number;

  // Demo bid/ask presentation values.
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadValue: number;

  previousPrice: number;
  change: number;
  percentageChange: number;
  priceDecimals: number;

  chart: number[];
  chartPoints: Array<{
    datetime: string;
    value: number;
  }>;
};

type FailedMarket = {
  symbol: string;
  message: string;
};

function roundPrice(
  value: number,
  decimals: number,
): number {
  return Number(value.toFixed(decimals));
}

export async function GET() {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        message: "TWELVE_DATA_API_KEY is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const settledResults = await Promise.allSettled(
    instruments.map(
      async ({
        symbol,
        name,
        spreadPoints,
        pointSize,
        priceDecimals,
      }): Promise<MarketResult> => {
        const params = new URLSearchParams({
          symbol,
          interval: "1h",
          outputsize: "24",
          order: "asc",
          apikey: apiKey,
        });

        const response = await fetch(
          `https://api.twelvedata.com/time_series?${params.toString()}`,
          {
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const responseData =
          (await response.json()) as TwelveDataTimeSeriesResponse;

        if (
          !response.ok ||
          responseData.status === "error"
        ) {
          throw new Error(
            responseData.message ||
              `Twelve Data returned HTTP ${response.status} for ${symbol}.`,
          );
        }

        if (!responseData.values?.length) {
          throw new Error(
            `No market data was returned for ${symbol}.`,
          );
        }

        const values = responseData.values;

        // order=asc: first is oldest, last is newest.
        const previousPrice = Number(values[0].close);
        const currentPrice = Number(
          values[values.length - 1].close,
        );

        if (
          !Number.isFinite(previousPrice) ||
          !Number.isFinite(currentPrice)
        ) {
          throw new Error(
            `Invalid price data was returned for ${symbol}.`,
          );
        }

        const spreadValue =
          spreadPoints * pointSize;

        const halfSpread = spreadValue / 2;

        // Buy is ask; sell is bid.
        const buyPrice = roundPrice(
          currentPrice + halfSpread,
          priceDecimals,
        );

        const sellPrice = roundPrice(
          currentPrice - halfSpread,
          priceDecimals,
        );

        const change =
          currentPrice - previousPrice;

        const percentageChange =
          previousPrice !== 0
            ? (change / previousPrice) * 100
            : 0;

        const chartPoints = values
          .map((item) => ({
            datetime: item.datetime,
            value: Number(item.close),
          }))
          .filter((item) =>
            Number.isFinite(item.value),
          );

        return {
          symbol,
          displaySymbol: symbol.replace("/", ""),
          name,

          price: roundPrice(
            currentPrice,
            priceDecimals,
          ),

          buyPrice,
          sellPrice,
          spread: spreadPoints,
          spreadValue,
          previousPrice: roundPrice(
            previousPrice,
            priceDecimals,
          ),
          change,
          percentageChange,
          priceDecimals,

          chart: chartPoints.map(
            (item) => item.value,
          ),
          chartPoints,
        };
      },
    ),
  );

  const data: MarketResult[] = [];
  const errors: FailedMarket[] = [];

  settledResults.forEach((result, index) => {
    const symbol = instruments[index].symbol;

    if (result.status === "fulfilled") {
      data.push(result.value);
      return;
    }

    errors.push({
      symbol,
      message:
        result.reason instanceof Error
          ? result.reason.message
          : `Unable to retrieve ${symbol}.`,
    });
  });

  if (data.length === 0) {
    return NextResponse.json(
      {
        message:
          errors[0]?.message ||
          "Twelve Data did not return any market data.",
        errors,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json(
    {
      data,
      errors,
      spreadType: "estimated",
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control":
          "private, max-age=60, stale-while-revalidate=30",
      },
    },
  );
}