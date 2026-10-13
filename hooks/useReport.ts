"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@/lib/api";
import {
  getDepositReport,
  getTransferReport,
  getWithdrawalReport,
} from "@/services/report.services";
import type {
  DepositReportFilters,
  DepositReportPagination,
  TransferReportFilters,
  TransferReportPagination,
  WithdrawalReportFilters,
  WithdrawalReportPagination,
} from "@/types/reports";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_DEPOSIT_FILTERS: DepositReportFilters = {};
const EMPTY_WITHDRAWAL_FILTERS: WithdrawalReportFilters = {};
const EMPTY_TRANSFER_FILTERS: TransferReportFilters = {};

function normalizeDepositFilters(
  filters: DepositReportFilters,
): DepositReportFilters {
  const reference = filters.reference?.trim();

  return {
    ...(reference ? { reference } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.tradingAccount
      ? { tradingAccount: filters.tradingAccount }
      : {}),
    ...(filters.paymentMethod
      ? { paymentMethod: filters.paymentMethod }
      : {}),
  };
}

function normalizeWithdrawalFilters(
  filters: WithdrawalReportFilters,
): WithdrawalReportFilters {
  const reference = filters.reference?.trim();

  return {
    ...(reference ? { reference } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.tradingAccount
      ? { tradingAccount: filters.tradingAccount }
      : {}),
    ...(filters.withdrawalApprovalStatus
      ? { withdrawalApprovalStatus: filters.withdrawalApprovalStatus }
      : {}),
    ...(filters.payoutMethod ? { payoutMethod: filters.payoutMethod } : {}),
  };
}

function normalizeTransferFilters(
  filters: TransferReportFilters,
): TransferReportFilters {
  const reference = filters.reference?.trim();
  const sourceAccount = filters.sourceAccount?.trim();
  const destinationAccount = filters.destinationAccount?.trim();

  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(reference ? { reference } : {}),
    ...(sourceAccount ? { sourceAccount } : {}),
    ...(destinationAccount ? { destinationAccount } : {}),
  };
}

function filtersMatch<TFilters>(first: TFilters, second: TFilters) {
  return JSON.stringify(first) === JSON.stringify(second);
}

type DateRangeFilters = {
  dateFrom?: string;
  dateTo?: string;
};

type UsePaginatedReportOptions<TFilters, TPagination> = {
  queryName: string;
  emptyFilters: TFilters;
  normalizeFilters: (filters: TFilters) => TFilters;
  fetchReport: (request: {
    page: number;
    pageSize: number;
    filters: TFilters;
  }) => Promise<ApiResponse<TPagination>>;
};

function usePaginatedReport<
  TFilters extends DateRangeFilters,
  TPagination,
>({
  queryName,
  emptyFilters,
  normalizeFilters,
  fetchReport,
}: UsePaginatedReportOptions<TFilters, TPagination>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [draftFilters, setDraftFiltersState] =
    useState<TFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<TFilters>(emptyFilters);
  const [filterError, setFilterError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["reports", queryName, page, pageSize, appliedFilters],
    queryFn: () =>
      fetchReport({ page, pageSize, filters: appliedFilters }),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    if (
      draftFilters.dateFrom &&
      draftFilters.dateTo &&
      draftFilters.dateFrom > draftFilters.dateTo
    ) {
      setFilterError("From Date cannot be later than To Date.");
      return false;
    }

    const nextFilters = normalizeFilters(draftFilters);
    setFilterError(null);

    if (page === 1 && filtersMatch(nextFilters, appliedFilters)) {
      void query.refetch();
    } else {
      setAppliedFilters(nextFilters);
      setPage(1);
    }

    return true;
  }

  function setDraftFilters(filters: TFilters) {
    setDraftFiltersState(filters);
    setFilterError(null);
  }

  function resetFilters() {
    setDraftFiltersState(emptyFilters);
    setFilterError(null);

    if (page === 1 && filtersMatch(appliedFilters, emptyFilters)) {
      void query.refetch();
    } else {
      setAppliedFilters(emptyFilters);
      setPage(1);
    }
  }

  function changePage(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
      return;
    }

    setPage(nextPage);
  }

  return {
    ...query,
    page,
    pageSize,
    draftFilters,
    appliedFilters,
    filterError,
    hasActiveFilters: Object.keys(appliedFilters).length > 0,
    setDraftFilters,
    applyFilters,
    resetFilters,
    changePage,
  };
}

export function useDepositReport() {
  return usePaginatedReport<DepositReportFilters, DepositReportPagination>({
    queryName: "deposits",
    emptyFilters: EMPTY_DEPOSIT_FILTERS,
    normalizeFilters: normalizeDepositFilters,
    fetchReport: getDepositReport,
  });
}

export function useWithdrawalReport() {
  return usePaginatedReport<
    WithdrawalReportFilters,
    WithdrawalReportPagination
  >({
    queryName: "withdrawals",
    emptyFilters: EMPTY_WITHDRAWAL_FILTERS,
    normalizeFilters: normalizeWithdrawalFilters,
    fetchReport: getWithdrawalReport,
  });
}

export function useTransferReport() {
  return usePaginatedReport<TransferReportFilters, TransferReportPagination>({
    queryName: "transfers",
    emptyFilters: EMPTY_TRANSFER_FILTERS,
    normalizeFilters: normalizeTransferFilters,
    fetchReport: getTransferReport,
  });
}
