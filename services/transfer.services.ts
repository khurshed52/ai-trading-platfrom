import { internalApiFetch } from "@/lib/api";

export type TransferExchangeRateParams = {
  fromCurrency: string;
  toCurrency: string;
  paymentMethod?: number;
};

export function getTransferExchangeRate({
  fromCurrency,
  toCurrency,
  paymentMethod = 0,
}: TransferExchangeRateParams) {
  const searchParams = new URLSearchParams({
    FromCurrency: fromCurrency.trim().toUpperCase(),
    ToCurrency: toCurrency.trim().toUpperCase(),
    TransactionType: "transfer",
    PaymentMethod: String(paymentMethod),
  });

  return internalApiFetch<number>(
    `/api/backend/Miscellaneous/GetExchangeRate?${searchParams.toString()}`,
    { method: "GET" },
  );
}
