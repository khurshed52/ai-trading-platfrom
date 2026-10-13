"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Empty, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { formatReportAmount, formatReportDate } from "./report-formatters";
import type {
  WithdrawalApprovalStatus,
  WithdrawalReportItem,
  WithdrawalReportPagination,
  WithdrawalReportStatus,
} from "@/types/reports";

type WithdrawalReportTableProps = {
  pagination: WithdrawalReportPagination;
  loading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onPageChange: (page: number, pageSize: number) => void;
};

const statusConfig: Record<
  WithdrawalReportStatus,
  { color: string; icon: React.ReactNode }
> = {
  PENDING: { color: "warning", icon: <ClockCircleOutlined /> },
  COMPLETED: { color: "success", icon: <CheckCircleOutlined /> },
  FAILED: { color: "error", icon: <CloseCircleOutlined /> },
  REJECTED: { color: "error", icon: <CloseCircleOutlined /> },
  CANCELLED: { color: "default", icon: <CloseCircleOutlined /> },
};

const approvalStatusConfig: Record<
  WithdrawalApprovalStatus,
  { color: string; icon?: React.ReactNode }
> = {
  NOT_REQUIRED: { color: "default" },
  PENDING: { color: "warning", icon: <ClockCircleOutlined /> },
  APPROVED: { color: "success", icon: <CheckCircleOutlined /> },
  REJECTED: { color: "error", icon: <CloseCircleOutlined /> },
};

export function WithdrawalReportTable({
  pagination,
  loading,
  hasActiveFilters,
  onResetFilters,
  onPageChange,
}: WithdrawalReportTableProps) {
  const { message } = App.useApp();
  const columns: ColumnsType<WithdrawalReportItem> = [
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
      title: "Type",
      dataIndex: "type",
      width: 145,
      render: () => (
        <Tag color="error" icon={<UploadOutlined />}>
          WITHDRAWAL
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 145,
      render: (status: WithdrawalReportStatus) => (
        <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Trading Account",
      dataIndex: "tradingAccount",
      width: 165,
      render: (tradingAccount: string | null) => (
        <strong className="text-slate-900">{tradingAccount ?? "—"}</strong>
      ),
    },
    {
      title: "Amount",
      width: 150,
      render: (_, transaction) => (
        <strong className="text-slate-900">
          {formatReportAmount(transaction.amount, transaction.currency)}
        </strong>
      ),
    },
    {
      title: "Converted Amount",
      width: 205,
      render: (_, transaction) => (
        <span>
          <strong className="block text-slate-900">
            {formatReportAmount(
              transaction.convertedAmount,
              transaction.convertedCurrency,
            )}
          </strong>
          {transaction.exchangeRate && transaction.exchangeRateSource ? (
            <small className="text-slate-500">
              Rate: {transaction.exchangeRate} ({transaction.exchangeRateSource})
            </small>
          ) : null}
        </span>
      ),
    },
    {
      title: "Approval Status",
      dataIndex: "withdrawalApprovalStatus",
      width: 180,
      render: (status: WithdrawalApprovalStatus) => (
        <Tag
          color={approvalStatusConfig[status].color}
          icon={approvalStatusConfig[status].icon}
        >
          {status.replaceAll("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Payout Method",
      dataIndex: "payoutMethod",
      width: 155,
      render: (payoutMethod: WithdrawalReportItem["payoutMethod"]) =>
        payoutMethod ? <Tag>{payoutMethod}</Tag> : "—",
    },
    {
      title: "Payout Status",
      dataIndex: "payoutStatus",
      width: 155,
      render: (payoutStatus: string | null) =>
        payoutStatus ? <Tag>{payoutStatus}</Tag> : "—",
    },
    {
      title: "Date & Time",
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
        scroll={{ x: 1720 }}
        locale={{
          emptyText: (
            <Empty description="No withdrawal transactions found.">
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
