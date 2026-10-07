export type MarketPriceResult = {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  buyPrice?: number;
  sellPrice?: number;
  change?: number;
  percentageChange?: number;
};

type MarketPriceApiResponse = {
  data?: MarketPriceResult[];
  message?: string;
};

type TwelveDataPriceResponse = {
  price?: string;
  status?: string;
  message?: string;
};

const marketNames: Record<string, string> = {
  "XAU/USD": "Gold",
  "XAG/USD": "Silver",
  "EUR/USD": "Euro / US Dollar",
  "GBP/USD": "British Pound / US Dollar",
  "EUR/JPY": "Euro / Japanese Yen",
  "BTC/USD": "Bitcoin",
  "ETH/USD": "Ethereum",
};

function normalizeMarketSymbol(symbol: string): string {
  const compactSymbol = symbol
    .trim()
    .toUpperCase()
    .replaceAll("-", "/")
    .replaceAll(" ", "");

  const symbolAliases: Record<string, string> = {
    XAUUSD: "XAU/USD",
    XAGUSD: "XAG/USD",
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    EURJPY: "EUR/JPY",
    BTCUSD: "BTC/USD",
    ETHUSD: "ETH/USD",
  };

  return symbolAliases[compactSymbol] ?? compactSymbol;
}

async function getLatestSymbolPrice(
  symbol: string,
): Promise<MarketPriceResult> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("TWELVE_DATA_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    symbol,
    apikey: apiKey,
  });
  const response = await fetch(
    `https://api.twelvedata.com/price?${params.toString()}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );
  const result = (await response.json()) as TwelveDataPriceResponse;
  const price = Number(result.price);

  if (
    !response.ok ||
    result.status === "error" ||
    !Number.isFinite(price)
  ) {
    throw new Error(
      result.message || `Market price not available for ${symbol}`,
    );
  }

  return {
    symbol,
    displaySymbol: symbol.replace("/", ""),
    name: marketNames[symbol] ?? symbol,
    price,
  };
}

export async function getMarketPrice(
  symbol: string,
): Promise<MarketPriceResult> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/markets`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const result = (await response.json()) as MarketPriceApiResponse;

  if (!response.ok) {
    throw new Error(result.message || "Unable to fetch market data");
  }

  const normalizedSymbol = normalizeMarketSymbol(symbol);
  const market = result.data?.find(
    (item) => item.symbol.toUpperCase() === normalizedSymbol,
  );

  if (market) {
    return market;
  }

  return getLatestSymbolPrice(normalizedSymbol);
}
