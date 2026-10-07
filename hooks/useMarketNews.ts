import { useQuery } from "@tanstack/react-query";
import { getMarketNews } from "@/services/marketNews.services";

export function useMarketNews() {
  return useQuery({
    queryKey: ["market-news"],
    queryFn: getMarketNews,

    // Don't refetch every time component mounts
    staleTime: 5 * 60 * 1000,

    // Refresh every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
} 