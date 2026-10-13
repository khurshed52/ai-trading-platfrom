import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

type ReportFilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

type ReportDateRangePickerProps = {
  dateFrom?: string;
  dateTo?: string;
  onChange: (dateFrom?: string, dateTo?: string) => void;
};

export function ReportFilterField({
  label,
  children,
}: ReportFilterFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

export function ReportDateRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: ReportDateRangePickerProps) {
  const value: [Dayjs, Dayjs] | null =
    dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null;

  return (
    <DatePicker.RangePicker
      aria-label="Date Range"
      allowClear
      value={value}
      format="DD/MM/YYYY"
      placeholder={["From date", "To date"]}
      onChange={(dates) =>
        onChange(
          dates?.[0]?.format("YYYY-MM-DD"),
          dates?.[1]?.format("YYYY-MM-DD"),
        )
      }
      className="!h-11 w-full"
    />
  );
}
