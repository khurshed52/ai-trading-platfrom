import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getFundsTransactions } from "@/services/transactions.service";
import type { TransactionsParams } from "@/types/transactions";

export function useFundsTransactions(params: TransactionsParams) {
  return useQuery({
    queryKey: ["funds-transactions", params],
    queryFn: () => getFundsTransactions(params),
    placeholderData: keepPreviousData,
  });
}
