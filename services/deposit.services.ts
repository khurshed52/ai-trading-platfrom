import { internalApiFetch } from "@/lib/api";

export type DepositExchangeRateParams = {
  fromCurrency: string;
  toCurrency: string;
  paymentMethod?: number;
};

export type DepositRequest = {
  deposiT_TO: 2;
  paymenT_DESTINATION: string;
  deposiT_AMOUNT: number;
  currency: string;
};

export type UsdtDepositRequest = DepositRequest & {
  coinName: string;
};

export type BankTransferDepositRequest = DepositRequest & {
  country: string;
};

export async function getDepositExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: DepositExchangeRateParams) {
  const searchParams = new URLSearchParams({
    FromCurrency: fromCurrency.trim().toUpperCase(),
    ToCurrency: toCurrency.trim().toUpperCase(),
    TransactionType: "deposit",
    PaymentMethod: String(paymentMethod),
  });

  return internalApiFetch<number>(
    `/api/backend/Miscellaneous/GetExchangeRate?${searchParams.toString()}`,
    { method: "GET" },
  );
}

// Function for creating a bank transfer deposit
export function createBankTransferDeposit(payload: BankTransferDepositRequest) {
  return internalApiFetch<unknown>(
    "/api/backend/Deposit/BankTransfer",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function createCreditDebitDeposit(payload: DepositRequest) {
  return internalApiFetch<unknown>(
    "/api/backend/Deposit/creditdebittransfer",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function createSkrillDeposit(payload: DepositRequest) {
  return internalApiFetch<unknown>(
    "/api/backend/Deposit/skrill",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function createUsdtDeposit(payload: UsdtDepositRequest) {
  return internalApiFetch<unknown>(
    "/api/backend/Deposit/usdt",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
