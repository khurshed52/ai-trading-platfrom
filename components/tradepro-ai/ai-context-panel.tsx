"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Empty, Skeleton, Tag } from "antd";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  BookOpen,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { useAllTradingAccounts } from "@/hooks/useAccounts";
import { useFundsTransactions } from "@/hooks/useTransactions";
import { useUserDetail } from "@/hooks/useUser";

type AiContextPanelProps = {
  onAsk: (prompt: string) => void;
};

const askItems = [
  { title: "My Accounts", description: "Trading accounts and account details", prompt: "Show my trading accounts", icon: WalletCards },
  { title: "Funds & Transactions", description: "Deposits, withdrawals, and transaction history", prompt: "Show my recent transactions", icon: Landmark },
  { title: "KYC Verification", description: "Verification status and required steps", prompt: "Check my KYC progress", icon: ShieldCheck },
  { title: "Trading Education", description: "Learn forex, leverage, margin, and more", prompt: "Teach me about leverage", icon: BookOpen },
];

const baseQuickActions = [
  {
    label: "Open Trading Accounts",
    description: "Create a new MT4 or MT5 account",
    href: ROUTES.ACCOUNTS.ROOT,
    icon: WalletCards,
    iconStyle: "bg-blue-50 text-blue-600",
  },
  {
    label: "Deposit Funds",
    description: "Fund your account securely",
    href: ROUTES.FUNDS.DEPOSIT,
    icon: ArrowDownCircle,
    iconStyle: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Withdraw Funds",
    description: "Request a withdrawal",
    href: ROUTES.FUNDS.WITHDRAW,
    icon: ArrowUpCircle,
    iconStyle: "bg-rose-50 text-rose-600",
  },
];

export function AiContextPanel({ onAsk }: AiContextPanelProps) {
  const userQuery = useUserDetail();
  const accountsQuery = useAllTradingAccounts();
  const transactionsQuery = useFundsTransactions({
    page: 1,
    pageSize: 3,
    filters: {},
  });
  const accounts = accountsQuery.data?.data ?? [];
  const transactions = transactionsQuery.data?.data.pageData ?? [];
  const isVerified = userQuery.data?.data.status === "APPROVED";
  const verificationAction = isVerified
    ? {
        label: "View Profile",
        description: "View your verified account details",
        href: ROUTES.PROFILE.ROOT,
        icon: ShieldCheck,
        iconStyle: "bg-emerald-50 text-emerald-600",
      }
    : {
        label: "Complete Verification",
        description: "Continue your KYC process",
        href: ROUTES.PROFILE.KYC,
        icon: ShieldCheck,
        iconStyle: "bg-blue-50 text-blue-600",
      };
  const quickActions = [...baseQuickActions, verificationAction];

  return (
    <aside className="space-y-4">
      <Panel title="Ask About">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {askItems.map(({ title, description, prompt, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => onAsk(prompt)}
              className="flex min-h-[96px] items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/60"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={17} />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-xs font-semibold text-slate-900">{title}</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Quick Actions">
        <div className="divide-y divide-slate-100">
          {quickActions.map(({ label, description, href, icon: Icon, iconStyle }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 py-2.5 text-slate-700 hover:text-blue-600"
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{label}</span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                  {description}
                </span>
              </span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Your Accounts" action={<Link href={ROUTES.ACCOUNTS.ROOT}>View All</Link>}>
        {accountsQuery.isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : accountsQuery.isError ? (
          <StateText>Accounts are temporarily unavailable.</StateText>
        ) : accounts.length ? (
          <div className="space-y-2">
            {accounts.slice(0, 2).map((account) => (
              <Link
                key={account.id}
                href={ROUTES.ACCOUNTS.ROOT}
                className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 hover:border-blue-200"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[10px] font-bold text-blue-700">
                  {account.platform}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-xs font-semibold text-slate-900">{account.accountNumber}</p>
                  <p className="m-0 text-[10px] text-slate-500">
                    Balance {formatAmount(account.balance, account.currency)}
                  </p>
                </div>
                <Tag color={account.status === "ACTIVE" ? "success" : "default"} className="!m-0 !text-[9px]">{account.status}</Tag>
              </Link>
            ))}
          </div>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No accounts" />}
      </Panel>

      <Panel title="Recent Activity" action={<Link href={ROUTES.FUNDS.HISTORY}>View All</Link>}>
        {transactionsQuery.isLoading ? <Skeleton active paragraph={{ rows: 2 }} /> : transactionsQuery.isError ? (
          <StateText>Activity is temporarily unavailable.</StateText>
        ) : transactions.length ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const incoming = transaction.type === "DEPOSIT";
              const outgoing = transaction.type === "WITHDRAWAL";
              const amountColor = incoming
                ? "text-emerald-600"
                : outgoing
                  ? "text-rose-600"
                  : "text-blue-600";
              const amountPrefix = incoming ? "+" : outgoing ? "-" : "";
              return (
                <Link
                  key={transaction.transactionId}
                  href={ROUTES.FUNDS.HISTORY}
                  className="flex items-center gap-2.5 py-2.5 text-xs"
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${incoming ? "bg-emerald-50 text-emerald-500" : outgoing ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"}`}>
                    {incoming ? <ArrowDownCircle size={17} /> : <ArrowUpCircle size={17} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-600">{transaction.type}</span>
                    <span className="block text-[9px] text-slate-400">{formatDate(transaction.createdAt)}</span>
                  </span>
                  <span className={`whitespace-nowrap font-semibold ${amountColor}`}>
                    {amountPrefix}{formatAmount(transaction.amount, transaction.currency)}
                  </span>
                  <Tag color={transaction.status === "COMPLETED" ? "success" : transaction.status === "PENDING" ? "warning" : "default"} className="!m-0 !text-[9px]">{transaction.status}</Tag>
                </Link>
              );
            })}
          </div>
        ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No recent activity" />}
      </Panel>
    </aside>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-sm font-semibold text-slate-950">{title}</h2>
        {action ? <Button type="link" size="small" className="!h-auto !p-0 !text-xs">{action}</Button> : null}
      </header>
      {children}
    </section>
  );
}

function StateText({ children }: { children: ReactNode }) {
  return <p className="m-0 py-3 text-center text-xs text-slate-500">{children}</p>;
}

function formatAmount(value: string, currency: string) {
  const amount = Number(value);
  return `${Number.isFinite(amount) ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value} ${currency}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
