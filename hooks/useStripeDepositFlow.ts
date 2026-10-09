"use client";

import { useCallback, useRef, useState } from "react";
import { App } from "antd";

import { useInitiateStripeDeposit } from "@/hooks/useDeposit";
import {
  isIdempotencyConflict,
  isUncertainDepositError,
  isValidStripeCheckoutUrl,
  loadPendingDepositAttempts,
  removePendingDepositAttempt,
  savePendingDepositAttempt,
} from "@/lib/deposit-attempts";
import type {
  PendingDepositAttempt,
  StripeDepositAttempt,
  StripeDepositPayload,
} from "@/types/deposit";

export function useStripeDepositFlow(userId: string | undefined) {
  const { message } = App.useApp();
  const depositMutation = useInitiateStripeDeposit();
  const submissionGuard = useRef(false);
  const [recoverableAttempt, setRecoverableAttempt] =
    useState<PendingDepositAttempt | null | undefined>(undefined);
  const storedAttempt = userId
    ? loadPendingDepositAttempts(userId)[0] ?? null
    : null;
  const displayedRecoverableAttempt =
    recoverableAttempt === undefined ? storedAttempt : recoverableAttempt;

  const executeAttempt = useCallback(
    (attempt: StripeDepositAttempt) => {
      if (submissionGuard.current) return;

      submissionGuard.current = true;
      depositMutation.mutate(
        {
          payload: attempt.requestBody,
          idempotencyKey: attempt.idempotencyKey,
        },
        {
          onSuccess: (response) => {
            const checkoutUrl = response.data.payment?.checkoutUrl;

            if (!isValidStripeCheckoutUrl(checkoutUrl)) {
              const recoveryAttempt: PendingDepositAttempt = {
                ...attempt,
                state: "initiated",
                transactionId: response.data.transactionId,
                reference: response.data.reference,
              };

              if (userId) {
                savePendingDepositAttempt(userId, recoveryAttempt);
              }
              setRecoverableAttempt(recoveryAttempt);
              message.error(
                "The deposit was initiated, but Stripe Checkout is unavailable. Retry this same attempt instead of creating a duplicate.",
              );
              return;
            }

            if (userId) {
              removePendingDepositAttempt(userId, attempt.idempotencyKey);
            }
            setRecoverableAttempt(null);
            window.location.assign(checkoutUrl);
          },
          onError: (error) => {
            const recoveryAttempt: PendingDepositAttempt = {
              ...attempt,
              state: "uncertain",
            };

            if (isUncertainDepositError(error)) {
              if (userId) {
                savePendingDepositAttempt(userId, recoveryAttempt);
              }
              setRecoverableAttempt(recoveryAttempt);
              message.warning(
                "The deposit result is uncertain. Use Retry original attempt to safely check it with the same reference.",
              );
              return;
            }

            if (isIdempotencyConflict(error)) {
              setRecoverableAttempt({
                ...recoveryAttempt,
                state: "conflict",
              });
              message.warning(
                "This request conflicts with an existing deposit attempt. The same reference has been preserved.",
              );
            }
          },
          onSettled: () => {
            submissionGuard.current = false;
          },
        },
      );
    },
    [depositMutation, message, userId],
  );

  const startNewAttempt = useCallback(
    (payload: StripeDepositPayload) => {
      if (submissionGuard.current) return;

      const frozenRequestBody = Object.freeze({ ...payload });
      const attempt: StripeDepositAttempt = {
        idempotencyKey: crypto.randomUUID(),
        requestBody: frozenRequestBody,
        createdAt: new Date().toISOString(),
      };

      executeAttempt(attempt);
    },
    [executeAttempt],
  );

  const retryRecoverableAttempt = useCallback(() => {
    if (displayedRecoverableAttempt) {
      executeAttempt(displayedRecoverableAttempt);
    }
  }, [displayedRecoverableAttempt, executeAttempt]);

  const dismissRecoverableAttempt = useCallback(() => {
    if (userId && displayedRecoverableAttempt) {
      removePendingDepositAttempt(
        userId,
        displayedRecoverableAttempt.idempotencyKey,
      );
      setRecoverableAttempt(loadPendingDepositAttempts(userId)[0] ?? null);
      return;
    }
    setRecoverableAttempt(null);
  }, [displayedRecoverableAttempt, userId]);

  return {
    isPending: depositMutation.isPending,
    recoverableAttempt: displayedRecoverableAttempt,
    startNewAttempt,
    retryRecoverableAttempt,
    dismissRecoverableAttempt,
  };
}
