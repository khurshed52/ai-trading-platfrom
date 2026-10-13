"use client";

import { Button, Result, Skeleton } from "antd";

import { DepositReportFiltersBar } from "./deposit-report-filters";
import { DepositReportTable } from "./deposit-report-table";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useDepositReport } from "@/hooks/useReport";

export function DepositReportPage() {
  const report = useDepositReport();
  const accountsQuery = useAllTradingAccounts();
  const pagination = report.data?.data;

  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="m-0 text-2xl font-extrabold text-slate-950">
          Deposit Report
        </h1>
      </header>

      <DepositReportFiltersBar
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
            title="We couldn’t load your deposit report"
            subTitle={report.error.message || "Please try again."}
            extra={
              <Button type="primary" onClick={() => report.refetch()}>
                Retry
              </Button>
            }
          />
        </section>
      ) : pagination ? (
        <DepositReportTable
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
