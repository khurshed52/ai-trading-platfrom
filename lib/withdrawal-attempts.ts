import type {
  PendingWithdrawalAttempt,
  WithdrawRequest,
} from "@/types/withdrawal";

const STORAGE_PREFIX = "tradepro:pending-withdrawals";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function isWithdrawRequest(value: unknown): value is WithdrawRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<WithdrawRequest>;
  return (
    typeof request.accountNumber === "string" &&
    typeof request.amount === "number" &&
    Number.isFinite(request.amount) &&
    request.amount > 0 &&
    typeof request.payoutCurrency === "string"
  );
}

function isPendingAttempt(value: unknown): value is PendingWithdrawalAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Partial<PendingWithdrawalAttempt>;
  return (
    typeof attempt.idempotencyKey === "string" &&
    typeof attempt.createdAt === "string" &&
    (attempt.state === "pending" ||
      attempt.state === "uncertain" ||
      attempt.state === "conflict") &&
    isWithdrawRequest(attempt.requestBody)
  );
}

export function loadPendingWithdrawal(userId: string) {
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

export function savePendingWithdrawal(
  userId: string,
  attempt: PendingWithdrawalAttempt,
) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(attempt));
  } catch {
    // The in-memory recovery state remains available when storage is blocked.
  }
}

export function removePendingWithdrawal(userId: string) {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
