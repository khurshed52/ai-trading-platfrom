import { ApiRequestError } from "@/lib/api";
import type {
  PendingDepositAttempt,
  StripeDepositPayload,
} from "@/types/deposit";

const STORAGE_PREFIX = "tradepro:pending-stripe-deposits";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function isStripePayload(value: unknown): value is StripeDepositPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<StripeDepositPayload>;
  return (
    typeof payload.accountNumber === "string" &&
    typeof payload.amount === "number" &&
    Number.isFinite(payload.amount) &&
    payload.amount > 0 &&
    typeof payload.currency === "string" &&
    payload.provider === "STRIPE"
  );
}

function isPendingAttempt(value: unknown): value is PendingDepositAttempt {
  if (!value || typeof value !== "object") return false;

  const attempt = value as Partial<PendingDepositAttempt>;
  return (
    typeof attempt.idempotencyKey === "string" &&
    typeof attempt.createdAt === "string" &&
    (attempt.state === "uncertain" || attempt.state === "initiated") &&
    isStripePayload(attempt.requestBody)
  );
}

export function loadPendingDepositAttempts(
  userId: string,
): PendingDepositAttempt[] {
  if (typeof window === "undefined" || !userId) return [];

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(userId));
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue)
      ? parsedValue.filter(isPendingAttempt)
      : [];
  } catch {
    return [];
  }
}

export function savePendingDepositAttempt(
  userId: string,
  attempt: PendingDepositAttempt,
) {
  if (typeof window === "undefined" || !userId) return;

  try {
    const existingAttempts = loadPendingDepositAttempts(userId);
    const nextAttempts = [
      attempt,
      ...existingAttempts.filter(
        (item) => item.idempotencyKey !== attempt.idempotencyKey,
      ),
    ];

    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(nextAttempts),
    );
  } catch {
    // The in-memory recovery option remains available when storage is blocked.
  }
}

export function removePendingDepositAttempt(
  userId: string,
  idempotencyKey: string,
) {
  if (typeof window === "undefined" || !userId) return;

  try {
    const nextAttempts = loadPendingDepositAttempts(userId).filter(
      (item) => item.idempotencyKey !== idempotencyKey,
    );

    if (nextAttempts.length === 0) {
      window.localStorage.removeItem(getStorageKey(userId));
      return;
    }

    window.localStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(nextAttempts),
    );
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

export function isUncertainDepositError(error: unknown) {
  if (!(error instanceof ApiRequestError)) return true;
  return (
    error.httpStatus >= 500 ||
    (error.apiStatusCode !== undefined && error.apiStatusCode >= 500)
  );
}

export function isIdempotencyConflict(error: unknown) {
  return (
    error instanceof ApiRequestError &&
    (error.httpStatus === 409 || error.apiStatusCode === 409)
  );
}

export function isValidStripeCheckoutUrl(
  value: string | null | undefined,
): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}
