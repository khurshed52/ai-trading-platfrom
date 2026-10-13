"use client";

import { Button, Result, Skeleton } from "antd";

import { TransferReportFiltersBar } from "./transfer-report-filters";
import { TransferReportTable } from "./transfer-report-table";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useTransferReport } from "@/hooks/useReport";

export function TransferReportPage() {
  const report = useTransferReport();
  const accountsQuery = useAllTradingAccounts();
  const pagination = report.data?.data;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">
          Transfer Report
        </h1>
        <p className="mb-0 mt-1 text-sm text-slate-500">
          View and filter your transfer transactions.
        </p>
      </header>

      <TransferReportFiltersBar
        value={report.draftFilters}
        accounts={accountsQuery.data?.data ?? []}
        accountsLoading={accountsQuery.isLoading}
        error={report.filterError}
        onChange={report.setDraftFilters}
        onApply={report.applyFilters}
        onReset={report.resetFilters}
      />

      {report.isError ? (
        <section className="rounded-2xl border border-slate-100 bg-white">
          <Result
            status="error"
            title="We couldn’t load your transfer report"
            subTitle={report.error.message || "Please try again."}
            extra={
              <Button type="primary" onClick={() => report.refetch()}>
                Retry
              </Button>
            }
          />
        </section>
      ) : pagination ? (
        <TransferReportTable
          pagination={pagination}
          loading={report.isFetching}
          hasActiveFilters={report.hasActiveFilters}
          onResetFilters={report.resetFilters}
          onPageChange={report.changePage}
        />
      ) : (
        <section className="rounded-2xl border border-slate-100 bg-white p-5">
          <Skeleton active paragraph={{ rows: 7 }} />
        </section>
      )}
    </div>
  );
}
