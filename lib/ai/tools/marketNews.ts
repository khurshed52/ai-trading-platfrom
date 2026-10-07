export type MarketNewsItem = {
  uuid: string;
  title: string;
  description?: string;
  snippet?: string;
  url: string;
  published_at: string;
  source: string;
};

type MarketNewsApiResponse = {
  status?: string;
  message?: string;
  data?: MarketNewsItem[];
};

export async function getLatestMarketNews(): Promise<MarketNewsItem[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/market-news?language=en`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const result = (await response.json()) as MarketNewsApiResponse;

  if (
    !response.ok ||
    result.status !== "success" ||
    !Array.isArray(result.data)
  ) {
    throw new Error(result.message || "Unable to fetch market news");
  }

  return result.data.slice(0, 5);
}
