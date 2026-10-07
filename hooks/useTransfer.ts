import { useQuery } from "@tanstack/react-query";

import {
  getTransferExchangeRate,
  type TransferExchangeRateParams,
} from "@/services/transfer.services";

export function useTransferExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: TransferExchangeRateParams) {
  const normalizedFromCurrency = fromCurrency.trim().toUpperCase();
  const normalizedToCurrency = toCurrency.trim().toUpperCase();

  return useQuery({
    queryKey: [
      "transfer-exchange-rate",
      normalizedFromCurrency,
      normalizedToCurrency,
      paymentMethod,
    ],
    queryFn: () =>
      getTransferExchangeRate({
        fromCurrency: normalizedFromCurrency,
        toCurrency: normalizedToCurrency,
        paymentMethod,
      }),
    enabled: Boolean(
      normalizedFromCurrency &&
        normalizedToCurrency &&
        normalizedFromCurrency !== normalizedToCurrency,
    ),
    gcTime: 0,
  });
}
