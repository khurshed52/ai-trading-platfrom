"use client";

import { Button, Result, Skeleton } from "antd";

import { WithdrawalReportFiltersBar } from "./withdrawal-report-filters";
import { WithdrawalReportTable } from "./withdrawal-report-table";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useWithdrawalReport } from "@/hooks/useReport";

export function WithdrawalReportPage() {
  const report = useWithdrawalReport();
  const accountsQuery = useAllTradingAccounts();
  const pagination = report.data?.data;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">
          Withdrawal Report
        </h1>
        <p className="mb-0 mt-1 text-sm text-slate-500">
          View and filter your withdrawal transactions.
        </p>
      </header>

      <WithdrawalReportFiltersBar
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
            title="We couldn’t load your withdrawal report"
            subTitle={report.error.message || "Please try again."}
            extra={
              <Button type="primary" onClick={() => report.refetch()}>
                Retry
              </Button>
            }
          />
        </section>
      ) : pagination ? (
        <WithdrawalReportTable
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
