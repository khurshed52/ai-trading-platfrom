import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createBankTransferWithdrawal,
  createCreditDebitWithdrawal,
  createSkrillWithdrawal,
  createUsdtWithdrawal,
  getWithdrawalExchangeRate,
} from "@/services/withdrawal.services";
import type { WithdrawalExchangeRateParams } from "@/services/withdrawal.services";

export function useWithdrawalExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: WithdrawalExchangeRateParams) {
  const normalizedFromCurrency = fromCurrency.trim().toUpperCase();
  const normalizedToCurrency = toCurrency.trim().toUpperCase();

  return useQuery({
    queryKey: [
      "withdrawal-exchange-rate",
      normalizedFromCurrency,
      normalizedToCurrency,
      paymentMethod,
    ],
    queryFn: () =>
      getWithdrawalExchangeRate({
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
        paymentMethod,
      }),
    enabled: Boolean(normalizedFromCurrency && normalizedToCurrency),
    gcTime: 0,
  });
}

export function useBankTransferWithdrawal() {
  return useMutation({ mutationFn: createBankTransferWithdrawal });
}

export function useCreditDebitWithdrawal() {
  return useMutation({ mutationFn: createCreditDebitWithdrawal });
}

export function useSkrillWithdrawal() {
  return useMutation({ mutationFn: createSkrillWithdrawal });
}

export function useUsdtWithdrawal() {
  return useMutation({ mutationFn: createUsdtWithdrawal });
}
