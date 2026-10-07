import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createBankTransferDeposit,
  createCreditDebitDeposit,
  createSkrillDeposit,
  createUsdtDeposit,
  getDepositExchangeRate,
} from "@/services/deposit.services";
import type { DepositExchangeRateParams } from "@/services/deposit.services";

export function useDepositExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: DepositExchangeRateParams) {
  const normalizedFromCurrency = fromCurrency.trim().toUpperCase();
  const normalizedToCurrency = toCurrency.trim().toUpperCase();

  return useQuery({
    queryKey: [
      "deposit-exchange-rate",
      normalizedFromCurrency,
      normalizedToCurrency,
      paymentMethod,
    ],
    queryFn: () =>
      getDepositExchangeRate({
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
        paymentMethod,
      }),
    enabled: Boolean(normalizedFromCurrency && normalizedToCurrency),
    gcTime: 0,
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
