import { useQuery } from "@tanstack/react-query";
import { getUserDetail } from "@/services/user.services";

export function useUserDetail() {
  return useQuery({
    queryKey: ["user-detail"],
    queryFn: getUserDetail,
    staleTime: Infinity,
  });
}
