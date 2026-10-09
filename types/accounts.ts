export type TradingPlatform = "MT4" | "MT5";

export type TradingCurrency = "USD" | "EUR";

export type TradingAccount = {
  id: string;
  accountNumber: string;
  platform: TradingPlatform;
  currency: TradingCurrency;
  balance: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTradingAccountRequest = {
  platform: TradingPlatform;
  currency: TradingCurrency;
};

export type CreateTradingAccountData = {
  tradingAccount: TradingAccount;
};

export type TradingAccountsPagination = {
  page: number;
  pageSize: number;
  dataCount: number;
  pageCount: number;
  pageData: TradingAccount[];
};

export type TradingAccountsParams = {
  page: number;
  pageSize: number;
  filters: Record<string, never>;
};
