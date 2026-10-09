"use client";

import { useCallback, useRef, useState } from "react";
import { App } from "antd";
import { useQueryClient } from "@tanstack/react-query";

import { useWithdrawFunds } from "@/hooks/useWithdrawal";
import {
  isIdempotencyConflict,
  isUncertainDepositError,
} from "@/lib/deposit-attempts";
import {
  loadPendingWithdrawal,
  removePendingWithdrawal,
  savePendingWithdrawal,
} from "@/lib/withdrawal-attempts";
import type {
  PendingWithdrawalAttempt,
  WithdrawalAttempt,
  WithdrawalResponse,
  WithdrawRequest,
} from "@/types/withdrawal";

export function useWithdrawalFlow(userId: string | undefined) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const mutation = useWithdrawFunds();
  const submissionGuard = useRef(false);
  const [success, setSuccess] = useState<WithdrawalResponse | null>(null);
  const [recoverable, setRecoverable] = useState<
    PendingWithdrawalAttempt | null | undefined
  >(undefined);
  const stored = userId ? loadPendingWithdrawal(userId) : null;
  const recoverableAttempt = recoverable === undefined ? stored : recoverable;

  const execute = useCallback(
    (attempt: WithdrawalAttempt) => {
      if (submissionGuard.current) return;
      submissionGuard.current = true;

      const pendingAttempt: PendingWithdrawalAttempt = {
        ...attempt,
        state: "pending",
      };
      if (userId) savePendingWithdrawal(userId, pendingAttempt);
      setRecoverable(pendingAttempt);

      mutation.mutate(
        {
          payload: attempt.requestBody,
          idempotencyKey: attempt.idempotencyKey,
        },
        {
          onSuccess: (response) => {
            if (userId) removePendingWithdrawal(userId);
            setRecoverable(null);
            setSuccess(response.data);
            void queryClient.invalidateQueries({ queryKey: ["funds-transactions"] });
            void queryClient.invalidateQueries({ queryKey: ["trading-accounts"] });
          },
          onError: (error) => {
            if (isIdempotencyConflict(error)) {
              const conflict = { ...pendingAttempt, state: "conflict" as const };
              if (userId) savePendingWithdrawal(userId, conflict);
              setRecoverable(conflict);
              message.warning(
                "This withdrawal conflicts with an existing attempt. Retry only with the preserved request reference.",
              );
              return;
            }

            if (isUncertainDepositError(error)) {
              const uncertain = { ...pendingAttempt, state: "uncertain" as const };
              if (userId) savePendingWithdrawal(userId, uncertain);
              setRecoverable(uncertain);
              message.warning(
                "The withdrawal result is uncertain. Retry the original attempt with the same idempotency key.",
              );
              return;
            }

            if (userId) removePendingWithdrawal(userId);
            setRecoverable(null);
          },
          onSettled: () => {
            submissionGuard.current = false;
          },
        },
      );
    },
    [message, mutation, queryClient, userId],
  );

  const start = useCallback(
    (requestBody: WithdrawRequest) => {
      if (submissionGuard.current || recoverableAttempt) return;
      execute({
        idempotencyKey: crypto.randomUUID(),
        requestBody: Object.freeze({ ...requestBody }),
        createdAt: new Date().toISOString(),
      });
    },
    [execute, recoverableAttempt],
  );

  const retry = useCallback(() => {
    if (recoverableAttempt) execute(recoverableAttempt);
  }, [execute, recoverableAttempt]);

  const startNew = useCallback(() => {
    if (userId) removePendingWithdrawal(userId);
    setRecoverable(null);
  }, [userId]);

  return {
    isPending: mutation.isPending,
    recoverableAttempt,
    success,
    start,
    retry,
    startNew,
    closeSuccess: () => setSuccess(null),
  };
}
