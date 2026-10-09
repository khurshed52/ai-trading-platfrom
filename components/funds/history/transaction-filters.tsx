import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select } from "antd";

import type {
  TransactionFilters,
  TransactionStatus,
  TransactionType,
} from "@/types/transactions";

type TransactionFiltersProps = {
  value: TransactionFilters;
  onChange: (value: TransactionFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

export function TransactionFiltersBar({
  value,
  onChange,
  onApply,
  onReset,
}: TransactionFiltersProps) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.15fr_auto_auto] xl:items-end">
            <FilterField label="Reference">
        <Input
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
      </FilterField>
      <FilterField label="Type">
        <Select<TransactionType | undefined>
          allowClear
          value={value.type}
          placeholder="All Types"
          onChange={(type) => onChange({ ...value, type })}
          options={[
            { value: "DEPOSIT", label: "Deposit" },
            { value: "WITHDRAWAL", label: "Withdrawal" },
            { value: "TRANSFER", label: "Transfer" },
          ]}
          className="!h-11 w-full"
        />
      </FilterField>
      <FilterField label="Status">
        <Select<TransactionStatus | undefined>
          allowClear
          value={value.status}
          placeholder="All Statuses"
          onChange={(status) => onChange({ ...value, status })}
          options={[
            { value: "PENDING", label: "Pending" },
            { value: "COMPLETED", label: "Completed" },
            { value: "FAILED", label: "Failed" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          className="!h-11 w-full"
        />
      </FilterField>
      <FilterField label="Currency">
        <Select
          allowClear
          value={value.currency}
          placeholder="All Currencies"
          onChange={(currency) => onChange({ ...value, currency })}
          options={["USD", "EUR", "GBP", "AED", "INR"].map((currency) => ({
            value: currency,
            label: currency,
          }))}
          className="!h-11 w-full"
        />
      </FilterField>
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
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
