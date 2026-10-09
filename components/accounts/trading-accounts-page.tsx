"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightOutlined,
  GlobalOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Empty,
  Input,
  Pagination,
  Result,
  Select,
  Skeleton,
} from "antd";
import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreateTradingAccountModal } from "@/components/accounts/create-trading-account-modal";
import { TradingAccountCard } from "@/components/accounts/trading-account-card";
import { ROUTES } from "@/constants/routes";
import { useTradingAccounts } from "@/hooks/useAccounts";
import type { TradingAccount } from "@/types/accounts";

const PAGE_SIZE = 10;

type AccountSort =
  | "newest"
  | "oldest"
  | "balance-high"
  | "balance-low";

function accountTimestamp(account: TradingAccount) {
  const timestamp = Date.parse(account.createdAt ?? "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function accountBalance(account: TradingAccount) {
  const balance = Number(account.balance);
  return Number.isFinite(balance) ? balance : 0;
}

function AccountsHero({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="relative min-h-[150px] overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(115deg,#f8fbff_0%,#eff7ff_55%,#dcebff_100%)] px-3 py-4 shadow-[0_10px_35px_rgba(37,99,235,0.06)] sm:px-6 sm:py-4">
      <div className="relative z-10 max-w-[700px]">
      
        <h1 className="m-0 text-3xl font-extrabold leading-[1.12] text-slate-950 sm:text-4xl lg:text-[30px]">
          Multiple Accounts.
          <br />
          <span className="text-blue-600">More Opportunities.</span>
        </h1>
        <p className="mb-4 mt-3 max-w-lg text-base leading-6 text-slate-600 sm:text-base">
          Open accounts for different strategies and access global markets from
          one secure workspace.
        </p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onOpen}
           className="!h-12 !rounded-xl !border-blue-400 !font-semibold "
        >
          Open New Account <ArrowRightOutlined />
        </Button>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
      >
        <svg viewBox="0 0 700 300" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="account-wave" x1="0" x2="1">
              <stop offset="0" stopColor="#93c5fd" stopOpacity="0" />
              <stop offset="1" stopColor="#2563eb" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          <path
            d="M0 275 C145 205 205 290 320 190 C415 110 480 150 700 40"
            fill="none"
            stroke="url(#account-wave)"
            strokeWidth="60"
          />
          {[170, 220, 270, 320, 370, 420, 470, 520, 570, 620].map(
            (x, index) => {
              const height = 48 + index * 12;
              return (
                <g key={x}>
                  <line
                    x1={x}
                    x2={x}
                    y1={270 - height - 18}
                    y2={286 - index * 8}
                    stroke="#93c5fd"
                    strokeWidth="2"
                  />
                  <rect
                    x={x - 8}
                    y={270 - height}
                    width="16"
                    height={height}
                    rx="3"
                    fill={index % 3 === 0 ? "#bfdbfe" : "#3b82f6"}
                    opacity={0.62 + index * 0.025}
                  />
                </g>
              );
            },
          )}
        </svg>

        <FeatureChip
          className="right-[38%] top-[20%]"
          icon={<BarChart3 size={24} />}
          title="Flexible Accounts"
          subtitle="Trade your way"
        />
        <FeatureChip
          className="right-[5%] top-[48%]"
          icon={<GlobalOutlined />}
          title="Global Markets"
          subtitle="Multiple opportunities"
        />
     
      </div>
    </section>
  );
}

function FeatureChip({
  className,
  icon,
  title,
  subtitle,
}: {
  className: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={`absolute flex min-w-48 items-center gap-3 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(30,64,175,0.12)] backdrop-blur ${className}`}
    >
      <span className="text-2xl text-blue-600">{icon}</span>
      <span>
        <strong className="block text-sm text-slate-950">{title}</strong>
        <small className="text-xs text-slate-500">{subtitle}</small>
      </span>
    </div>
  );
}

function AccountsLoading() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-100 bg-white p-6"
        >
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ))}
    </div>
  );
}

