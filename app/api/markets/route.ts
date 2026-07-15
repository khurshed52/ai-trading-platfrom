import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Start with forex and crypto symbols supported by the free plan.
 * Add metals later after confirming your Twelve Data plan supports them.
 */
const symbols = [
  {
    symbol: "XAU/USD",
    name: "Gold",
  },
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
  },
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
  },
  {
    symbol: "EUR/JPY",
    name: "Euro / Japanese Yen",
  },
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
  price: number;
  previousPrice: number;
  change: number;
  percentageChange: number;
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
    symbols.map(async ({ symbol, name }): Promise<MarketResult> => {
      const params = new URLSearchParams({
        symbol,
        interval: "1h",
        outputsize: "24",

        // Must be lowercase.
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

      /*
       * Parse the response before checking response.ok so the actual
       * Twelve Data error message can be returned.
       */
      const responseData =
        (await response.json()) as TwelveDataTimeSeriesResponse;

      if (!response.ok || responseData.status === "error") {
        console.error("Twelve Data request failed:", {
          symbol,
          status: response.status,
          code: responseData.code,
          message: responseData.message,
        });

        throw new Error(
          responseData.message ||
            `Twelve Data returned HTTP ${response.status} for ${symbol}.`,
        );
      }

      if (!responseData.values?.length) {
        throw new Error(`No market data was returned for ${symbol}.`);
      }

      /*
       * Since order=asc, the oldest value is first and newest is last.
       */
      const values = responseData.values;

      const firstPrice = Number(values[0].close);
      const currentPrice = Number(values[values.length - 1].close);

      if (
        !Number.isFinite(firstPrice) ||
        !Number.isFinite(currentPrice)
      ) {
        throw new Error(`Invalid price data was returned for ${symbol}.`);
      }

      const change = currentPrice - firstPrice;

      const percentageChange =
        firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

      const chartPoints = values
        .map((value) => ({
          datetime: value.datetime,
          value: Number(value.close),
        }))
        .filter((point) => Number.isFinite(point.value));

      return {
        symbol,
        displaySymbol: symbol.replace("/", ""),
        name,
        price: currentPrice,
        previousPrice: firstPrice,
        change,
        percentageChange,
        chart: chartPoints.map((point) => point.value),
        chartPoints,
      };
    }),
  );

  const data: MarketResult[] = [];
  const failed: FailedMarket[] = [];

  settledResults.forEach((result, index) => {
    const symbol = symbols[index].symbol;

    if (result.status === "fulfilled") {
      data.push(result.value);
      return;
    }

    failed.push({
      symbol,
      message:
        result.reason instanceof Error
          ? result.reason.message
          : `Unable to retrieve ${symbol}.`,
    });
  });

  /*
   * Only fail the whole request when every market request failed.
   */
  if (data.length === 0) {
    return NextResponse.json(
      {
        message:
          failed[0]?.message ||
          "Twelve Data did not return any market data.",
        errors: failed,
      },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json(
    {
      data,
      errors: failed,
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        /*
         * Avoid making another provider request for one minute.
         * The browser query should also poll much less frequently.
         */
        "Cache-Control": "private, max-age=60",
      },
    },
  );
}