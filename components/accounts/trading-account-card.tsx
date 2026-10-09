"use client";

import {
  ArrowRightOutlined,
  DesktopOutlined,
  RiseOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import { Coins } from "lucide-react";

import type { TradingAccount } from "@/types/accounts";
import Image from "next/image";
type TradingAccountCardProps = {
  account: TradingAccount;
  onTrade: (account: TradingAccount) => void;
  onDeposit: (account: TradingAccount) => void;
};

function formatBalance(account: TradingAccount) {
  const balance = Number(account.balance);

  if (!Number.isFinite(balance)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
}

function formatStatus(status: string) {
  return status
    .trim()
    .toLowerCase()
    .replace(/(^|[_\s-])\w/g, (value) => value.toUpperCase()) || "Unknown";
}

export function TradingAccountCard({
  account,
  onTrade,
  onDeposit,
}: TradingAccountCardProps) {
  const isActive = account.status.trim().toUpperCase() === "ACTIVE";

  return (
    <Card
      bordered={false}
      className="h-full !rounded-2xl !border !border-slate-100 !bg-white !shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
      styles={{ body: { padding: 14, height: "100%" } }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <h3 className="m-0 truncate text-base font-bold text-slate-950">
            {account.accountNumber}
          </h3>
          <span
            className={[
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold",
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            ].join(" ")}
          >
            <span
              className={[
                "size-2 rounded-full",
                isActive ? "bg-emerald-500" : "bg-amber-500",
              ].join(" ")}
            />
            {formatStatus(account.status)}
          </span>
        </div>

        <dl className="my-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-3 text-sm text-slate-500">
              <DesktopOutlined className="text-lg text-indigo-500" />
              Platform
            </dt>
            <dd className="m-0 flex items-center gap-2 font-semibold text-slate-950">
             <Image
                src={`/images/icons/${account.platform.toLowerCase()}.svg`}
                alt={account.platform}
                width={30}
                height={30}
                className="rounded-full"
              />
              {account.platform}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-3 text-sm text-slate-500">
              <Coins size={19} className="text-indigo-500" />
              Currency
            </dt>
            <dd className="m-0 font-semibold text-slate-950">
              {account.currency}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="flex items-center gap-3 text-sm text-slate-500">
              <WalletOutlined className="text-lg text-indigo-500" />
              Balance
            </dt>
            <dd className="m-0 text-base font-bold text-slate-950">
              {formatBalance(account)}
            </dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Button
            icon={<RiseOutlined />}
            onClick={() => onTrade(account)}
            className="!h-10 !rounded-xl !font-semibold mt-2"
          >
            Trade <ArrowRightOutlined />
          </Button>
          <Button
           type="primary"
            icon={<WalletOutlined />}
            onClick={() => onDeposit(account)}
            className="!h-10 !rounded-xl !border-blue-400 !font-semibold  mt-2"
          >
            Deposit
          </Button>
        </div>
      </div>
    </Card>
  );
}