export function TradingAccountsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<AccountSort>("newest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const accountsQuery = useTradingAccounts({
    page,
    pageSize: PAGE_SIZE,
    filters: {},
  });
  const pagination = accountsQuery.data?.data;

  const visibleAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = (pagination?.pageData ?? []).filter((account) =>
      account.accountNumber.toLowerCase().includes(normalizedSearch),
    );

    return [...filtered].sort((left, right) => {
      switch (sort) {
        case "oldest":
          return accountTimestamp(left) - accountTimestamp(right);
        case "balance-high":
          return accountBalance(right) - accountBalance(left);
        case "balance-low":
          return accountBalance(left) - accountBalance(right);
        case "newest":
        default:
          return accountTimestamp(right) - accountTimestamp(left);
      }
    });
  }, [pagination?.pageData, search, sort]);

  const handleDeposit = (account: TradingAccount) => {
    const searchParams = new URLSearchParams({
      accountId: account.id,
      accountNumber: account.accountNumber,
      platform: account.platform,
      currency: account.currency,
    });

    router.push(`${ROUTES.FUNDS.DEPOSIT}?${searchParams.toString()}`);
  };

  const handleTrade = (account: TradingAccount) => {
    message.info(
      `Trading workspace for account ${account.accountNumber} is not available yet.`,
    );
  };

  return (
    <div className="space-y-7 pb-8">
      <AccountsHero onOpen={() => setCreateModalOpen(true)} />

      <section>
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <h2 className="m-0 text-2xl font-bold text-slate-950">
              All Accounts
            </h2>
            {!accountsQuery.isLoading && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">
                {pagination?.dataCount ?? 0}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Search accounts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="!h-12 !rounded-xl sm:!w-64"
              aria-label="Search accounts by account number"
            />
            <Select<AccountSort>
              value={sort}
              onChange={setSort}
              className="!h-12 sm:!w-52"
              aria-label="Sort accounts"
              options={[
                { value: "newest", label: "Sort by: Newest" },
                { value: "oldest", label: "Sort by: Oldest" },
                { value: "balance-high", label: "Balance: High to Low" },
                { value: "balance-low", label: "Balance: Low to High" },
              ]}
            />
          </div>
        </div>

        {search && (pagination?.pageCount ?? 0) > 1 && (
          <p className="-mt-2 mb-4 text-xs text-slate-500">
            Search is applied to the accounts on this page.
          </p>
        )}

        {accountsQuery.isLoading ? (
          <AccountsLoading />
        ) : accountsQuery.isError ? (
          <Result
            status="error"
            title="We couldn’t load your trading accounts"
            subTitle={accountsQuery.error.message}
            extra={
              <Button type="primary" onClick={() => accountsQuery.refetch()}>
                Try Again
              </Button>
            }
          />
        ) : (pagination?.dataCount ?? 0) === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-14">
            <Empty
              description={
                <span>
                  <strong className="block text-base text-slate-800">
                    No Trading Accounts Yet
                  </strong>
                  <span className="text-slate-500">
                    Create your first trading account to get started.
                  </span>
                </span>
              }
            >
              <Button type="primary" onClick={() => setCreateModalOpen(true)}>
                Open New Account
              </Button>
            </Empty>
          </div>
        ) : visibleAccounts.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-14">
            <Empty description="No matching accounts found">
              <Button onClick={() => setSearch("")}>Clear Search</Button>
            </Empty>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleAccounts.map((account) => (
              <TradingAccountCard
                key={account.id}
                account={account}
                onTrade={handleTrade}
                onDeposit={handleDeposit}
              />
            ))}
          </div>
        )}

        {(pagination?.pageCount ?? 0) > 1 && (
          <div className="mt-7 flex justify-center">
            <Pagination
              current={pagination?.page ?? page}
              pageSize={pagination?.pageSize ?? PAGE_SIZE}
              total={pagination?.dataCount ?? 0}
              showSizeChanger={false}
              onChange={(nextPage) => {
                setPage(nextPage);
                setSearch("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </section>

      <CreateTradingAccountModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setPage(1);
          setCreateModalOpen(false);
        }}
      />
    </div>
  );
}
