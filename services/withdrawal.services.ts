import { internalApiFetch } from "@/lib/api";
import type {
  WithdrawalResponse,
  WithdrawFundsParams,
} from "@/types/withdrawal";

export function withdrawFunds({
  payload,
  idempotencyKey,
}: WithdrawFundsParams) {
  return internalApiFetch<WithdrawalResponse>("/api/backend/funds/withdraw", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}
