import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTradingAccount,
  getAllTradingAccounts,
  getTradingAccounts,
} from "@/services/accounts.service";
import type { TradingAccountsParams } from "@/types/accounts";

const TRADING_ACCOUNTS_QUERY_KEY = ["trading-accounts"] as const;

export function useAllTradingAccounts() {
  return useQuery({
    queryKey: [...TRADING_ACCOUNTS_QUERY_KEY, "all"],
    queryFn: getAllTradingAccounts,
  });
}

export function useTradingAccounts(params: TradingAccountsParams) {
  return useQuery({
    queryKey: [...TRADING_ACCOUNTS_QUERY_KEY, params.page, params.pageSize],
    queryFn: () => getTradingAccounts(params),
  });
}

export function useCreateTradingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTradingAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TRADING_ACCOUNTS_QUERY_KEY,
      });
    },
  });
}
