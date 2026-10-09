import { internalApiFetch } from "@/lib/api";
import type {
  CreateTradingAccountData,
  CreateTradingAccountRequest,
  TradingAccount,
  TradingAccountsPagination,
  TradingAccountsParams,
} from "@/types/accounts";

const ACCOUNTS_API = "/api/backend/accounts";

export function getAllTradingAccounts() {
  return internalApiFetch<TradingAccount[]>(`${ACCOUNTS_API}/all`, {
    method: "GET",
  });
}

export function getTradingAccounts({
  page,
  pageSize,
  filters,
}: TradingAccountsParams) {
  return internalApiFetch<TradingAccountsPagination>(
    `${ACCOUNTS_API}/getAccounts`,
    {
      method: "POST",
      body: JSON.stringify({ page, pageSize, filters }),
    },
  );
}

export function createTradingAccount(
  payload: CreateTradingAccountRequest,
) {
  return internalApiFetch<CreateTradingAccountData>(
    `${ACCOUNTS_API}/createAccounts`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
