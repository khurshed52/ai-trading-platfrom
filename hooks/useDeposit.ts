import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createBankTransferDeposit,
  createCreditDebitDeposit,
  createSkrillDeposit,
  createUsdtDeposit,
  getDepositExchangeRate,
  initiateStripeDeposit,
} from "@/services/deposit.services";
import type { DepositExchangeRateParams } from "@/services/deposit.services";

export function useDepositExchangeRate({
  fromCurrency,
  toCurrency,
  amount,
}: DepositExchangeRateParams) {
  const normalizedFromCurrency = fromCurrency.trim().toUpperCase();
  const normalizedToCurrency = toCurrency.trim().toUpperCase();

  return useQuery({
    queryKey: [
      "deposit-exchange-rate",
      normalizedFromCurrency,
      normalizedToCurrency,
      amount,
    ],
    queryFn: () =>
      getDepositExchangeRate({
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
        amount,
      }),
    enabled: Boolean(normalizedFromCurrency && normalizedToCurrency),
    gcTime: 0,
  });
}

export function useInitiateStripeDeposit() {
  return useMutation({
    mutationFn: initiateStripeDeposit,
  });
}

// Hook for creating a bank transfer deposit
export function useBankTransferDeposit() {
  return useMutation({
    mutationFn: createBankTransferDeposit,
  });
}

// Hook for creating a credit/debit deposit
export function useCreditDebitDeposit() {
  return useMutation({
    mutationFn: createCreditDebitDeposit,
  });
}

// Hook for creating a Skrill deposit
export function useSkrillDeposit() {
  return useMutation({
    mutationFn: createSkrillDeposit,
  });
}

// Hook for creating a USDT deposit
export function useUsdtDeposit() {
  return useMutation({
    mutationFn: createUsdtDeposit,
  });
}
