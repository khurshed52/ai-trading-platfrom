"use client";

import { Select } from "antd";
import { WalletCards } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { accountBalanceData } from "./dashboard-mock-data";

export function AccountBalancesCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <WalletCards className="mt-0.5 text-slate-950" size={25} />
          <div>
            <h2 className="font-bold text-slate-950">
              Trading Account Balances
            </h2>
            <p className="text-xs text-slate-500">
              Current balances by trading account (USD)
            </p>
          </div>
        </div>
        <Select
          aria-label="Balance grouping"
          defaultValue="account"
          className="w-full sm:w-36"
          options={[{ label: "By Account", value: "account" }]}
        />
      </header>

      <div className="overflow-x-auto px-3 py-4 sm:px-6">
        <div className="h-56 min-w-[640px] max-w-5xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={accountBalanceData}
              margin={{ top: 28, right: 10, left: 8, bottom: 16 }}
            >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1677ff" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5eaf1" vertical={false} />
              <XAxis
                dataKey="account"
                tick={{ fill: "#526581", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#526581", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                labelFormatter={(account) => `Account ${account}`}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar
                dataKey="balance"
                name="Balance"
                fill="url(#balanceGradient)"
                radius={[5, 5, 0, 0]}
                maxBarSize={190}
              >
                <LabelList
                  dataKey="balance"
                  position="top"
                  formatter={(value) =>
                    typeof value === "number"
                      ? `$${value.toLocaleString()}.00`
                      : String(value ?? "")
                  }
                  style={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
