"use client";

import { Button, Result, Skeleton } from "antd";
import { useState } from "react";

import { TransactionFiltersBar } from "@/components/funds/history/transaction-filters";
import { TransactionsTable } from "@/components/funds/history/transactions-table";
import { useFundsTransactions } from "@/hooks/useTransactions";
import type { TransactionFilters } from "@/types/transactions";

const DEFAULT_PAGE_SIZE = 10;
const emptyFilters: TransactionFilters = {};

export function FundsHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [draftFilters, setDraftFilters] = useState<TransactionFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({});
  const transactionsQuery = useFundsTransactions({
    page,
    pageSize,
    filters: appliedFilters,
  });
  const pagination = transactionsQuery.data?.data;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950 sm:text-2xl">
          Funds History
        </h1>
      </header>
      <TransactionFiltersBar
        value={draftFilters}
        onChange={setDraftFilters}
        onApply={() => {
          setAppliedFilters({
            ...draftFilters,
            reference: draftFilters.reference?.trim() || undefined,
          });
          setPage(1);
        }}
        onReset={() => {
          setDraftFilters(emptyFilters);
          setAppliedFilters(emptyFilters);
          setPage(1);
        }}
      />

      {transactionsQuery.isError ? (
        <div className="rounded-2xl border border-slate-100 bg-white">
          <Result
            status="error"
            title="We couldn’t load your transactions"
            subTitle={transactionsQuery.error.message}
            extra={
              <Button type="primary" onClick={() => transactionsQuery.refetch()}>
                Try Again
              </Button>
            }
          />
        </div>
      ) : pagination ? (
        <TransactionsTable
          pagination={pagination}
          loading={transactionsQuery.isFetching}
          onPageChange={(nextPage, nextPageSize) => {
            setPage(nextPageSize === pageSize ? nextPage : 1);
            setPageSize(nextPageSize);
          }}
        />
      ) : (
        <Skeleton active paragraph={{ rows: 6 }} />
      )}
    </div>
  );
}
