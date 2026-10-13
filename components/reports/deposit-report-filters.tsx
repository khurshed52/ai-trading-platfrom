import { SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Select } from "antd";

import {
  ReportDateRangePicker,
  ReportFilterField,
} from "./report-filter-controls";
import type { TradingAccount } from "@/types/accounts";
import type {
  DepositPaymentMethod,
  DepositReportFilters,
  DepositReportStatus,
} from "@/types/reports";

type DepositReportFiltersProps = {
  value: DepositReportFilters;
  accounts: TradingAccount[];
  accountsLoading: boolean;
  error: string | null;
  onChange: (value: DepositReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

const statusOptions: Array<{
  value: DepositReportStatus;
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const paymentMethodOptions: Array<{
  value: DepositPaymentMethod;
  label: string;
}> = [
  { value: "STRIPE", label: "Stripe" },
  { value: "MOCK", label: "Mock" },
  { value: "COINPAYMENTS", label: "CoinPayments" },
];

export function DepositReportFiltersBar({
  value,
  accounts,
  accountsLoading,
  error,
  onChange,
  onApply,
  onReset,
}: DepositReportFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-[1.15fr_repeat(5,minmax(150px,1fr))_auto_auto] 2xl:items-end">
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
          <Select<DepositReportStatus>
            aria-label="Status"
            allowClear
            value={value.status}
            placeholder="All Statuses"
            options={statusOptions}
            onChange={(status) => onChange({ ...value, status })}
            className="!h-11 w-full"
          />
        </ReportFilterField>

        <div className="md:col-span-2 2xl:col-span-2">
          <ReportFilterField label="Date Range">
            <ReportDateRangePicker
              dateFrom={value.dateFrom}
              dateTo={value.dateTo}
              onChange={(dateFrom, dateTo) =>
                onChange({ ...value, dateFrom, dateTo })
              }
            />
          </ReportFilterField>
        </div>

        <ReportFilterField label="Trading Account">
          <Select<string>
            aria-label="Trading Account"
            allowClear
            showSearch
            value={value.tradingAccount}
            loading={accountsLoading}
            placeholder="All Accounts"
            optionFilterProp="label"
            options={accounts.map((account) => ({
              value: account.accountNumber,
              label: `${account.accountNumber} · ${account.platform}`,
            }))}
            onChange={(tradingAccount) =>
              onChange({ ...value, tradingAccount })
            }
            className="!h-11 w-full"
          />
        </ReportFilterField>

        <ReportFilterField label="Payment Method">
          <Select<DepositPaymentMethod>
            aria-label="Payment Method"
            allowClear
            value={value.paymentMethod}
            placeholder="All Methods"
            options={paymentMethodOptions}
            onChange={(paymentMethod) =>
              onChange({ ...value, paymentMethod })
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
