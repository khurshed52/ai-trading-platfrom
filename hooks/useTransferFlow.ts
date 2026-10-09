"use client";

import { useCallback, useRef, useState } from "react";
import { App } from "antd";
import { useQueryClient } from "@tanstack/react-query";

import { useTransferFunds } from "@/hooks/useTransfer";
import {
  isIdempotencyConflict,
  isUncertainDepositError,
} from "@/lib/deposit-attempts";
import {
  loadPendingTransfer,
  removePendingTransfer,
  savePendingTransfer,
} from "@/lib/transfer-attempts";
import type {
  PendingTransferAttempt,
  TransferAttempt,
  TransferRequest,
  TransferResponse,
} from "@/types/transfer";

export function useTransferFlow(userId: string | undefined) {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const mutation = useTransferFunds();
  const submissionGuard = useRef(false);
  const [success, setSuccess] = useState<TransferResponse | null>(null);
  const [recoverable, setRecoverable] = useState<
    PendingTransferAttempt | null | undefined
  >(undefined);
  const stored = userId ? loadPendingTransfer(userId) : null;
  const recoverableAttempt = recoverable === undefined ? stored : recoverable;

  const execute = useCallback(
    (attempt: TransferAttempt) => {
      if (submissionGuard.current) return;
      submissionGuard.current = true;
      const pending: PendingTransferAttempt = { ...attempt, state: "pending" };
      if (userId) savePendingTransfer(userId, pending);
      setRecoverable(pending);

      mutation.mutate(
        { payload: attempt.requestBody, idempotencyKey: attempt.idempotencyKey },
        {
          onSuccess: (response) => {
            if (userId) removePendingTransfer(userId);
            setRecoverable(null);
            setSuccess(response.data);
            void queryClient.invalidateQueries({ queryKey: ["funds-transactions"] });
            void queryClient.invalidateQueries({ queryKey: ["trading-accounts"] });
          },
          onError: (error) => {
            if (isIdempotencyConflict(error)) {
              const conflict = { ...pending, state: "conflict" as const };
              if (userId) savePendingTransfer(userId, conflict);
              setRecoverable(conflict);
              message.warning(
                "This transfer conflicts with an existing attempt. The original request has been preserved.",
              );
              return;
            }
            if (isUncertainDepositError(error)) {
              const uncertain = { ...pending, state: "uncertain" as const };
              if (userId) savePendingTransfer(userId, uncertain);
              setRecoverable(uncertain);
              message.warning(
                "The transfer result is uncertain. Retry the original attempt with the same idempotency key.",
              );
              return;
            }
            if (userId) removePendingTransfer(userId);
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
    (requestBody: TransferRequest) => {
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
    if (userId) removePendingTransfer(userId);
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
