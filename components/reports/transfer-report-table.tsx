"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { App, Button, Empty, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { formatReportAmount, formatReportDate } from "./report-formatters";
import type {
  TransferReportItem,
  TransferReportPagination,
  TransferReportStatus,
} from "@/types/reports";

type TransferReportTableProps = {
  pagination: TransferReportPagination;
  loading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onPageChange: (page: number, pageSize: number) => void;
};

const statusConfig: Record<
  TransferReportStatus,
  { color: string; icon: React.ReactNode }
> = {
  PENDING: { color: "warning", icon: <ClockCircleOutlined /> },
  COMPLETED: { color: "success", icon: <CheckCircleOutlined /> },
  FAILED: { color: "error", icon: <CloseCircleOutlined /> },
  REJECTED: { color: "error", icon: <CloseCircleOutlined /> },
  CANCELLED: { color: "default", icon: <CloseCircleOutlined /> },
};

export function TransferReportTable({
  pagination,
  loading,
  hasActiveFilters,
  onResetFilters,
  onPageChange,
}: TransferReportTableProps) {
  const { message } = App.useApp();
  const columns: ColumnsType<TransferReportItem> = [
    {
      title: "Reference",
      dataIndex: "reference",
      width: 250,
      render: (reference: string) => (
        <span className="flex items-center gap-2 font-medium text-slate-800">
          <span>{reference}</span>
          <Button
            type="text"
            size="small"
            aria-label={`Copy reference ${reference}`}
            icon={<CopyOutlined />}
            onClick={() => {
              void navigator.clipboard
                .writeText(reference)
                .then(() => message.success("Reference copied"))
                .catch(() => message.error("Could not copy the reference"));
            }}
          />
        </span>
      ),
    },
    {
      title: "Source Account",
      dataIndex: "sourceAccount",
      width: 170,
      render: (sourceAccount: string | null) => (
        <strong className="text-slate-900">{sourceAccount ?? "—"}</strong>
      ),
    },
    {
      title: "Destination Account",
      dataIndex: "destinationAccount",
      width: 190,
      render: (destinationAccount: string | null) => (
        <strong className="text-slate-900">
          {destinationAccount ?? "—"}
        </strong>
      ),
    },
    {
      title: "Amount",
      width: 155,
      render: (_, transaction) => (
        <strong className="text-slate-900">
          {formatReportAmount(transaction.amount, transaction.currency)}
        </strong>
      ),
    },
    {
      title: "Received Amount",
      width: 175,
      render: (_, transaction) => (
        <strong className="text-slate-900">
          {formatReportAmount(
            transaction.convertedAmount,
            transaction.convertedCurrency,
          )}
        </strong>
      ),
    },
    {
      title: "Exchange Rate",
      dataIndex: "exchangeRate",
      width: 165,
      render: (exchangeRate: string | null, transaction) =>
        exchangeRate ? (
          <span>
            <strong className="block text-slate-900">{exchangeRate}</strong>
            {transaction.exchangeRateSource ? (
              <small className="text-slate-500">
                {transaction.exchangeRateSource}
              </small>
            ) : null}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 145,
      render: (status: TransferReportStatus) => (
        <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 165,
      render: (createdAt: string) => {
        const formatted = formatReportDate(createdAt);
        return (
          <span>
            <strong className="block text-slate-900">{formatted.date}</strong>
            <small className="text-slate-500">{formatted.time}</small>
          </span>
        );
      },
    },
  ];
  const firstItem =
    pagination.dataCount === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const lastItem = Math.min(
    pagination.page * pagination.pageSize,
    pagination.dataCount,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={pagination.pageData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1415 }}
        locale={{
          emptyText: (
            <Empty description="No transfer transactions found.">
              {hasActiveFilters ? (
                <Button onClick={onResetFilters}>Reset Filters</Button>
              ) : null}
            </Empty>
          ),
        }}
      />
      {pagination.dataCount > 0 ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Showing {firstItem} to {lastItem} of {pagination.dataCount}{" "}
            transactions
          </span>
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.dataCount}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={onPageChange}
          />
        </div>
      ) : null}
    </section>
  );
}
