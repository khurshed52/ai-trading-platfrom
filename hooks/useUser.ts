import { useQuery } from "@tanstack/react-query";
import { getUserDetail, getTradingSummary} from "@/services/user.services";

export function useUserDetail() {
  return useQuery({
    queryKey: ["user-detail"],
    queryFn: getUserDetail,
    staleTime: Infinity,
  });
}

export function useTradingSummary() {
  return useQuery({
    queryKey: ["trading-summary"],
    queryFn: () => getTradingSummary(),
  });
}
