export type MarketNews = {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string;
  published_at: string;
  source: string;
};

type MarketNewsResponse = {
  status: string;
  message?: string;
  data: MarketNews[];
};

export async function getMarketNews(): Promise<MarketNews[]> {
  const storedLanguage =
    typeof window === "undefined" ? null : localStorage.getItem("lan");
  const language =
    storedLanguage && /^[a-z]{2}$/i.test(storedLanguage)
      ? storedLanguage.toLowerCase()
      : "en";
  const params = new URLSearchParams({ language });
  const response = await fetch(`/api/market-news?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch market news");
  }

  const result = (await response.json()) as MarketNewsResponse;

  if (result.status !== "success" || !Array.isArray(result.data)) {
    throw new Error(result.message || "Failed to fetch market news");
  }

  return result.data;
}
