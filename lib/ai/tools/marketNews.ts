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

export async function getLatestMarketNews(
  appOrigin: string,
): Promise<MarketNewsItem[]> {
  const marketNewsUrl = new URL("/api/market-news?language=en", appOrigin);
  const response = await fetch(marketNewsUrl, {
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
