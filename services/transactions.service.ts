import { internalApiFetch } from "@/lib/api";
import type {
  TransactionsPagination,
  TransactionsParams,
} from "@/types/transactions";

export function getFundsTransactions(params: TransactionsParams) {
  return internalApiFetch<TransactionsPagination>(
    "/api/backend/funds/transactions",
    {
      method: "POST",
      body: JSON.stringify(params),
    },
  );
}
