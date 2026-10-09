import { internalApiFetch } from "@/lib/api";
import type {
  DepositExchangeRateData,
  InitiateStripeDepositRequest,
  StripeDepositResponse,
} from "@/types/deposit";

export type DepositExchangeRateParams = {
  fromCurrency: string;
  toCurrency: string;
  amount: 1;
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
  amount,
}: DepositExchangeRateParams) {
  return internalApiFetch<DepositExchangeRateData>(
    "/api/backend/funds/exchange-rate",
    {
      method: "POST",
      body: JSON.stringify({
        fromCurrency,
        toCurrency: toCurrency.trim().toUpperCase(),
        amount,
      }),
    },
  );
}

export function initiateStripeDeposit({
  payload,
  idempotencyKey,
}: InitiateStripeDepositRequest) {
  return internalApiFetch<StripeDepositResponse>(
    "/api/backend/funds/deposit",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    },
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
