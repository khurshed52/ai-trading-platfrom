"use client";

import { useEffect, useRef, useState } from "react";
import MarketNews from "@/components/MarketNews";
type Market = {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  lastPrice: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  chart: number[];
};

type BookTickerData = {
  s: string;
  b: string;
  B: string;
  a: string;
  A: string;
};

type TickerData = {
  e: "24hrTicker";
  s: string;
  c: string;
  P: string;
  h: string;
  l: string;
  v: string;
};

type KlineData = {
  e: "kline";
  s: string;
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
};

type CombinedMessage = {
  stream: string;
  data: BookTickerData | TickerData | KlineData;
};

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT"] as const;

const initialMarkets: Record<string, Market> = Object.fromEntries(
  SYMBOLS.map((symbol) => [
    symbol,
    {
      symbol,
      bid: 0,
      ask: 0,
      spread: 0,
      lastPrice: 0,
      changePercent: 0,
      high: 0,
      low: 0,
      volume: 0,
      chart: [],
    },
  ]),
);

function formatPrice(value: number) {
  if (!value) return "—";

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  if (values.length < 2) {
    return <div className="h-10 w-32 rounded bg-slate-100" />;
  }

  const width = 130;
  const height = 40;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-10 w-32"
      role="img"
      aria-label="Price chart"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function TradingMarketPage() {
  const [markets, setMarkets] =
    useState<Record<string, Market>>(initialMarkets);

  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    async function loadHistoricalData() {
      const results = await Promise.allSettled(
        SYMBOLS.map(async (symbol) => {
          const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=30`,
          );

          if (!response.ok) {
            throw new Error(`Failed to load ${symbol} history`);
          }

          const candles: unknown[][] = await response.json();

          return {
            symbol,
            prices: candles.map((candle) => Number(candle[4])),
          };
        }),
      );

      setMarkets((previous) => {
        const updated = { ...previous };

        for (const result of results) {
          if (result.status === "fulfilled") {
            const { symbol, prices } = result.value;

            updated[symbol] = {
              ...updated[symbol],
              chart: prices,
            };
          }
        }

        return updated;
      });
    }

    loadHistoricalData().catch((error: unknown) => {
      console.error("Historical data error:", error);
    });
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;

    const streams = SYMBOLS.flatMap((symbol) => {
      const lowerSymbol = symbol.toLowerCase();

      return [
        `${lowerSymbol}@bookTicker`,
        `${lowerSymbol}@ticker`,
        `${lowerSymbol}@kline_1m`,
      ];
    }).join("/");

    const websocketUrl =
      `wss://stream.binance.com:9443/stream?streams=${streams}`;

    function connect() {
      setStatus("connecting");

      const socket = new WebSocket(websocketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          const message = JSON.parse(event.data) as CombinedMessage;
          const { stream, data } = message;

          if (stream.endsWith("@bookTicker")) {
            const book = data as BookTickerData;

            const bid = Number(book.b);
            const ask = Number(book.a);

            setMarkets((previous) => ({
              ...previous,
              [book.s]: {
                ...previous[book.s],
                bid,
                ask,
                spread: ask - bid,
              },
            }));

            return;
          }

          if (stream.endsWith("@ticker")) {
            const ticker = data as TickerData;

            setMarkets((previous) => ({
              ...previous,
              [ticker.s]: {
                ...previous[ticker.s],
                lastPrice: Number(ticker.c),
                changePercent: Number(ticker.P),
                high: Number(ticker.h),
                low: Number(ticker.l),
                volume: Number(ticker.v),
              },
            }));

            return;
          }

          if (stream.includes("@kline_1m")) {
            const klineData = data as KlineData;
            const closePrice = Number(klineData.k.c);

            setMarkets((previous) => {
              const currentMarket = previous[klineData.s];
              const currentChart = currentMarket.chart;

              let updatedChart: number[];

              if (klineData.k.x) {
                // Candle closed: append a new value.
                updatedChart = [...currentChart, closePrice].slice(-30);
              } else if (currentChart.length > 0) {
                // Candle still open: replace the latest value.
                updatedChart = [
                  ...currentChart.slice(0, -1),
                  closePrice,
                ];
              } else {
                updatedChart = [closePrice];
              }

              return {
                ...previous,
                [klineData.s]: {
                  ...currentMarket,
                  chart: updatedChart,
                },
              };
            });
          }
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        setStatus("disconnected");

        if (shouldReconnectRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
    };
  }, []);

  const marketList = SYMBOLS.map((symbol) => markets[symbol]);

  return (
    <main className="space-y-8 pb-4 text-slate-800">
      <MarketNews />

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-2xl font-extrabold text-slate-950">
              Top Markets
            </h2>
            <p className="mb-0 mt-1 text-sm text-slate-500">
              Live Binance Spot market data
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
            <span
              className={`size-2.5 rounded-full ${
                status === "connected"
                  ? "bg-emerald-500"
                  : status === "connecting"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            />

            <span className="capitalize text-slate-600">{status}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-5 font-medium">Symbol</th>
                <th className="px-6 py-5 font-medium">Buy Price</th>
                <th className="px-6 py-5 font-medium">Spread</th>
                <th className="px-6 py-5 font-medium">Sell Price</th>
                <th className="px-6 py-5 font-medium">Change (%)</th>
                <th className="px-6 py-5 font-medium">High</th>
                <th className="px-6 py-5 font-medium">Low</th>
                <th className="px-6 py-5 font-medium">Past 30 Min</th>
                <th className="px-6 py-5 font-medium">Trade</th>
              </tr>
            </thead>

            <tbody>
              {marketList.map((market) => {
                const isPositive = market.changePercent >= 0;

                return (
                  <tr
                    key={market.symbol}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-5 font-semibold text-slate-950">
                      {market.symbol}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {formatPrice(market.bid)}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {market.spread
                        ? market.spread.toFixed(4)
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {formatPrice(market.ask)}
                    </td>

                    <td
                      className={`px-6 py-5 font-medium ${
                        isPositive
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {market.lastPrice
                        ? `${isPositive ? "+" : ""}${market.changePercent.toFixed(2)}%`
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {formatPrice(market.high)}
                    </td>

                    <td className="px-6 py-5 text-slate-700">
                      {formatPrice(market.low)}
                    </td>

                    <td className="px-6 py-5">
                      <Sparkline
                        values={market.chart}
                        positive={isPositive}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Trading
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
