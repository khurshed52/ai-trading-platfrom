import { internalApiFetch } from "@/lib/api";

export type WithdrawalRequest = {
  Withdraw_TO: 1;
  paymenT_DESTINATION: string;
  withdraw_AMOUNT: number;
  currency: string;
};

export type WithdrawalExchangeRateParams = {
  fromCurrency: string;
  toCurrency: string;
  paymentMethod?: number;
};

function createWithdrawal(endpoint: string, payload: WithdrawalRequest) {
  return internalApiFetch<unknown>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWithdrawalExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: WithdrawalExchangeRateParams) {
  const searchParams = new URLSearchParams({
    FromCurrency: fromCurrency.trim().toUpperCase(),
    ToCurrency: toCurrency.trim().toUpperCase(),
    TransactionType: "withdraw",
    PaymentMethod: String(paymentMethod),
  });

  return internalApiFetch<number>(
    `/api/backend/Miscellaneous/GetExchangeRate?${searchParams.toString()}`,
    { method: "GET" },
  );
}

export function createBankTransferWithdrawal(payload: WithdrawalRequest) {
  return createWithdrawal("/api/backend/Withdraw/BankTransfer", payload);
}

export function createCreditDebitWithdrawal(payload: WithdrawalRequest) {
  return createWithdrawal("/api/backend/Withdraw/creditdebitt", payload);
}

export function createSkrillWithdrawal(payload: WithdrawalRequest) {
  return createWithdrawal("/api/backend/Withdraw/skrill", payload);
}

export function createUsdtWithdrawal(payload: WithdrawalRequest) {
  return createWithdrawal("/api/backend/Withdraw/usdt", payload);
}
