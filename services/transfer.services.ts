import { internalApiFetch } from "@/lib/api";
import type { TransferFundsParams, TransferResponse } from "@/types/transfer";

export function transferFunds({ payload, idempotencyKey }: TransferFundsParams) {
  return internalApiFetch<TransferResponse>("/api/backend/funds/transfer", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}
