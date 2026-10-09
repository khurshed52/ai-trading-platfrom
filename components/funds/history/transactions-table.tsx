"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  MoreOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Dropdown, Empty, Pagination, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import type {
  FundsTransaction,
  TransactionStatus,
  TransactionType,
  TransactionsPagination,
} from "@/types/transactions";

type TransactionsTableProps = {
  pagination: TransactionsPagination;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
};

function formatMoney(amount: string, currency: string) {
  const value = Number(amount);
  return `${Number.isFinite(value) ? value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : amount} ${currency}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "—", time: "" };
  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date),
  };
}

const typeConfig: Record<TransactionType, { color: string; icon: React.ReactNode }> = {
  DEPOSIT: { color: "success", icon: <DownloadOutlined /> },
  WITHDRAWAL: { color: "blue", icon: <UploadOutlined /> },
  TRANSFER: { color: "purple", icon: <SwapOutlined /> },
};

const statusConfig: Record<TransactionStatus, { color: string; icon: React.ReactNode }> = {
  PENDING: { color: "warning", icon: <ClockCircleOutlined /> },
  COMPLETED: { color: "success", icon: <CheckCircleOutlined /> },
  FAILED: { color: "error", icon: <ClockCircleOutlined /> },
  CANCELLED: { color: "default", icon: <ClockCircleOutlined /> },
  REJECTED: { color: "error", icon: <ClockCircleOutlined /> },
};

export function TransactionsTable({
  pagination,
  loading,
  onPageChange,
}: TransactionsTableProps) {
  const { message, modal } = App.useApp();

  const columns: ColumnsType<FundsTransaction> = [
    {
      title: "Reference",
      dataIndex: "reference",
      width: 240,
      render: (reference: string) => (
        <span className="flex items-center gap-2 font-medium text-slate-800">
          {reference}
          <Button
            type="text"
            size="small"
            aria-label={`Copy reference ${reference}`}
            icon={<CopyOutlined />}
            onClick={() => {
              void navigator.clipboard.writeText(reference).then(() => {
                void message.success("Reference copied");
              });
            }}
          />
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 135,
      render: (type: TransactionType) => (
        <Tag color={typeConfig[type].color} icon={typeConfig[type].icon}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 145,
      render: (status: TransactionStatus) => (
        <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Account",
      width: 145,
      render: (_, transaction) => {
        const account = transaction.account ?? transaction.destinationAccount ?? transaction.sourceAccount;
        return account ? (
          <span>
            <strong className="block text-slate-900">{account.accountNumber}</strong>
            <small className="text-slate-500">{account.currency}</small>
          </span>
        ) : "—";
      },
    },
    {
      title: "Amount",
      width: 140,
      render: (_, transaction) => (
        <strong className="text-slate-900">
          {formatMoney(transaction.amount, transaction.currency)}
        </strong>
      ),
    },
    {
      title: "Converted Amount",
      width: 190,
      render: (_, transaction) => (
        <span>
          <strong className="block text-slate-900">
            {formatMoney(transaction.convertedAmount, transaction.convertedCurrency)}
          </strong>
          {transaction.conversion ? (
            <small className="text-slate-500">
              Rate: {transaction.conversion.exchangeRate} ({transaction.conversion.exchangeRateSource})
            </small>
          ) : null}
        </span>
      ),
    },
        {
      title: "Date & Time",
      dataIndex: "createdAt",
      width: 160,
      render: (value: string) => {
        const formatted = formatDate(value);
        return (
          <span>
            <strong className="block text-slate-900">{formatted.date}</strong>
            <small className="text-slate-500">{formatted.time}</small>
          </span>
        );
      },
    },
  ];

  const firstItem = pagination.dataCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const lastItem = Math.min(pagination.page * pagination.pageSize, pagination.dataCount);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <Table
        rowKey="transactionId"
        columns={columns}
        dataSource={pagination.pageData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1250 }}
        locale={{ emptyText: <Empty description="No transactions found" /> }}
      />
      <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-slate-500">
          Showing {firstItem} to {lastItem} of {pagination.dataCount} transactions
        </span>
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.dataCount}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onChange={onPageChange}
        />
      </div>
    </section>
  );
}
