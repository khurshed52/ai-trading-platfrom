import { SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Select } from "antd";

import {
  ReportDateRangePicker,
  ReportFilterField,
} from "./report-filter-controls";
import type { TradingAccount } from "@/types/accounts";
import type {
  TransferReportFilters,
  TransferReportStatus,
} from "@/types/reports";

type TransferReportFiltersProps = {
  value: TransferReportFilters;
  accounts: TradingAccount[];
  accountsLoading: boolean;
  error: string | null;
  onChange: (value: TransferReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

const statusOptions: Array<{
  value: TransferReportStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

function createAccountOptions(accounts: TradingAccount[]) {
  return accounts.map((account) => ({
    value: account.accountNumber,
    label: `${account.accountNumber} · ${account.platform}`,
  }));
}

export function TransferReportFiltersBar({
  value,
  accounts,
  accountsLoading,
  error,
  onChange,
  onApply,
  onReset,
}: TransferReportFiltersProps) {
  const accountOptions = createAccountOptions(accounts);

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-[1.15fr_1fr_2fr_1fr_1fr_auto_auto] 2xl:items-end">
        <ReportFilterField label="Reference">
          <Input
            aria-label="Reference"
            allowClear
            value={value.reference}
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Search reference..."
            onChange={(event) =>
              onChange({ ...value, reference: event.target.value })
            }
            onPressEnter={onApply}
            className="!h-11"
          />
        </ReportFilterField>

        <ReportFilterField label="Status">
          <Select<TransferReportStatus>
            aria-label="Status"
            allowClear
            value={value.status}
            placeholder="All Statuses"
            options={statusOptions}
            onChange={(status) => onChange({ ...value, status })}
            className="!h-11 w-full"
          />
        </ReportFilterField>

        <ReportFilterField label="Date Range">
          <ReportDateRangePicker
            dateFrom={value.dateFrom}
            dateTo={value.dateTo}
            onChange={(dateFrom, dateTo) =>
              onChange({ ...value, dateFrom, dateTo })
            }
          />
        </ReportFilterField>

        <ReportFilterField label="Source Account">
          <Select<string>
            aria-label="Source Account"
            allowClear
            showSearch
            value={value.sourceAccount}
            loading={accountsLoading}
            placeholder="All Accounts"
            optionFilterProp="label"
            options={accountOptions}
            onChange={(sourceAccount) =>
              onChange({ ...value, sourceAccount })
            }
            className="!h-11 w-full"
          />
        </ReportFilterField>

        <ReportFilterField label="Destination Account">
          <Select<string>
            aria-label="Destination Account"
            allowClear
            showSearch
            value={value.destinationAccount}
            loading={accountsLoading}
            placeholder="All Accounts"
            optionFilterProp="label"
            options={accountOptions}
            onChange={(destinationAccount) =>
              onChange({ ...value, destinationAccount })
            }
            className="!h-11 w-full"
          />
        </ReportFilterField>

        <Button onClick={onReset} className="!h-11 !rounded-xl !px-7">
          Reset
        </Button>
        <Button
          type="primary"
          onClick={onApply}
          className="!h-11 !rounded-xl !px-7"
        >
          Apply Filters
        </Button>
      </div>

      {error ? (
        <Alert message={error} type="error" showIcon className="!mt-4" />
      ) : null}
    </section>
  );
}
