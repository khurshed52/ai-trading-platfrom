"use client";

import { Select } from "antd";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { transactionActivityData } from "./dashboard-mock-data";

function formatAxisValue(value: number) {
  if (value === 0) return "$0";
  return `$${value / 1000}k`;
}

export function TransactionActivityCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 text-slate-950" size={25} />
          <div>
            <h2 className="font-bold text-slate-950">Transaction Activity</h2>
            <p className="text-xs text-slate-500">
              Overview of your deposits, withdrawals, and transfers
            </p>
          </div>
        </div>
        <Select
          aria-label="Transaction activity period"
          defaultValue="6-months"
          className="w-full sm:w-36"
          options={[{ label: "Last 6 months", value: "6-months" }]}
        />
      </header>

      <div className="overflow-x-auto px-2 py-4 sm:px-4">
        <div className="h-64 min-w-[620px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transactionActivityData} margin={{ top: 12, right: 8 }}>
              <CartesianGrid stroke="#e5eaf1" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatAxisValue}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingBottom: 14 }}
              />
              <Bar
                dataKey="deposits"
                name="Deposits"
                fill="#08ad6c"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
              <Bar
                dataKey="withdrawals"
                name="Withdrawals"
                fill="#f04448"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
              <Bar
                dataKey="transfers"
                name="Transfers"
                fill="#1677ff"
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
