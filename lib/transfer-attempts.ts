import type { PendingTransferAttempt, TransferRequest } from "@/types/transfer";

const STORAGE_PREFIX = "tradepro:pending-transfers";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function isTransferRequest(value: unknown): value is TransferRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<TransferRequest>;
  return (
    typeof request.sourceAccountNumber === "string" &&
    typeof request.destinationAccountNumber === "string" &&
    request.sourceAccountNumber !== request.destinationAccountNumber &&
    typeof request.amount === "number" &&
    Number.isFinite(request.amount) &&
    request.amount > 0
  );
}

function isPendingAttempt(value: unknown): value is PendingTransferAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<PendingTransferAttempt>;
  return (
    typeof attempt.idempotencyKey === "string" &&
    typeof attempt.createdAt === "string" &&
    (attempt.state === "pending" ||
      attempt.state === "uncertain" ||
      attempt.state === "conflict") &&
    isTransferRequest(attempt.requestBody)
  );
}

export function loadPendingTransfer(userId: string) {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const stored = window.localStorage.getItem(storageKey(userId));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as unknown;
    return isPendingAttempt(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePendingTransfer(
  userId: string,
  attempt: PendingTransferAttempt,
) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(attempt));
  } catch {
    // In-memory recovery remains available when browser storage is blocked.
  }
}

export function removePendingTransfer(userId: string) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
